import React from "react";
import { joinClassNames, withConditionalInnerWrapper } from "../utils";

export default function BlockColumns({ block, keyPrefix, children }) {
    const { attrs, blockClassName, innerHTML } = block;
    const {
        tagName = 'div',
        className = '' //explicably set by the user in the editor
    } = attrs;

    const Tag = tagName || 'div';
    const finalClassNames = joinClassNames(blockClassName, 'grid grid-cols-12', className);

    return (
        <Tag key={keyPrefix} className={finalClassNames} >
            {withConditionalInnerWrapper(children, innerHTML, blockClassName)}
        </Tag>
    );
}