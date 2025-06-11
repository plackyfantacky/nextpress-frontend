import React from "react";
import { joinClassNames, stripParagraphWrapper } from "../utils";
import { renderInlineHTML } from "../parser";
import { generateBlockClassNames } from "../generateBlockClassNames";

export default function BlockParagraph({ block, keyPrefix }) {
    const { attrs = {}, blockClassName = '', extractedClassNames = '', innerHTML } = block;
    const { classNames = '' } = attrs;

    const tailwindClasses = generateBlockClassNames(block);
    
    const finalClassNames = joinClassNames(blockClassName, tailwindClasses, classNames);
    const cleanHTML = stripParagraphWrapper(innerHTML);

    return (<p key={keyPrefix} {...(finalClassNames ? { className: finalClassNames } : {})}>
        {renderInlineHTML(cleanHTML)}
    </p>);
}