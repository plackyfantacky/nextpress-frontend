import React from 'react';
import { Figure } from "@/components/Elements";
import { joinClassNames, extractTag } from '@/lib/utils';
import { renderInlineHTML, renderTableSection } from '@/lib/parser';

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