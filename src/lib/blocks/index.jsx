import React from 'react';
import { extractAttributeValue, joinClassNames, preprocessBlock } from '@/lib/utils';
import { normaliseClassNames } from '@/lib/styler';
import { processAttributesToClassNames } from '@/lib/attributes';
import { parseStyleStringToObject } from "@/lib//parser";
import { parseBlocks } from "@/lib/api";

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
    'core/shortcode': () => import('./blockShortcode'),
    'core/table': () => import('./blockTable'),

    // Add other block renderers here
    'costered-blocks/button-text': () => import('./block__costeredBlocks_buttonText'),
    'outermost/icon-block': () => import('./block__outermost_iconBlock'),
};

//whitelist blocks that require prop inheritance
const requireInheritedProps = new Set([
    'core/columns',
    'core/column'
]);

export async function renderBlock(block, keyPrefix = 'block', postContext = {}, inheritedProps = {}) {
    const {attrs = {}, blockName, innerBlocks = [], innerHTML } = block;

    if (!blockName && (!innerHTML || innerHTML.trim() === '')) { return null; }

    block = preprocessBlock(block);

    const forwaredInheritedProps = requireInheritedProps.has(blockName) ? inheritedProps : undefined;
    const wrapperTag = block.wrapperTag || '';
    const blockClassName = blockName.replace(/^core\//, '') + '-block';
    const idAttribute = extractAttributeValue({ html: innerHTML, attribute: 'id' }) || '';

    const processedClassNames = processAttributesToClassNames(attrs);

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
            block={{ ...block, idAttribute, blockClassName, processedClassNames }}
            postContext={postContext}
            children={children}
            inheritedProps={forwaredInheritedProps}
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