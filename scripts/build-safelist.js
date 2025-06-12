// scripts/build-safelist.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });

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
    });
}

async function main() {
    console.log('🔄 Fetching block data...');
    const blockJSONs = await fetchAllPageBlockJSON();

    console.log(`🔍 Processing ${blockJSONs.length} pages...`);
    const classNames = extractClassNamesFromBlockJSON(blockJSONs);

    const outputPath = path.resolve('./tailwind.safelist.json');
    fs.writeFileSync(outputPath, JSON.stringify(classNames, null, 2));

    console.log(`✅ Wrote ${classNames.length} class names to ${outputPath}`);
}

fs.watch('./src', { recursive: true }, (eventType, filename) => {
    if (filename.endsWith('.js') || filename.endsWith('.json')) {
        console.log(`🔄 Detected change in ${filename}, rebuilding safelist...`);
        exec('npm run safelist');
    }
});


main();

