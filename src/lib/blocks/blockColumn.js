import React from "react";
import { joinClassNames, withConditionalInnerWrapper } from "@/lib/utils";

export default function BlockColumn({ block, keyPrefix, children }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalizedClassNames = '', innerHTML = ''} = block;
    const { tagName: Tag = 'div' } = attrs;

    const blockClassNames = joinClassNames(blockClassName, normalizedClassNames);

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...( idAttribute ? { id: idAttribute } : {} )}>
            {withConditionalInnerWrapper(children, innerHTML, blockClassName)}
        </Tag>
    );

}