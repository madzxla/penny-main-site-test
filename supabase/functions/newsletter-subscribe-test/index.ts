import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedOrigins = new Set([
  "https://getpenny.lv",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function requestCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("Origin");
  return {
    ...corsHeaders,
    ...(origin && allowedOrigins.has(origin)
      ? { "Access-Control-Allow-Origin": origin }
      : {}),
    Vary: "Origin",
  };
}

function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
): Response {
  return Response.json(body, { status, headers: requestCorsHeaders(req) });
}

type EmailValidation = {
  valid: boolean;
  reason?: "syntax" | "domain" | "dns_unavailable";
};

async function validateEmail(
  input: string,
): Promise<EmailValidation> {
  const email = input.trim();

  if (email.length > 320 || email.length === 0) {
    return { valid: false, reason: "syntax" };
  }

  const at = email.lastIndexOf("@");

  if (at <= 0 || at !== email.indexOf("@")) {
    return { valid: false, reason: "syntax" };
  }

  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();

  if (
    local.length > 64 ||
    domain.length > 253 ||
    !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  ) {
    return { valid: false, reason: "syntax" };
  }

  const labels = domain.split(".");

  if (
    labels.length < 2 ||
    labels.some(
      (label) =>
        label.length < 1 ||
        label.length > 63 ||
        !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label),
    )
  ) {
    return { valid: false, reason: "domain" };
  }

  try {
    // MX is preferred for mail delivery.
    const mx = await Deno.resolveDns(domain, "MX");

    if (mx.length > 0) {
      // A null MX explicitly means the domain accepts no email.
      if (
        mx.length === 1 &&
        mx[0].exchange === "."
      ) {
        return { valid: false, reason: "domain" };
      }

      return { valid: true };
    }
  } catch {
    // No MX record may mean fallback is possible.
    // A DNS outage must not automatically be treated
    // as proof that the domain is invalid.
  }

  try {
    const [a, aaaa] = await Promise.allSettled([
      Deno.resolveDns(domain, "A"),
      Deno.resolveDns(domain, "AAAA"),
    ]);

    const hasA = a.status === "fulfilled" && a.value.length > 0;
    const hasAAAA =
      aaaa.status === "fulfilled" && aaaa.value.length > 0;

    if (hasA || hasAAAA) {
      return { valid: true };
    }

    if (
      a.status === "rejected" &&
      aaaa.status === "rejected"
    ) {
      return { valid: false, reason: "dns_unavailable" };
    }

    return { valid: false, reason: "domain" };
  } catch {
    return { valid: false, reason: "dns_unavailable" };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: requestCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: "Invalid JSON" }, 400);
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    typeof (body as { email?: unknown }).email !== "string" ||
    (body as { termsConsent?: unknown }).termsConsent !== true ||
    typeof (body as { "cf-turnstile-response"?: unknown })[
      "cf-turnstile-response"
    ] !== "string"
  ) {
    return jsonResponse(req,
      { error: "A valid email address and consent are required" },
      400,
    );
  }

  const email = (body as { email: string }).email
    .trim()
    .toLowerCase();
  const turnstileToken = (body as { "cf-turnstile-response": string })[
    "cf-turnstile-response"
  ];

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const turnstileSecret = Deno.env.get("TURNSTILE_SECRET");
  const expectedHostnames = new Set(
    (Deno.env.get("TURNSTILE_HOSTNAMES") ?? "")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean),
  );

  if (!url || !serviceKey || !turnstileSecret || expectedHostnames.size === 0) {
    console.error("Newsletter function configuration is incomplete");
    return jsonResponse(req, { error: "Unable to process request" }, 500);
  }

  if (turnstileToken.length === 0 || turnstileToken.length > 2048) {
    return jsonResponse(
      req,
      { error: "Lūdzu, pabeidz drošības pārbaudi." },
      400,
    );
  }

  let turnstileResult: {
    success?: boolean;
    action?: string;
    hostname?: string;
  };

  try {
    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10_000),
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
        }),
      },
    );

    if (!verifyResponse.ok) {
      throw new Error(`Turnstile siteverify returned ${verifyResponse.status}`);
    }

    turnstileResult = await verifyResponse.json();
  } catch (error) {
    console.error("Turnstile verification request failed:", error);
    return jsonResponse(
      req,
      { error: "Drošības pārbaude īslaicīgi nav pieejama." },
      503,
    );
  }

  if (
    turnstileResult.success !== true ||
    turnstileResult.action !== "newsletter" ||
    !turnstileResult.hostname ||
    !expectedHostnames.has(turnstileResult.hostname.toLowerCase())
  ) {
    return jsonResponse(
      req,
      { error: "Drošības pārbaude neizdevās. Mēģini vēlreiz." },
      403,
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const validation = await validateEmail(email);

  if (!validation.valid) {
    const status =
      validation.reason === "dns_unavailable" ? 503 : 400;

    return jsonResponse(req,
      {
        error:
          validation.reason === "dns_unavailable"
            ? "Mēs nevarējām pārbaudīt šo e-pasta adresi. Lūdzu, mēģiniet vēlreiz."
            : "Lūdzu ievadiet derīgu e-pasta adresi.",
      },
      status,
    );
  }

  const { error } = await admin
    .from("newsletter_subscribers")
    .insert({
      email,
      status: "pending",
      source: "test",
    });

  if (error?.code === "23505") {
    return jsonResponse(req, {
      message: "Pārbaudi savu e-pasta adresi, lai apstiprinātu abonementu!",
    });
  }

  if (error) {
    console.error("Newsletter insert failed:", error.code);

    return jsonResponse(req, { error: "Neizdevās apstrādāt pieteikumu." }, 500);
  }

  return jsonResponse(req, {
    message: "Pārbaudi savu e-pasta adresi, lai apstiprinātu abonementu!",
  });
});