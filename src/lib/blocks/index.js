import React from 'react';
import {extractTextFromTag, extractAttributeValue, normalizeClassNames, convertBlockNames as convertBlockNames } from '../utils';

const blockRenderers = {
    'core/cover': () => import('./blockCover'),
    'core/group': () => import('./blockGroup'),
    'core/columns': () => import('./blockColumns'),
    'core/column': () => import('./blockColumn'),
    'core/media-text': () => import('./blockMediaText'),
    'core/image': () => import('./blockImage'),
    'core/post-title': () => import('./blockPostTitle'),
    'core/heading': () => import('./blockHeading'),
    'core/paragraph': () => import('./blockParagraph'),
    'core/quote': () => import('./blockQuote'),

    // Add other block renderers here
};

/**
 * Parses the JSON block data.
 * @param {*} blockData 
 * @return {Array} An array of parsed blocks.
 */
export function parseBlocks(blockData) {
    if (!blockData || typeof blockData !== 'string') return [];

    try {
        const parsed = JSON.parse(blockData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error parsing block data:', error, blockData?.slice?.(0, 100)); //we don't need that much data
        return [];
    }
}

/**
 * Renders a single block component based on its type.
 * @param {Object} block - The block data to render.
 * @param {string} keyPrefix - A prefix for the key of the rendered component.
 * @param {Object} postContext - Context for the post, if needed.
 * @returns {Promise<React.Component|null>} A React component representing the block, or null if not handled.
 */
export async function renderBlock(block, keyPrefix = 'block', postContext = {}) {
    let { blockName, innerBlocks = [], innerHTML } = block;
    if (!blockName && (!innerHTML || innerHTML.trim() === '')) { return null; };

    const rawClass = extractAttributeValue({ html: innerHTML, attribute: 'class'});
    const normalizedClassNames = normalizeClassNames(rawClass);
    
    blockName = convertBlockNames(blockName);
    const renderer = blockRenderers[blockName];

    console.log('blockName', blockName);
    

    if (!renderer) {
        console.warn(`Unhandled block type: ${blockName}`);
        return null;
    }

    const children = await renderBlocksRecursively({blocks: innerBlocks, keyPrefix: keyPrefix, postContext: postContext});
    const { default: Component } = await renderer();

    return (
        <Component
            keyPrefix={`${keyPrefix}-${Math.random().toString(36).substring(2, 8)}`} // to pass to children
            block={{ ...block, blockName, normalizedClassNames }}
            postContext={postContext}
            children={children}
        />
    );
}

/**
 * Recursively renders an array of blocks.
 * @param {Array} blocks - The array of blocks to render.
 * @param {string} keyPrefix - A prefix for the keys of the rendered components.
 * @param {Object} postContext - Context for the post, if needed.
 * @returns {Promise<Array>} An array of rendered block components.
 */
export async function renderBlocksRecursively({blocks, keyPrefix, postContext}) {
    const rendered = await Promise.all(
        blocks.map((block, i) =>
            renderBlock({block: block, keyPrefix: `${keyPrefix}-${i}`, postContext: postContext})
        )
    );
    return rendered.filter(Boolean);
}