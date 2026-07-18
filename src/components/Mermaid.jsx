import { useEffect, useRef } from "react";
import mermaid from "mermaid";

const lightVars = {
  background: "#ffffff",
  primaryColor: "#e9edea",
  primaryTextColor: "#182220",
  primaryBorderColor: "#c3ccc6",
  lineColor: "#5c6b66",
  secondaryColor: "#fbf1e1",
  tertiaryColor: "#f3f5f2",
  textColor: "#182220",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
};

const darkVars = {
  background: "#161d1a",
  primaryColor: "#1b2320",
  primaryTextColor: "#e7ece8",
  primaryBorderColor: "#34423a",
  lineColor: "#8fa39b",
  secondaryColor: "#241c10",
  tertiaryColor: "#101513",
  textColor: "#e7ece8",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
};

const isDark =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "strict",
  themeVariables: isDark ? darkVars : lightVars,
});

let diagramCount = 0;

function Mermaid({ chart }) {
  const containerRef = useRef(null);
  const idRef = useRef(`mermaid-diagram-${diagramCount++}`);

  useEffect(() => {
    let cancelled = false;
    mermaid.render(idRef.current, chart).then(({ svg }) => {
      if (!cancelled && containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return <div className="mermaid-diagram" ref={containerRef} />;
}

export default Mermaid;
