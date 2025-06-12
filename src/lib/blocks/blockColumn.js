import React from "react";
import { joinClassNames, withConditionalInnerWrapper } from "../utils";

export default function BlockColumn({ block, keyPrefix, children }) {
    const { attrs, blockName, normalizedClassNames = '', innerHTML } = block;
    const {
        tagName = 'div'
    } = attrs;

    const Tag = tagName || 'div';

    const blockClassNames = joinClassNames(
        blockName, className);

    return (
        <Tag key={keyPrefix} className={blockClassNames} >
            {withConditionalInnerWrapper(children, innerHTML, blockName)}
        </Tag>
    );

}