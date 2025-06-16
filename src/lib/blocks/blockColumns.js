import React from "react";
import { joinClassNames, withConditionalInnerWrapper } from "@/lib/utils";

export default function BlockColumns({ block, keyPrefix, children }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = ''} = block;
    const { tagName: Tag = 'div' } = attrs;

    const blockClassNames = joinClassNames(blockClassName, 'grid grid-cols-12', normalisedClassNames);

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...( idAttribute ? { id: idAttribute } : {} )}>
            {withConditionalInnerWrapper(children, innerHTML, blockClassName)}
        </Tag>
    );
}