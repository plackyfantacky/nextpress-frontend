// ./lib/blocks/blockGroup.js
import React from "react";
import { joinClassNames, withConditionalInnerWrapper } from "../utils";

export default function BlockGroup({ block, keyPrefix, children }) {
    const { attrs = {}, blockName = '', normalizedClassNames = '', innerHTML = '' } = block;

    const {
        layout = {},
        tagName = 'div',
    } = attrs;

    const type = layout.type || 'default';
    const orientation = type === 'flex' ? layout.orientation || 'horizontal' : undefined;

    let layoutClassName = '', layoutBlockName = '';

    if (type === 'flex') {
        layoutBlockName = orientation === 'horizontal' ? 'row-block' : 'stack-block';
        layoutClassName = orientation === 'horizontal' ? 'flex flex-row' : 'flex flex-col';
    } else {
        layoutBlockName = 'group-block';  
    }

    const Tag = tagName || 'div';
    const blockClassNames = joinClassNames(normalizedClassNames, layoutBlockName, layoutClassName);

    return (
        <Tag key={keyPrefix} className={blockClassNames} >
            {withConditionalInnerWrapper(children, innerHTML, blockName)}
        </Tag>
    );
}