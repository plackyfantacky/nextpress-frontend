// scripts/build--generate-static-html.tsx
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import prettier from "prettier";

// 👇 local path helper (avoids import.meta.url issues)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 use explicit relative paths (no aliasing)
import blockData from "../data/block-data-sample-01-07-2025.json" assert { type: "json" };
import { renderBlocksRecursively } from "../src/lib/blocks/index.js";

const OUTPUT_DIR = path.resolve(__dirname, "../.safelist");

// Hardcoded slug list for now
const pages = [{ slug: "index", dataKey: [0, 2, 4] }];

// Render HTML for a single page
async function renderPage(slug, dataKeys) {
    const pagePath = path.join(OUTPUT_DIR, `${slug}.html`);
    const blocks = dataKeys.map((key) => blockData[key]).filter(Boolean);
    const children = await renderBlocksRecursively(blocks);
    const html = renderToStaticMarkup(<>{children}</>);
    const prettyHTML = await prettier.format(html, { parser: "html" });

    // Create directories if needed
    const dir = path.dirname(pagePath);
    fs.mkdirSync(dir, { recursive: true });
    // Save HTML to file
    fs.writeFileSync(pagePath, prettyHTML);
    console.log(
        `✅ Generated HTML for /${slug} → ${path.relative(process.cwd(), pagePath)}`,
    );
}

// Main
(async () => {
    for (const { slug, dataKey } of pages) {
        await renderPage(slug, dataKey);
    }
})();
