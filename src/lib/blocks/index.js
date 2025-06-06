import { extractTextAndClasses, normalizeBlockClassName } from '../utils';

const blockRenderers = {
    'core/cover': () => import('./blockCover'),
    'core/group': () => import('./blockGroup'),
    'core/columns': () => import('./blockColumns'),
    'core/column': () => import('./blockColumn'),
    
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

    const { text, blockClassName: rawClass } = extractTextAndClasses(innerHTML);
    const blockClassName = normalizeBlockClassName(rawClass);
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
            block={{...block, blockClassName, text}}
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