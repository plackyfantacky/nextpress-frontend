import React from "react";
import { joinClassNames, extractTextFromTag } from "@/lib/utils";
import { renderInlineHTML } from "@/lib/parser";

export default function BlockHeading({ block, keyPrefix }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalizedClassNames = '', innerHTML = '' } = block;
    const { level = 2 } = attrs; //TODO: investigate (if bored) why level = 1 throws an error in the parser.

    const Tag = `h${level >= 1 && level <= 6 ? level : 2}`;

    const blockClassNames = joinClassNames(blockClassName, normalizedClassNames);
    const text = renderInlineHTML(extractTextFromTag(innerHTML, Tag));

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>{text}</Tag>
    );
}


