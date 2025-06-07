import React from "react";
import { joinClassNames, stripParagraphWrapper } from "../utils";
import { renderInlineHTML } from "../parser";

export default function BlockParagraph({ block, keyPrefix }) {
    const { attrs = {}, blockClassName = '', extractedClassNames = '', innerHTML } = block;
    const { className = '' } = attrs;

    const cleanedClassName = (extractedClassNames || '')
        .split(/\s+/)
        .map(cls => {
            const match = cls.match(/^has-([a-z0-9-]+)-color$/i);
            return match ? `text-${match[1]}` : null;
        })
        .filter(cls => !['text-text', 'text-link', 'text-inline'].includes(cls))
        .filter(Boolean)
        .join(' ');

    const finalClassNames = joinClassNames(blockClassName, className, cleanedClassName);
    const cleanHTML = stripParagraphWrapper(innerHTML);

    return (<p key={keyPrefix} {...(finalClassNames ? { className: finalClassNames } : {})}>
        {renderInlineHTML(cleanHTML)}
    </p>);
}