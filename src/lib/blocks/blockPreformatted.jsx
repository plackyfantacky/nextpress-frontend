import React from "react";
import { joinClassNames, extractTag } from "@/lib/utils";

const blockPreformatted = ({ block, keyPrefix }) => {
    const { idAttribute = '', blockClassName = '', processedClassNames = '', innerHTML = '' } = block;

    const blockClassNames = joinClassNames(blockClassName, processedClassNames, 'whitespace-pre-wrap');
    const preHTML = extractTag(innerHTML, 'pre', true) || '';    
    
    return (
        <pre key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>{preHTML}</pre>
    );
};

export default blockPreformatted