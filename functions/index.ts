interface PagesContext {
  request: Request;
  env: {
    ASSETS: {
      fetch(request: Request): Promise<Response>;
    };
  };
  next(): Promise<Response>;
}

function acceptsMarkdown(accept: string | null): boolean {
  return (
    accept?.split(",").some((mediaRange) => {
      const [mediaType, ...parameters] = mediaRange.split(";");
      if (mediaType.trim().toLowerCase() !== "text/markdown") return false;

      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().toLowerCase().startsWith("q="),
      );
      if (!qualityParameter) return true;

      const quality = Number(qualityParameter.trim().slice(2));
      return Number.isFinite(quality) && quality > 0 && quality <= 1;
    }) ?? false
  );
}

export async function onRequest({
  request,
  env,
  next,
}: PagesContext): Promise<Response> {
  if (
    !["GET", "HEAD"].includes(request.method) ||
    new URL(request.url).pathname !== "/" ||
    !acceptsMarkdown(request.headers.get("Accept"))
  ) {
    return next();
  }

  const markdownUrl = new URL("/index.md", request.url);
  const markdownResponse = await env.ASSETS.fetch(
    new Request(markdownUrl, request),
  );
  const headers = new Headers(markdownResponse.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set(
    "Vary",
    [...new Set([...(headers.get("Vary")?.split(",") ?? []), "Accept"]
      .map((value) => value.trim())
      .filter(Boolean))].join(", "),
  );

  return new Response(markdownResponse.body, {
    status: markdownResponse.status,
    statusText: markdownResponse.statusText,
    headers,
  });
}
