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

            // Extract style="width: ..." from innerHTML
            const styleMatches = innerHTML.match(/style="([^"]+)"/g) || [];
            for (const styleMatch of styleMatches) {
                const styleContent = styleMatch.replace(/^style="/, '').replace(/"$/, '');
                const widthMatch = styleContent.match(/width:\s*([\d.]+(px|rem|em|%)?)/);
                if (widthMatch) {
                    classNames.add(`w-[${widthMatch[1]}]`);
                }
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

    return Array.from(classNames).filter(cls => {
        return !/^wp-image-\d+$/.test(cls) &&
            !/^wp-block-/.test(cls) &&
            !/^wp-element-/.test(cls) &&
            !/^has-[\w-]+(-(color|background-color|font-size|dim|gradient|border-color|text-align))?$/.test(cls) &&
            !/^align(left|right|center|wide|full)$/.test(cls) &&
            !/^is-/.test(cls);
    }).filter(Boolean);
}

async function runSafelistBuild() {
    console.log('🔄 Fetching block data...');
    const blockJSONs = await fetchAllPageBlockJSON();

    console.log(`🔍 Processing ${blockJSONs.length} pages...`);
    const classNames = extractClassNamesFromBlockJSON(blockJSONs);

    const outputPath = path.resolve('./src/app/safelist.css');

    const lines = classNames
        .sort()
        .map(cls => `@source inline("${cls}");`)
        .join('\n') + '\n';

    fs.writeFileSync(outputPath, lines);
    console.log(`✅ Wrote ${classNames.length} classes to ${outputPath}`);
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

runSafelistBuild();