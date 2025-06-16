import React from "react";
import { extractTag, joinClassNames } from "@/lib/utils";
import { renderInlineHTML } from "@/lib/parser";

export default function BlockListItem({ block, keyPrefix, children, postContext = {} }) {
    const {idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block;

    const content = extractTag(innerHTML, 'li', true) || '';
    const currentLevel = postContext?.listLevel || 1;
    
    const blockClassNames = joinClassNames(
        blockClassName,
        normalisedClassNames,
        `list-item list-item-level-${currentLevel}`,
    );

    return (
        <li key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            {renderInlineHTML(content.trim())}
            {children?.length > 0 && (
                <>
                    {children}
                </>
            )}
        </li>
    );
};