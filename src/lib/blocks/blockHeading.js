import React from "react";
import { joinClassNames, stripHeadingWrapper } from "../utils";
import { renderInlineHTML } from "../parser";

export default function BlockHeading({ block, keyPrefix }) {
    const { attrs = {}, blockClassName = '', innerHTML } = block;
    const {
        level = 2,
        tagName = `h${level >= 1 && level <= 6 ? level : 2}`,
        className = '' //explicably set by the user in the editor
    } = attrs;

    const Tag = tagName || `h${level}`;
    const finalClassNames = joinClassNames(blockClassName, `text-${Tag}`, className);
    const cleanHTML = stripHeadingWrapper(innerHTML);

    return (
        <Tag key={keyPrefix} className={finalClassNames}>{renderInlineHTML(cleanHTML)}</Tag>
    );
}


