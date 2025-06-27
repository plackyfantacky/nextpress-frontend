import React from 'react';
import { Figure } from "@/components/elements";
import { joinClassNames, extractTag } from '@/lib/utils';
import { renderInlineHTML } from '@/lib/parser';

export default function BlockTable({ block, keyPrefix }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block;
    const { hasFixedLayout = false } = attrs;

    const figureClassNames = joinClassNames(
        blockClassName,
    );
    
    const tableClassNames = joinClassNames(
        `{blcokClassName}__table`,
        hasFixedLayout ? 'table-fixed' : '',
        normalisedClassNames
    );

     const caption = extractTag(innerHTML, 'figcaption', true) || '';

    return (
        <Figure key={keyPrefix} className={figureClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            <table className={tableClassNames}>
                {renderTableSection('thead', innerHTML)}
                {renderTableSection('tbody', innerHTML)}
                {renderTableSection('tfoot', innerHTML)}
            </table>
            {caption && <figcaption>{renderInlineHTML(caption.trim())}</figcaption>}
        </Figure>
    );
}

/**
 * Renders a table section (thead, tbody, tfoot) from a given HTML string.
 * @param {string} sectionTag - The tag of the section to render (thead, tbody, tfoot).
 * @param {string} innerHTML - The HTML string containing the section.
 * @returns {ReactNode|null} The rendered section as a React element, or null if no rows are found.
 */
function renderTableSection(sectionTag = 'tbody', innerHTML = '') {
    if (!['thead', 'tbody', 'tfoot'].includes(sectionTag)) return null;

    const sectionHTML = extractTag(innerHTML, sectionTag, false, true);
    if (!sectionHTML) return null;

    const rowTags = extractTag(sectionHTML, 'tr', false, false);
    if (!rowTags || rowTags.length === 0) return null;

    const isBody = sectionTag === 'tbody';
    const cellTag = sectionTag === 'thead' ? 'th' : 'td';

    return React.createElement(sectionTag, {}, rowTags.map((rowHTML, rowIndex) => {
        const cellTags = extractTag(rowHTML, cellTag, false, false) || [];

        return (
            <tr
                key={`${sectionTag}-row-${rowIndex}`}
                id={isBody ? `row-${rowIndex}` : undefined}
                className={isBody ? (rowIndex % 2 === 0 ? 'even' : 'odd') : undefined}
                data-row-index={isBody ? rowIndex : undefined}
            >
                {cellTags.map((cellHTML, i) => {
                    const contentMatch = cellHTML.match(new RegExp(`<${cellTag}[^>]*>([\\s\\S]*?)<\\/${cellTag}>`, 'i'));
                    const content = renderInlineHTML(contentMatch?.[1]) || '';
                    return React.createElement(cellTag, { key: `${cellTag}-${i}` }, content);
                })}
            </tr>
        );
    }));
}