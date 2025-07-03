import React from "react";
import { joinClassNames } from "@/lib/utils";
import { renderBlocksRecursively } from "@/lib/blocks"; // from the index.js file in the blocks directory

export default function BlockList({ block, keyPrefix, postContext = {} }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block;
    const { ordered = false } = attrs;

    const Tag = ordered ? 'ol' : 'ul';

    const currentLevel = postContext?.listLevel || 1;
    const nextContext = {
        ...postContext,
        listLevel: currentLevel + 1
    };

    const blockClassNames = joinClassNames(
        blockClassName,
        `level-${currentLevel}`,
        normalisedClassNames,
        ordered ? 'list-ordered' : 'list-unordered'
    );

    

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            {renderBlocksRecursively(block.innerBlocks, keyPrefix, nextContext)}
        </Tag>
    );
};