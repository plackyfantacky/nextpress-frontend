import React from 'react';
import { extractAttributeValue, preprocessBlock } from '@/lib/utils';
import { normaliseClassNames } from '@/lib/styler';
import { processAttributesToClassNames } from '@/lib/attributes';

const blockRenderers = {
    'core/button': () => import('./blockButton'),
    'core/buttons': () => import('./blockButtons'),
    'core/code': () => import('./blockCode'),
    'core/column': () => import('./blockColumn'),
    'core/columns': () => import('./blockColumns'),
    'core/cover': () => import('./blockCover'),
    'core/details': () => import('./blockDetails'),
    'core/group': () => import('./blockGroup'),
    'core/heading': () => import('./blockHeading'),
    'core/image': () => import('./blockImage'),
    'core/list-item': () => import('./blockListItem'),
    'core/list': () => import('./blockList'),
    'core/media-text': () => import('./blockMediaText'),
    'core/paragraph': () => import('./blockParagraph'),
    'core/post-title': () => import('./blockPostTitle'),
    'core/preformatted': () => import('./blockPreformatted'),
    'core/pullquote': () => import('./blockPullquote'),
    'core/quote': () => import('./blockQuote'),
    'core/table': () => import('./blockTable'),

    // Add other block renderers here
    'outermost/icon-block': () => import('./block__outermost_iconBlock'),
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
    const { blockName, innerBlocks = [], innerHTML} = block;
    if (!blockName && (!innerHTML || innerHTML.trim() === '')) { return null; }

    block = preprocessBlock(block);
    
    const wrapperTag = block.wrapperTag || '';
    let normalisedClassNames = normaliseClassNames(extractAttributeValue({html: innerHTML, tag: wrapperTag, attribute: 'class'}) || '');
    const processedAttributeClassNames = processAttributesToClassNames(block.attrs || {});
    const blockClassName = blockName.replace(/^core\//, '') + '-block';
    const idAttribute = extractAttributeValue({html: innerHTML, attribute: 'id'}) || '';
    
    //console.log('processedAttributeClassNames', processedAttributeClassNames);

    normalisedClassNames = normalisedClassNames ? `${normalisedClassNames} ${processedAttributeClassNames}` : processedAttributeClassNames;
    
    //TO DO: investigate if its possible for WordPress to allow attributes to be passed in the block data.
    // If so, we'll need to handle that here somewhere.

    const renderer = blockRenderers[blockName];
    if (!renderer) {
        console.warn(`Unhandled block type: ${blockName}`);
        return null;
    }

    if(blockName === 'core/group') {
        //console.log('block', block?.attrs);
    }

    //console.log('normalisedClassNames 1', normalisedClassNames);

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