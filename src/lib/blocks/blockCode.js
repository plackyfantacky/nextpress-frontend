import React from "react";
import { joinClassNames, extractTag } from "@/lib/utils";
import hljs from 'highlight.js';
import parse from 'html-react-parser';

const blockCode = ({ block, keyPrefix }) => {
    const { idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block;

    const blockClassNames = joinClassNames(blockClassName, normalisedClassNames, 'hljs');
        
    const codeHTML = extractTag(innerHTML, 'code', true) || '';
    
    const highlightedJSX = (() => {
        const result = hljs.highlightAuto(codeHTML);
        return parse(result.value || '');
    })();

    return (
        <pre key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            <code>{highlightedJSX}</code>
        </pre>
    );
};

export default blockCode