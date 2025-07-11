import React from "react";
import { joinClassNames, extractTag } from "@/lib/utils";
import hljs from 'highlight.js';
import { parseHTML } from "../parser";

const blockCode = ({ block, keyPrefix }) => {
    const { idAttribute = '', blockClassName = '', processedClassNames = '', innerHTML = '' } = block;

    const blockClassNames = joinClassNames(blockClassName, processedClassNames, 'hljs');
        
    const codeHTML = extractTag(innerHTML, 'code', true) || '';
    
    const highlightedJSX = (() => {
        const result = hljs.highlightAuto(codeHTML);
        return parseHTML(result.value || '');
    })();

    return (
        <pre key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            <code>{highlightedJSX}</code>
        </pre>
    );
};

export default blockCode