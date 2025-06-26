import { normaliseClassNames, normaliseBlockName, extractAttributeValue, preprocessBlock } from '../utils';

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
    'core/code': () => import('./blockCode'),
    'core/preformatted': () => import('./blockPreformatted'),
    'core/list': () => import('./blockList'),
    'core/list-item': () => import('./blockListItem'),
    'core/table': () => import('./blockTable'),
    'core/pullquote': () => import('./blockPullquote'),
    'core/details': () => import('./blockDetails'),
    'core/media-text': () => import('./blockMediaText'),

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

export async function renderBlock(block, keyPrefix = 'block', postContext = {}, inheritedProps = {}) {
    const { blockName, innerBlocks = [], innerHTML } = block;
    if (!blockName && (!innerHTML || innerHTML.trim() === '')) { return null; }

    block = preprocessBlock(block);
    
    const wrapperTag = block.wrapperTag || '';
    const normalisedClassNames = normaliseClassNames(extractAttributeValue({html: innerHTML, tag: wrapperTag, attribute: 'class'}) || '');
    const blockClassName = normaliseBlockName(blockName);
    const idAttribute = extractAttributeValue({html: innerHTML, attribute: 'id'}) || '';
    
    
    //TO DO: investigate if its possible for WordPress to allow attributes to be passed in the block data.
    // If so, we'll need to handle that here somewhere.

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
            block={{ ...block, idAttribute, blockClassName, normalisedClassNames }}
            postContext={postContext}
            children={children}
            inheritedProps={inheritedProps}
        />
    );

}

export async function renderBlocksRecursively(blocks, keyPrefix, postContext, inheritedProps = {}) {
    const rendered = await Promise.all(
        blocks.map((block, i) =>
            renderBlock(block, `${keyPrefix}-${i}`, postContext, inheritedProps)
        )
    );
    return rendered.filter(Boolean);
}