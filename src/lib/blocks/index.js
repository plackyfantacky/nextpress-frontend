import { extractTextAndClasses, normalizeBlockName } from '../utils';

const blockRenderers = {
    'core/cover': () => import('./blockCover'),
    'core/group': () => import('./blockGroup'),
    'core/columns': () => import('./blockColumns'),
    'core/column': () => import('./blockColumn'),
    //'core/image': () => import('./blockImage'),
    'core/heading': () => import('./blockHeading'),
    'core/paragraph': () => import('./blockParagraph'),


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
    const { blockName, innerBlocks = [], innerHTML } = block;
    if (!blockName && (!innerHTML || innerHTML.trim() === '')) { return null; }

    const { text, extractedClassNames } = extractTextAndClasses(innerHTML);
    const blockClassName = normalizeBlockName(blockName);
    
    // renderer becomes a function (imported dynamically) that returns a React component.
    const renderer = blockRenderers[blockName]; //still need to reference the WP block name here.

    if (!renderer) {
        console.warn(`Unhandled block type: ${blockName}`);
        return null;
    }

    const children = await renderBlocksRecursively(innerBlocks, keyPrefix, postContext);
    const { default: Component } = await renderer();

    console.log('extractedClassNames:', extractedClassNames);

    return (
        <Component
            key={keyPrefix}
            keyPrefix={`${keyPrefix}-${Math.random().toString(36).substring(2, 8)}`}
            block={{ ...block, blockClassName, extractedClassNames, text }}
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