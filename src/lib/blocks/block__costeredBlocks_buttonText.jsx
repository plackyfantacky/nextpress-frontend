import React from "react";
import { joinClassNames, extractTag } from "@/lib/utils";
export default function Block_CosteredBlocks_ButtonText({ block, keyPrefix }) {
    const { idAttribute = '', blockClassName = '', processedClassNames = '', innerHTML = '' } = block;

    const blockClassNames = joinClassNames('cb-button-text', processedClassNames);
    const text = extractTag(innerHTML, 'span', true, true) || '';

    return <span key={keyPrefix} {...(blockClassNames ? { className: blockClassNames } : {})} {...(idAttribute ? { id: idAttribute } : {})}>{text}</span>;
}