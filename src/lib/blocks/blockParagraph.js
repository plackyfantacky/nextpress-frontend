import React from "react";
import { joinClassNames, extractTextFromTag } from "@/lib/utils";
import { renderInlineHTML } from "@/lib/parser";

export default function BlockParagraph({ block, keyPrefix }) {
    const { idAttribute = '', blockClassName = '', normalizedClassNames = '', innerHTML = '' } = block;

    const blockClassNames = joinClassNames(blockClassName, normalizedClassNames);
    const text = renderInlineHTML(extractTextFromTag(innerHTML, 'p'));

    return <p key={keyPrefix} {...(blockClassNames ? { className: blockClassNames } : {})} {...(idAttribute ? { id: idAttribute } : {})}>{text}</p>;
}