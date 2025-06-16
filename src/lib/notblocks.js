import React from 'react';
import parse from 'html-react-parser';
import {
    extractTextAndClasses,
    contentPositionToTailwind,
    normalizeBlockClassName,
    joinClassNames,
    withConditionalInnerWrapper,
    extractCiteText,
    mapQuoteStyles
} from './utils';

import { renderHighlightedCode, renderInlineHTML } from './parser';

const wrappableBlocks = [
    'core/group',
    'core/columns',
    'core/cover',
    'core/quote',
    'core/pullquote',
    'core/media-text',
    'core/classic',
];



/**
 * Renders a block based on its type and attributes.
 * @param {Object} block - The block object containing blockName, attrs, innerBlocks, and innerHTML.
 * @param {string} [keyPrefix='block'] - A prefix for the key to ensure uniqueness.
 * @param {Object} [postContext={}] - Additional context for the post, such as postTitle and postUrl.
 * @returns {ReactNode|null} The rendered block as a React node, or null if the block type is unhandled.
 */
export function renderBlock(block, keyPrefix = 'block', postContext = {}) {
    const { blockName, attrs = {}, innerBlocks = [], innerHTML = '', innerContent = '' } = block;

    const key = `${keyPrefix}-${Math.random().toString(36).substring(2, 8)}`; // unique enough for now

    const { text, blockClassName: rawClass, remainingClasses } = extractTextAndClasses(block.innerHTML);
    let blockClassName = normalizeBlockClassName(rawClass);

    if (!blockName && (!innerHTML || innerHTML.trim() === '')) { return null; }


    switch (blockName) {


        //code block
        case 'core/code': {
            
        }

        //preformated text block
        case 'core/preformatted': {
            
        }

        //list block
        case 'core/list': {

        }

        //list item block
        case 'core/list-item': {

        }

        //table block
        case 'core/table': {
            
        }

        //pullquote block
        case 'core/pullquote': {
            const { className = '' } = attrs;
            const blockClassName = 'pullquote-block';
            const blockClassNames = joinClassNames(blockClassName, className);

            // Extract <p> and <cite> content from innerHTML
            const quoteMatch = innerHTML.match(/<blockquote[^>]*>\s*<p>([\s\S]*?)<\/p>/i);
            const citeMatch = innerHTML.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i);

            const quoteHTML = quoteMatch?.[1]?.trim() || '';
            const citeText = citeMatch?.[1]?.trim() || '';

            return (
                <figure key={key} className={blockClassNames}>
                    <blockquote>
                        <p>{renderInlineHTML(quoteHTML)}</p>
                        {citeText && <cite>{citeText}</cite>}
                    </blockquote>
                </figure>
            );
        }

        //details/summary block
        case 'core/details': {
            const {
                className = '',
                showContent = false,
            } = attrs;

            const blockClassName = 'details-block';
            const blockClassNames = joinClassNames(blockClassName, className);

            const summaryMatch = innerHTML.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
            const summaryText = summaryMatch?.[1]?.trim() || 'Details';

            return (
                <details key={key} className={blockClassNames} open={showContent}>
                    <summary>{renderInlineHTML(summaryText)}</summary>
                    <div className={`${blockClassName}--content`}>
                        {innerBlocks.map((child, i) =>
                            renderBlock(child, `${keyPrefix}-details-${i}`, postContext)
                        )}
                    </div>
                </details>
            );

        }

        //media-text block
        case 'core/media-text': {
            const {
                className = '',
                mediaType = 'image',
                mediaLink,
                mediaPosition = 'left',
                imageFill = false,
                useFeaturedImage = false,
            } = attrs;

            const blockClassName = 'media-text-block';
            const alignmentClass = `media-text--${mediaPosition}`;
            const fillClass = imageFill ? 'media-text--fill' : '';
            const blockClassNames = joinClassNames(
                blockClassName,
                alignmentClass,
                fillClass,
                className
            );

            // Get media image from postContext if using featured image
            let mediaElement = null;
            if (useFeaturedImage && postContext?.postImage) {
                mediaElement = (
                    <img
                        src={postContext.postImage}
                        alt="Featured"
                        className={joinClassNames('media-image', imageFill ? 'media-image--fill' : '')}
                    />
                );
            } else {
                // fallback to parsing image from innerHTML
                const mediaHTML = innerHTML.match(/<figure[^>]*>([\s\S]*?)<\/figure>/i)?.[1] || '';
                mediaElement = parse(mediaHTML, {
                    replace: (node) => {
                        if (node.type === 'tag' && node.name === 'img') {
                            return (
                                <img
                                    src={node.attribs.src}
                                    alt={node.attribs.alt || ''}
                                    className={joinClassNames('media-image', imageFill ? 'media-image--fill' : '')}
                                />
                            );
                        }
                    }
                });
            }

            return (
                <div key={key} className={blockClassNames}>
                    <figure className="media-text-media">
                        {mediaLink ? (
                            <a href={mediaLink} target="_blank" rel="noopener noreferrer">
                                {mediaElement}
                            </a>
                        ) : mediaElement}
                    </figure>
                    <div className="media-text-content">
                        {innerBlocks.map((child, i) =>
                            renderBlock(child, `${keyPrefix}-media-text-${i}`, postContext)
                        )}
                    </div>
                </div>
            );
        }

        case 'core/footnotes': {
            return null; //don't even go there. WP does this at render time, not in the editor
        }

        default: {
            if (blockName && blockName.startsWith('core/')) {
                console.warn(`Unhandled block type: ${blockName}`);
            }
            return null;
        }
    }
}