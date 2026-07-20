import { useEffect, useRef } from "react";
import mermaid from "mermaid";

const lightVars = {
  background: "#ffffff",
  primaryColor: "#e8e5d9",
  primaryTextColor: "#1b1f1a",
  primaryBorderColor: "#c7c0ac",
  lineColor: "#62685f",
  secondaryColor: "#fbf1e1",
  tertiaryColor: "#f0efe6",
  textColor: "#1b1f1a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
};

const darkVars = {
  background: "#1b2123",
  primaryColor: "#20272a",
  primaryTextColor: "#eae6d9",
  primaryBorderColor: "#3d4744",
  lineColor: "#a2ab9e",
  secondaryColor: "#241c10",
  tertiaryColor: "#14181a",
  textColor: "#eae6d9",
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
