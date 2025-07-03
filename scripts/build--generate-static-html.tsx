// scripts/build--generate-static-html.tsx
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// 👇 local path helper (avoids import.meta.url issues)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 use explicit relative paths (no aliasing)
import blockData from '../data/block-data-sample-01-07-2025.json' assert { type: 'json' };
import { renderBlocksRecursively } from '../src/lib/blocks/index.js';

const OUTPUT_DIR = path.resolve(__dirname, '../.safelist');

// Hardcoded slug list for now
const pages = [
  { slug: 'index', dataKey: '0' },
  { slug: 'about/team', dataKey: '2' },
  { slug: 'contact', dataKey: '4' },
];

// Render HTML for a single page
async function renderPage(slug, dataKey) {
  const pagePath = path.join(OUTPUT_DIR, `${slug}.html`);

  const children = await renderBlocksRecursively(blockData[dataKey] ? [blockData[dataKey]] : []);
  const html = renderToStaticMarkup(<>{children}</>);

  // Create directories if needed
  const dir = path.dirname(pagePath);
  fs.mkdirSync(dir, { recursive: true });

  // Save HTML to file
  fs.writeFileSync(pagePath, html);
  console.log(`✅ Generated HTML for /${slug} → ${path.relative(process.cwd(), pagePath)}`);
}

// Main
(async () => {
  for (const { slug, dataKey } of pages) {
    await renderPage(slug, dataKey);
  }
})();
