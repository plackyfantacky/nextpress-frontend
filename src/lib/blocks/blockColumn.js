import React from "react";
import { joinClassNames, withConditionalInnerWrapper } from "@/lib/utils";

export default function BlockColumn({ block, keyPrefix, children }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = ''} = block;
    const { tagName: Tag = 'div' } = attrs;

    const blockClassNames = joinClassNames(blockClassName, normalisedClassNames);

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...( idAttribute ? { id: idAttribute } : {} )}>
            {withConditionalInnerWrapper(children, innerHTML, blockClassName)}
        </Tag>
    );

}