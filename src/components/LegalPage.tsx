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