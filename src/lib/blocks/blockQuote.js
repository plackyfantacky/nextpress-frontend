import React from 'react';
import { joinClassNames, extractTextFromTag } from '../utils';
import { renderInlineHTML } from '../parser';

export default function BlockQuote({ keyPrefix, block, children }) {
    const { blockName = '', normalizedClassNames = '', innerHTML = '' } = block;

    const citation = extractTextFromTag(innerHTML, 'cite');
    const blockClassNames = joinClassNames(blockName, normalizedClassNames);

    return (
        <blockquote key={keyPrefix} className={blockClassNames}>
            {children}
            {citation && (
                <cite>
                    {renderInlineHTML(citation)}
                </cite>
            )}
        </blockquote>
    );
}