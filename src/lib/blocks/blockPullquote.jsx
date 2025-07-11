import React from 'react';
import { joinClassNames } from "@/lib/utils";
import { Blockquote } from "@/components/elements";

export default function BlockPullquote({ block, keyPrefix }) {
    const { blockClassName = '', processedClassNames = '' } = block;

    const blockClassNames = joinClassNames(blockClassName, processedClassNames);

    return <Blockquote
        block={block}
        key={keyPrefix}
        wrapInFigure={true} 
        blockClassNames={blockClassNames} />;
};