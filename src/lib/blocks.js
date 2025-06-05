import React from 'react';
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

        //cover block
        case 'core/cover': {
            const {
                contentPosition = 'center center',
                tagName = 'section',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || 'section';

            const positionClass = contentPositionToTailwind(contentPosition);
            const finalClassNames = joinClassNames(blockClassName, positionClass, className); // remove this for now ...remainingClasses

            const blockChildren = innerBlocks.map((child, i) =>
                renderBlock(child, `${keyPrefix}-cover-${i}`, postContext)
            );

            return (
                <Tag key={key} className={finalClassNames} >
                    {withConditionalInnerWrapper(blockChildren, innerHTML)}
                </Tag>
            );
        }

        //group/column/row block
        case 'core/group': {
            const {
                layout = {},
                tagName = 'div',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const type = layout.type || 'default';
            const orientation = type === 'flex' ? layout.orientation || 'horizontal' : undefined;

            let layoutClass = '';

            if (type === 'flex') {
                blockClassName = orientation === 'horizontal' ? 'row-block' : 'column-block';
                layoutClass = orientation === 'horizontal' ? 'flex flex-row' : 'flex flex-col';
            }

            const Tag = tagName || 'div';

            const finalClassNames = joinClassNames(blockClassName, layoutClass, className); // remove this for now ...remainingClasses

            const blockChildren = innerBlocks.map((child, i) =>
                renderBlock(child, `${keyPrefix}-cover-${i}`, postContext)
            );

            return (
                <Tag key={key} className={finalClassNames} >
                    {withConditionalInnerWrapper(blockChildren, innerHTML)}
                </Tag>
            );
        }

        //columns (and column) block
        case 'core/columns': {
            const {
                tagName = 'div',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || 'div';

            const finalClassNames = joinClassNames(blockClassName, 'grid grid-cols-12', className);

            const blockChildren = innerBlocks.map((child, i) =>
                renderBlock(child, `${keyPrefix}-cover-${i}`, postContext)
            );

            return (
                <Tag key={key} className={finalClassNames} >
                    {withConditionalInnerWrapper(blockChildren, innerHTML)}
                </Tag>
            );
        }

        case 'core/column': {
            const {
                width = '100%',
                tagName = 'div',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || 'div';

            const finalClassNames = joinClassNames(blockClassName, className);

            const blockChildren = innerBlocks.map((child, i) =>
                renderBlock(child, `${keyPrefix}-cover-${i}`, postContext)
            );

            return (
                <Tag key={key} className={finalClassNames} >
                    {withConditionalInnerWrapper(blockChildren, innerHTML)}
                </Tag>
            );
        }

        //post title block
        case 'core/post-title': {
            const {
                level = 2,
                isLink = false,
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = `h${level >= 1 && level <= 6 ? level : 2}`;

            const title = postContext?.postTitle || 'Untitled';

            const titleNode = isLink ? (
                <a href={postContext?.postUrl || '#'}>{title}</a>
            ) : (
                title
            );

            const finalClassNames = joinClassNames('post-title', `text-${Tag}`, className); //special case: this block has no blockClassName 

            return (
                <Tag key={key} className={`${finalClassNames}`}>{titleNode}</Tag>
            );
        }

        //heading block
        case 'core/heading': {
            const {
                level = 2,
                tagName = `h${level >= 1 && level <= 6 ? level : 2}`,
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || `h${level}`;

            const finalClassNames = joinClassNames(blockClassName, `text-${Tag}`, className);

            return (
                <Tag key={key} className={finalClassNames}>
                    {text}
                </Tag>
            );
        }

        //paragraph block
        case 'core/paragraph': {
            const {
                tagName = 'p',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || 'p';

            const finalClassNames = joinClassNames(blockClassName, className);

            return <Tag key={key} className={finalClassNames}>{text}</Tag>;
        }

        //blockquote block
        case 'core/quote': {
            const {
                className = '',
                wrapWithInnerDiv = false,
            } = attrs;

            const blockClassName = 'quote-block';

            const styleClasses = mapQuoteStyles(attrs);
            const finalClassNames = joinClassNames(blockClassName, className, ...styleClasses);

            const children = innerBlocks.map((block, i) =>
                renderBlock(block, `${keyPrefix}-quote-${i}`, postContext)
            );

            const citeText = extractCiteText(innerContent || []);
            const quoteBody = (
                <>
                    {children}
                    {citeText && <cite>{citeText}</cite>}
                </>
            );

            return (
                <blockquote key={key} className={finalClassNames}>
                    {wrapWithInnerDiv ? <div className="inner">{quoteBody}</div> : quoteBody}
                </blockquote>
            );
        }

        //code block
        case 'core/code': {
            const { className = '' } = attrs;

            const blockClassName = 'code-block';
            const finalClassNames = joinClassNames(blockClassName, className, 'hljs');

            const codeHTML = innerHTML?.match(/<code[^>]*>(.*?)<\/code>/s)?.[1] || '';
            const highlightedJSX = renderHighlightedCode(codeHTML);

            return (
                <pre key={key} className={finalClassNames}>
                    <code>{highlightedJSX}</code>
                </pre>
            );
        }

        //preformated text block
        case 'core/preformatted': {
            const { className = '' } = attrs;

            const blockClassName = 'preformatted-block';
            const finalClassNames = joinClassNames(blockClassName, className, 'whitespace-pre-wrap');

            const raw = innerHTML
                ?.replace(/<\/?pre[^>]*>/g, '')
                ?.trimStart() || '';

            return (
                <pre key={key} className={finalClassNames}>{raw}</pre>
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
            const finalClassNames = joinClassNames(
                'list-block',
                `level-${currentLevel}`,
                typeClass,
                className);

            return (
                <Tag key={key} className={finalClassNames}>
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


        default: {
            if (blockName && blockName.startsWith('core/')) {
                console.warn(`Unhandled block type: ${blockName}`);
            }
            return null;
        }
    }
}