import React from "react";
import { joinClassNames, extractTag } from "@/lib/utils";
import { renderInlineHTML } from "@/lib/parser";

export default function BlockHeading({ block, keyPrefix }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', processedClassNames = '', innerHTML = '' } = block;
    const { level = 2 } = attrs; //TODO: investigate (if bored) why level = 1 throws an error in the parser.

    const Tag = `h${level >= 1 && level <= 6 ? level : 2}`;

    const blockClassNames = joinClassNames(blockClassName, processedClassNames);
    const text = renderInlineHTML(extractTag(innerHTML, Tag, true) || '');

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>{text}</Tag>
    );
}


