import React from "react";
import { contentPositionToTailwind, joinClassNames, withConditionalInnerWrapper } from "../utils";
import { renderBlock } from "./index";

export default function BlockCover({ block, keyPrefix, postContext, children }) {
    const { attrs, blockClassName, innerHTML } = block;
    const {
        tagName = 'section',
        contentPosition = 'center center',
        className = '' //explicably set by the user in the editor
    } = attrs;

    const Tag = tagName;

    const finalClassNames = joinClassNames(blockClassName, contentPositionToTailwind(attrs.contentPosition), className);

    return (
        <Tag key={keyPrefix} className={finalClassNames}>
            {withConditionalInnerWrapper(children, innerHTML)}
        </Tag>
    );
}