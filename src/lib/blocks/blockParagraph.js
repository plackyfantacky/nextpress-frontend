import React from "react";
import { joinClassNames, stripParagraphWrapper } from "../utils";
import { renderInlineHTML } from "../parser";

export default function BlockParagraph({ block, keyPrefix }) {
    const { attrs = {}, blockClassName = '', innerHTML } = block;
    const { className = '' } = attrs;
    
    const finalClassNames = joinClassNames(blockClassName, className);
    const cleanHTML = stripParagraphWrapper(innerHTML);

    return (<p key={keyPrefix} {...(finalClassNames ? { className: finalClassNames } : {})}>
        {renderInlineHTML(cleanHTML)}
    </p>);
}