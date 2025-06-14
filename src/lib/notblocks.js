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
            const { className = '' } = attrs;

            const blockClassName = 'code-block';
            const blockClassNames = joinClassNames(blockClassName, className, 'hljs');

            const codeHTML = innerHTML?.match(/<code[^>]*>(.*?)<\/code>/s)?.[1] || '';
            const highlightedJSX = renderHighlightedCode(codeHTML);

            return (
                <pre key={key} className={blockClassNames}>
                    <code>{highlightedJSX}</code>
                </pre>
            );
        }

        //preformated text block
        case 'core/preformatted': {
            const { className = '' } = attrs;

            const blockClassName = 'preformatted-block';
            const blockClassNames = joinClassNames(blockClassName, className, 'whitespace-pre-wrap');

            const raw = innerHTML
                ?.replace(/<\/?pre[^>]*>/g, '')
                ?.trimStart() || '';

            return (
                <pre key={key} className={blockClassNames}>{raw}</pre>
            );
        }

        //list block
        case 'core/list': {
            const { ordered = false, type = null, className = '' } = attrs;
            const Tag = ordered ? 'ol' : 'ul';

            const currentLevel = postContext?.listLevel || 1;
            const nextContext = {
                ...postContext,
                listLevel: currentLevel + 1
            };

            // Optional list-style-type override
            const typeClass = type ? `list-${type}` : '';
            const blockClassNames = joinClassNames(
                'list-block',
                `level-${currentLevel}`,
                typeClass,
                className);

            return (
                <Tag key={key} className={blockClassNames}>
                    {innerBlocks.map((child, i) =>
                        renderBlock(child, `${keyPrefix}-list-item-${i}`, nextContext)
                    )}
                </Tag>
            );
        }

        //list item block
        case 'core/list-item': {
            const content = innerHTML
                ?.replace(/^<li[^>]*>/, '')
                ?.replace(/<\/li>$/, '')
                ?.trim();

            return (
                <li key={key} className="list-item-block">
                    {renderInlineHTML(innerHTML?.replace(/<\/?li[^>]*>/g, '') || '')}
                    {innerBlocks.map((child, i) =>
                        renderBlock(child, `${keyPrefix}-nested-${i}`, postContext)
                    )}
                </li>

            );
        }

        //table block
        case 'core/table': {
            const { hasFixedLayout = false, className = '' } = attrs;

            const tableClassName = joinClassNames(
                'table-block',
                hasFixedLayout ? 'table-fixed' : '',
                className
            );

            const extractSection = (html, tag) => {
                const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
                return match ? match[1] : '';
            };

            const parseRows = (htmlSection) => {
                const rowMatches = htmlSection.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

                return rowMatches.map((row, i) => {
                    const cells = [...row.matchAll(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi)];
                    return (
                        <tr key={`row-${i}`}>
                            {cells.map(([_, type, content], j) => {
                                const Tag = type.toLowerCase();
                                return (
                                    <Tag key={`cell-${i}-${j}`}>
                                        {renderInlineHTML(content.trim())}
                                    </Tag>
                                );
                            })}
                        </tr>
                    );
                });
            };

            const caption = innerHTML.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] || '';
            const thead = parseRows(extractSection(innerHTML, 'thead'));
            const tbody = parseRows(extractSection(innerHTML, 'tbody'));
            const tfoot = parseRows(extractSection(innerHTML, 'tfoot'));

            return (
                <figure key={key} className={tableClassName}>
                    <table>
                        {thead.length > 0 && <thead>{thead}</thead>}
                        {tbody.length > 0 && <tbody>{tbody}</tbody>}
                        {tfoot.length > 0 && <tfoot>{tfoot}</tfoot>}
                    </table>
                    {caption && <figcaption>{renderInlineHTML(caption.trim())}</figcaption>}
                </figure>
            );
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