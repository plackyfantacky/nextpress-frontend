import React from "react";
import { contentPositionToTailwind, joinClassNames, withConditionalInnerWrapper } from "../utils";
import { renderBlock } from "./index";

export default function BlockGroup({ block, keyPrefix, postContext, children }) {
    const { attrs = {}, blockClassName = '', innerHTML = '' } = block;
    const {
        layout = {},
        tagName = 'div',
        className = '' //explicably set by the user in the editor
    } = attrs;

    const type = layout.type || 'default';
    const orientation = type === 'flex' ? layout.orientation || 'horizontal' : undefined;

    let layoutClass = '';
    let computedClassName = blockClassName;

    if (type === 'flex') {
        computedClassName = orientation === 'horizontal' ? 'row-block' : 'column-block';
        layoutClass = orientation === 'horizontal' ? 'flex flex-row' : 'flex flex-col';
    }

    const Tag = tagName || 'div';
    const finalClassNames = joinClassNames(computedClassName, layoutClass, className);

    return (
        <Tag key={keyPrefix} className={finalClassNames} >
            {withConditionalInnerWrapper(children, innerHTML)}
        </Tag>
    );
}