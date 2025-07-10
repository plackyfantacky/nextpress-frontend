// scripts/build--generate-static-html.tsx
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

if (!process.env.WP_URL) {
    throw new Error(
        "WP_URL is not defined. Please set it in your environment variables.",
    );
}

const OUTPUT_DIR = path.resolve(__dirname, "../", process.env.OUTPUT_DIR);

import React from "react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { renderToReadableStream } from "react-dom/server.edge";
import fg from "fast-glob";
import prettier from "prettier";
import { renderBlock } from "../src/lib/blocks/index.js";
import { getAllPagesWithSlugs, getPageBySlug, parseBlocks } from "../src/lib/api.js";

if (fs.existsSync(OUTPUT_DIR)) {
    // Clear output directory
    const stalefiles = await fg(`${OUTPUT_DIR}/**/*.html`);
    stalefiles.forEach((file) => fs.rmSync(file));
    console.log(`🗑️  Removed stale files in ${OUTPUT_DIR}`);
}

// get list of all page slugs
const pages = await getAllPagesWithSlugs();
if (!pages || pages.length === 0) {
    console.warn("⚠️ No pages found. Please check your API connection.");
    process.exit(1);
}
console.log(`📄 Found ${pages.length} pages to process.`);

const pageMeta = pages
    .map((page) => {
        const slug = page?.node?.slug;
        const uri = page?.node?.uri?.replace(/^\/|\/$/g, ""); // strip leading/trailing slash

        const outputPath = uri === "home" ? "index" : uri; // use index.html for home
        return {
            slug,
            uri,
            outputPath,
        };
    })
    .filter((page) => page.uri);

async function readableStreamToString(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
    }

    return result;
}

async function renderPageHTML(uri: string, outputPath: string) {
    const page = await getPageBySlug(uri);
    if (!page || !page.slug || !page.blocksJSON) {
        throw new Error(`Invalid or empty page returned for slug: ${uri}`);
    }

    const postContext = { postSlug: page.slug };
    const blocks = parseBlocks(page.blocksJSON);

    // Render blockdata as HTML
    const renderedBlocks = await Promise.all(
        blocks.map((block, i) => {
            try {
                return renderBlock(block, `block-${i}`, postContext);
            } catch (err) {
                console.warn(
                    `⚠️ Error rendering block[${i}] for ${uri}:`,
                    err.message,
                );
                return null;
            }
        }),
    );

    const stream = await renderToReadableStream(<>{renderedBlocks}</>);
    await stream.allReady;
    const html = await readableStreamToString(stream);

    const prettyHTML = await prettier.format(html, { parser: "html" });

    console.log("");
    console.log("→ outputPath:", outputPath);
    console.log("→ full path:", path.join(OUTPUT_DIR, `${outputPath}.html`));
    console.log("→ html type:", typeof html);
    console.log("→ html length:", html?.length);

    const pagePath = path.join(OUTPUT_DIR, `${outputPath}.html`);

    // Save HTML to file
    fs.mkdirSync(path.dirname(pagePath), { recursive: true });
    fs.writeFileSync(pagePath, prettyHTML);
    console.log(
        `✅ Generated HTML for /${uri} → ${path.relative(process.cwd(), pagePath)}`,
    );
}

// Main
(async () => {
    //for every slug, fetch using getPageBySlug and then parseBlocks(page.blocksJSON), then output that to {slug}.html in the output directory
    for (const { uri, outputPath } of pageMeta) {
        await renderPageHTML(uri, outputPath);
    }
})();
