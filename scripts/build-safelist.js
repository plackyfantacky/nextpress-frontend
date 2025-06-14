// scripts/build-safelist.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { exec } from 'child_process';

dotenv.config(); // Load .env for WP_URL

const API_URL = process.env.WP_URL;

if (!API_URL) {
    console.error('❌ WP_URL is not defined in your environment.');
    process.exit(1);
}

async function fetchAllPageBlockJSON() {
    const query = `
    query AllPagesWithBlocks {
      pages(first: 100) {
        edges {
          node {
            id
            slug
            blocksJSON
          }
        }
      }
    }
  `;

    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        dispatch: agent
    });

    if (!res.ok) {
        console.error(`❌ Failed to fetch block data: ${res.statusText}`);
        process.exit(1);
    }

    const json = await res.json();

    return json.data?.pages?.edges?.map(edge => edge.node.blocksJSON) || [];
}

function extractClassNamesFromBlockJSON(blocksJSON) {
    const classNames = new Set();

    function walk(blocks) {
        for (const block of blocks) {
            const { attrs = {}, innerHTML = '', innerBlocks = [] } = block;

            // Add className from attrs
            if (typeof attrs.className === 'string') {
                attrs.className.split(/\s+/).forEach(cls => classNames.add(cls));
            }

            // Extract class="" values from innerHTML
            const htmlMatches = innerHTML.match(/class="([^"]+)"/g) || [];
            for (const match of htmlMatches) {
                match
                    .replace(/class="/, '')
                    .replace(/"/, '')
                    .split(/\s+/)
                    .forEach(cls => classNames.add(cls));
            }

            walk(innerBlocks);
        }
    }

    for (const jsonStr of blocksJSON) {
        try {
            const blocks = JSON.parse(jsonStr);
            walk(blocks);
        } catch {
            console.warn('⚠️ Skipping invalid block JSON');
        }
    }

    return Array.from(classNames);
}

function extractTailwindColorTokens(cssPath) {
    const css = fs.readFileSync(cssPath, 'utf8');
    const colorTokens = [];

    const themeBlock = css.match(/@theme\s+static\s*{([\s\S]*?)}/);
    if (themeBlock) {
        const varMatches = themeBlock[1].matchAll(/--color-([\w-]+):\s*[^;]+;/g);
        for (const match of varMatches) {
            colorTokens.push(match[1]); // just the token name, e.g. inkwell-inception
        }
    }

    return colorTokens;
}

async function runSafelistBuild() {
    console.log('🔄 Fetching block data...');
    const blockJSONs = await fetchAllPageBlockJSON();

    console.log(`🔍 Processing ${blockJSONs.length} pages...`);
    const classNames = extractClassNamesFromBlockJSON(blockJSONs);

    const colorTokens = extractTailwindColorTokens('./src/app/global.css');
    for (const token of colorTokens) {
        classNames.add(`bg-${token}`);
        classNames.add(`text-${token}`);
        classNames.add(`border-${token}`);
    }

    const outputPath = path.resolve('./tailwind.safelist.json');
    fs.writeFileSync(outputPath, JSON.stringify(classNames, null, 2));

    console.log(`✅ Wrote ${classNames.length} class names to ${outputPath}`);
}

const isWatchMode = process.argv.includes('--watch');

if (isWatchMode) {
    console.log('👀 Watch mode enabled. Watching for changes in ./src...');
    const watchExtensions = ['.js', '.jsx', '.json'];
    fs.watch('./src', { recursive: true }, (eventType, filename) => {
        if (watchExtensions.some(ext => filename.endsWith(ext))) {
            console.log(`🔄 Detected change in ${filename}, rebuilding safelist...`);
            exec('npm run safelist');
        }
    });
}

runSafelistBuild()