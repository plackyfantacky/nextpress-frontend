import {extractTextFromTag, normalizeClassNames, normalizeBlockName, extractAttributeValue } from '../utils';

const blockRenderers = {
    'core/cover': () => import('./blockCover'),
    'core/group': () => import('./blockGroup'),
    'core/columns': () => import('./blockColumns'),
    'core/column': () => import('./blockColumn'),
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

export async function renderBlock(block, keyPrefix = 'block', postContext = {}) {
    const { attrs = {}, blockName, innerBlocks = [], innerHTML } = block;
    if (!blockName && (!innerHTML || innerHTML.trim() === '')) { return null; }

    const normalizedClassNames = normalizeClassNames(extractAttributeValue({html: innerHTML, attribute: 'class'}) || '');
    const blockClassName = normalizeBlockName(blockName);
    const idAttribute = extractAttributeValue({html: innerHTML, attribute: 'id'}) || '';
    //TO DO: investigate if its possible for WordPress to allow attributes to be passed in the block data.
    // If so, we'll need to handle that here.

    const renderer = blockRenderers[blockName];
    if (!renderer) {
        console.warn(`Unhandled block type: ${blockName}`);
        return null;
    }

    const children = await renderBlocksRecursively(innerBlocks, keyPrefix, postContext);
    const { default: Component } = await renderer();

    return (
        <Component
            key={keyPrefix}
            keyPrefix={`${keyPrefix}-${Math.random().toString(36).substring(2, 8)}`}
            block={{ ...block, idAttribute, blockClassName, normalizedClassNames }}
            postContext={postContext}
            children={children}
        />
    );

}

export async function renderBlocksRecursively(blocks, keyPrefix, postContext) {
    const rendered = await Promise.all(
        blocks.map((block, i) =>
            renderBlock(block, `${keyPrefix}-${i}`, postContext)
        )
    );
    return rendered.filter(Boolean);
}