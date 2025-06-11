import React from "react";
import { joinClassNames, stripHeadingWrapper } from "../utils";
import { renderInlineHTML } from "../parser";
import { generateBlockClassNames } from "../generateBlockClassNames";

export default function BlockHeading({ block, keyPrefix }) {
    const { attrs = {}, blockClassName = '', innerHTML } = block;
    const {
        level = 2,
        tagName = `h${level >= 1 && level <= 6 ? level : 2}`,
        className = ''
    } = attrs; //there are potentially many other styling attributes, but we'll delegate job that to generateBlockClassNames

    const tailwindClasses = generateBlockClassNames(block);

    const Tag = tagName || `h${level}`;
    const finalClassNames = joinClassNames(blockClassName, tailwindClasses, className);
    const cleanHTML = stripHeadingWrapper(innerHTML);

    return (
        <Tag key={keyPrefix} className={finalClassNames}>{renderInlineHTML(cleanHTML)}</Tag>
    );
}


