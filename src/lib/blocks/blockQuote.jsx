import React from 'react';

import { joinClassNames, extractTag } from "@/lib/utils";
import { renderInlineHTML } from "@/lib/parser";
import { Blockquote } from "@/components/elements";

export default function BlockQuote({ block, keyPrefix, children }) {
    const { idAttribute = '', blockClassName = '', processedClassNames = '', innerHTML = '' } = block;

    const blockClassNames = joinClassNames(blockClassName, processedClassNames);

    return (
        <Blockquote
            block={block}
            key={keyPrefix}
            wrapInFigure={true}
            blockClassNames={blockClassNames}
        >
            {children?.length ? children : renderInlineHTML(extractTag(innerHTML, 'blockquote', true) || '')}
        </Blockquote>
    )}