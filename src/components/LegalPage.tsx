import { createElement, Fragment, useEffect, type ReactNode } from "react";
import Logo from "../assets/logo.png";
import "./Home.css";
import "./LegalPage.css";

type LegalPageProps = {
  title: string;
  introduction: string;
};

const FORMATTING_TAGS = new Set(["b", "strong", "i", "em", "u", "br"]);

function renderLegalText(markup: string): ReactNode[] {
  const parsed = new DOMParser().parseFromString(markup, "text/html");

  const renderNodes = (nodes: NodeListOf<ChildNode>): ReactNode[] =>
    Array.from(nodes, (node, index) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }

      const element = node as HTMLElement;
      const children = renderNodes(element.childNodes);
      const tag = element.tagName.toLowerCase();

      if (FORMATTING_TAGS.has(tag)) {
        return createElement(tag, { key: index }, ...children);
      }

      return createElement(Fragment, { key: index }, ...children);
    });

  return renderNodes(parsed.body.childNodes);
}

export default function LegalPage({ title, introduction }: LegalPageProps) {
  useEffect(() => {
    document.title = `${title} | Penny`;
  }, [title]);

  return (
    <div className="legal-page">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand-wrap" href="/" aria-label="Penny sākumlapa">
            <img src={Logo} alt="Penny" className="brand-logo" />
          </a>
        </div>
      </header>

      <main className="legal-content">
        <a className="legal-back-link" href="/">← Atpakaļ uz sākumlapu</a>
        <h1>{title}</h1>
        <p>{renderLegalText(introduction)}</p>
      </main>

      <footer className="site-footer legal-footer">
        <div className="site-footer-inner legal-footer-inner">
          <div className="site-footer-legal">
            <img src={Logo} alt="Penny" className="site-footer-logo" />
            <p className="site-footer-copyright">
              © {new Date().getFullYear()} Penny. Visas tiesības aizsargātas.
            </p>
            <nav className="site-footer-social" aria-label="Sociālie tīkli">
              <a href="https://www.facebook.com/getpenny.lv/" target="_blank" rel="noreferrer" aria-label="Penny Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z" /></svg>
              </a>
              <a href="https://www.instagram.com/getpenny.lv/" target="_blank" rel="noreferrer" aria-label="Penny Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="site-footer-social-dot" cx="17.7" cy="6.5" r="1" /></svg>
              </a>
              <a href="https://www.tiktok.com/@getpenny.lv" target="_blank" rel="noreferrer" aria-label="Penny TikTok">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 3c.3 2.2 1.5 3.5 3.4 3.7v3.2a8.4 8.4 0 0 1-3.4-.9v6.2a6.1 6.1 0 1 1-6.1-6.1c.4 0 .8 0 1.2.1v3.4a2.8 2.8 0 1 0 1.6 2.6V3h3.3Z" /></svg>
              </a>
              <a href="https://x.com/getpenny_lv" target="_blank" rel="noreferrer" aria-label="Penny on X">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 3H22l-6.8 7.8L23.2 21h-6.3L12 14.8 6.5 21H3.4l7.3-8.4L2.8 3h6.4l4.4 5.8L18.9 3Zm-1.1 16h1.7L8.3 4.9H6.5L17.8 19Z" /></svg>
              </a>
            </nav>
            <p>
              <a href="/privacy">Privātuma politika</a>
              <span aria-hidden="true"> · </span>
              <a href="/terms">Lietošanas noteikumi</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}