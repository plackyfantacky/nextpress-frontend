import React from 'react';

import { joinClassNames, extractTag } from "@/lib/utils";
import { renderInlineHTML } from "@/lib/parser";
import { Blockquote } from "@/components/Elements";

export default function BlockQuote({ block, keyPrefix, children }) {
    const { idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block;

    return (
        <Blockquote
            block={block}
            key={keyPrefix}
            className={joinClassNames(blockClassName, normalisedClassNames)}
            {...(idAttribute ? { id: idAttribute } : {})}
        >
            {children?.length ? children : renderInlineHTML(extractTag(innerHTML, 'blockquote', true) || '')}
        </Blockquote>
    )}