import React from 'react';

import {
    joinClassNames,
    extractTextFromTag,
    normalizeClassNames
} from '../utils';
import { renderInlineHTML } from '../parser';

export default function BlockQuote({ block, keyPrefix, children }) {
    const {
        attrs = {},
        blockClassName = '',
        extractedClassNames = '',
        innerHTML = ''
    } = block;

    const citation = extractTextFromTag(innerHTML, 'cite');

    // Compose class list (using helpers only)
    const attrClassList = [
        attrs.className,
        attrs.textColor && `text-${attrs.textColor}`,
        attrs.backgroundColor && `bg-${attrs.backgroundColor}`,
        attrs.fontSize,
        attrs.fontFamily && `font-${attrs.fontFamily}`
    ].filter(Boolean).join(' ');

    const combinedClasses = [extractedClassNames, attrClassList]
        .filter(Boolean)
        .join(' ');

    const blockquoteClass = joinClassNames(
        blockClassName,
        normalizeClassNames(combinedClasses)
    );

    return (
        <blockquote key={keyPrefix} className={blockquoteClass}>
            {children}
            {citation && (
                <cite className="text-sm text-gray-500 mt-2 block">
                    {renderInlineHTML(citation)}
                </cite>
            )}
        </blockquote>
    );
}