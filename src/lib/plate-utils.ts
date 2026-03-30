import type { Value } from "platejs";

/**
 * Extract headings from Plate value for table of contents.
 * This is a pure function — no React/browser dependencies — so it can run on the server.
 */
export function extractPlateHeadings(
  value: Value
): { text: string; slug: string; level: number }[] {
  const headings: { text: string; slug: string; level: number }[] = [];

  for (const node of value) {
    if (node.type === "h2" || node.type === "h3") {
      const text = extractText(node);
      if (text) {
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        headings.push({
          text,
          slug,
          level: node.type === "h2" ? 2 : 3,
        });
      }
    }
  }

  return headings;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(node: any): string {
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join("");
  }
  return "";
}
