import React from "react";
import { joinClassNames, stripParagraphWrapper } from "../utils";
import { renderInlineHTML } from "../parser";

export default function BlockParagraph({ block, keyPrefix }) {
    const { blockName = '', normalizedClassNames = '', innerHTML } = block;

    const blockClassNames = joinClassNames(blockName, normalizedClassNames);
    const cleanHTML = stripParagraphWrapper(innerHTML);

    return (<p key={keyPrefix} {...(blockClassNames ? { className: blockClassNames } : {})}>
        {renderInlineHTML(cleanHTML)}
    </p>);
}