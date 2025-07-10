import React from "react";
import { joinClassNames } from "@/lib/utils";

export default function BlockGroup({ block, keyPrefix, children }) {
    const { attrs = {}, idAttribute = '', processedClassNames = '' } = block;
    const { layout = {}, tagName: Tag = 'div' } = attrs;
    
    let groupSubTypeName = '';

    if(layout?.type === 'constrained') {
        groupSubTypeName = 'group-block';
    } else if(layout?.type === 'flex') {
        if(layout?.orientation === 'vertical') {
            groupSubTypeName = 'stack-block';
        } else {
            groupSubTypeName = 'row-block';
        }
    } else if(layout?.type === 'grid') {
        groupSubTypeName = 'grid-block';
    } else {
        groupSubTypeName = 'group-block';
    }
    
    const blockClassNames = joinClassNames( groupSubTypeName, processedClassNames);

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            {children}
        </Tag>
    );
}