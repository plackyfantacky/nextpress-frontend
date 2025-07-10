import React from 'react';

import { joinClassNames, extractTag } from "@/lib/utils";
import { renderInlineHTML } from "@/lib/parser";
import { Blockquote } from "@/components/elements";

export default function BlockQuote({ block, keyPrefix, children }) {
    const { idAttribute = '', blockClassName = '', processedClassNames = '', innerHTML = '' } = block;

    return (
        <Blockquote
            block={block}
            key={keyPrefix}
            className={joinClassNames(blockClassName, processedClassNames)}
            {...(idAttribute ? { id: idAttribute } : {})}
        >
            {children?.length ? children : renderInlineHTML(extractTag(innerHTML, 'blockquote', true) || '')}
        </Blockquote>
    )}