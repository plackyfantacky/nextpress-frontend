import React from "react";
import { joinClassNames, extractTag } from "@/lib/utils";
import { renderInlineHTML } from "@/lib/parser";

export default function BlockParagraph({ block, keyPrefix }) {
    const { idAttribute = '', blockClassName = '', processedClassNames = '', innerHTML = '' } = block;

    const blockClassNames = joinClassNames(blockClassName, processedClassNames);
    const text = renderInlineHTML(extractTag(innerHTML, 'p', true) || '');

    return <p key={keyPrefix} {...(blockClassNames ? { className: blockClassNames } : {})} {...(idAttribute ? { id: idAttribute } : {})}>{text}</p>;
}