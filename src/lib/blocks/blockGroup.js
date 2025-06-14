import React from "react";
import { joinClassNames, withConditionalInnerWrapper } from "@/lib/utils";

export default function BlockGroup({ block, keyPrefix, children }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalizedClassNames = '', innerHTML = '' } = block;
    const { layout = {}, tagName: Tag = 'div' } = attrs;

    const isFlex = layout.type === 'flex';
    const orientation = isFlex ? (layout.orientation || 'horizontal') : undefined;

    const blockClassNames = joinClassNames(
        blockClassName,
        isFlex ? orientation === 'horizontal' ? 'row-block flex flex-row' : 'stack-block flex flex-col' : 'group-block' //don't think about this too hard, just go with it.
    );

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            {withConditionalInnerWrapper(children, innerHTML, blockClassName)}
        </Tag>
    );
}