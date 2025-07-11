import React from 'react';
import { extractTag } from '@/lib/utils';
import { renderInlineHTML } from '@/lib/parser';
import { Cite, Figure } from '@/components/elements';

const Blockquote = ({ block, keyPrefix, wrapInFigure = false, blockClassNames = '', children }) => {
    const { idAttribute = '', blockClassName = '', innerHTML = '' } = block;

    const hasChildren = Array.isArray(children) && children.length > 0;
    const citation = extractTag(innerHTML, 'cite', true) || '';
    const hasEmbeddedCite = innerHTML.includes('<cite');

    let quoteContent;

    if (children?.length) {
        // core/quote with nested blocks
        quoteContent = children;
    } else {
        // fallback for core/pullquote or raw HTML
        const rawHTML = extractTag(innerHTML, 'blockquote', true) || '';
        quoteContent = renderInlineHTML(rawHTML);
    }

    // if we're wraping in a figure the clansname is different
    const blockquoteClassName = wrapInFigure ? `${blockClassName}__blockquote` : blockClassName;
    const figureClassName = wrapInFigure ? blockClassName : '';

    const quoteElement = (
        <blockquote 
            key={keyPrefix} 
            className={blockquoteClassName} 
            {...(idAttribute ? { id: idAttribute } : {})}
        >
            {quoteContent}
            {citation && (!hasEmbeddedCite || hasChildren) && (
                <Cite className="block">
                    {renderInlineHTML(citation)}
                </Cite>
            )}
        </blockquote>
    );

    return wrapInFigure ? (
        <Figure figureClassNames={figureClassName} key={keyPrefix}>
            {quoteElement}
        </Figure>
    ) : (
        quoteElement
    );
};

export default Blockquote;