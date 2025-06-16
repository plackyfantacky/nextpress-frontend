import React from 'react';
import { joinClassNames, extractTag } from "@/lib/utils";
import { renderBlocksRecursively } from "@/lib/blocks";

export default function BlockDetails({ block, keyPrefix, postContext, children }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block;
    const { showContent = false } = attrs;

    const blockClassNames = joinClassNames(blockClassName, normalisedClassNames);
    const summary = extractTag(innerHTML, 'summary', true) || 'Details';

    return (
        <details key={idAttribute || `${keyPrefix}-details`} className={blockClassNames} open={showContent}>
            <summary>{summary}</summary>
            {children?.length
                ? children
                : renderBlocksRecursively(innerBlocks, `${keyPrefix}-details-content`, postContext)}
        </details>
    );
}
