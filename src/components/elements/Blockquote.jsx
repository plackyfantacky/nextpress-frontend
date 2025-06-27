import React from 'react';
import { extractTag } from '@/lib/utils';
import { renderInlineHTML } from '@/lib/parser';
import { Cite, Figure } from '@/components/elements';

const Blockquote = ({ block, keyPrefix, wrapInFigure = false, children }) => {
    const { idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block;

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

    const blockquoteClass = children?.length
        ? `${blockClassName} ${normalisedClassNames}`
        : `${blockClassName}__blockquote`;

    const quoteElement = (
        <blockquote key={keyPrefix} className={blockquoteClass} {...(idAttribute ? { id: idAttribute } : {})}>
            {quoteContent}
            {citation && (!hasEmbeddedCite || hasChildren) && (
                <Cite className="block">
                    {renderInlineHTML(citation)}
                </Cite>
            )}
        </blockquote>
    );

    return wrapInFigure ? (
        <Figure className={blockClassName} key={keyPrefix}>
            {quoteElement}
        </Figure>
    ) : (
        quoteElement
    );
};

export default Blockquote;