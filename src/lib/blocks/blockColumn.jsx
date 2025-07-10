import React from "react";
import { joinClassNames } from "@/lib/utils";

export default function BlockColumn({ block, keyPrefix, children, inheritedProps = {} }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', processedClassNames = '' } = block;
    const { columnClass } = inheritedProps;
    const { tagName: Tag = 'div' } = attrs;

    const blockClassNames = joinClassNames(blockClassName, processedClassNames, columnClass);
    
    return (
        <Tag key={keyPrefix} className={blockClassNames} {...( idAttribute ? { id: idAttribute } : {} )}>
            { children }
        </Tag>
    );

}