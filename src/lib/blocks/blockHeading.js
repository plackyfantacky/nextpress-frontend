import React from "react";
import { joinClassNames, stripHeadingWrapper } from "../utils";
import { renderInlineHTML } from "../parser";

export default function BlockHeading({ block, keyPrefix }) {
    const { attrs = {}, blockName = '', normalizedClassNames = '', innerHTML } = block;
    const {
        level = 2,
        tagName = `h${level >= 1 && level <= 6 ? level : 2}`,
    } = attrs; //there are potentially many other styling attributes, but we'll delegate job that to generateBlockClassNames

    const Tag = tagName || `h${level}`;
    const blockClassNames = joinClassNames(
        blockName,
        normalizedClassNames
    );
    const cleanHTML = stripHeadingWrapper(innerHTML);

    return (
        <Tag key={keyPrefix} className={blockClassNames}>{renderInlineHTML(cleanHTML)}</Tag>
    );
}


