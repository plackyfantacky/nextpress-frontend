import React from "react";
import { joinClassNames, withConditionalInnerWrapper } from "@/lib/utils";

export default function BlockGroup({ block, keyPrefix, children }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block;
    const { layout = {}, tagName: Tag = 'div' } = attrs;

    // TODO: unclear if this will be used anywhere else, so wondering if its worth moving this to @/lib/utils.js
    const mapFlexDirections = (direction) => {
        switch (direction) {
            case 'left': return 'start';
            case 'right': return 'end';
            case 'center': return 'center';
            case 'justify': return 'between';
            default: return direction;
        }
    }

    const isFlex = layout.type === 'flex';
    const orientation = isFlex ? (layout.orientation || 'horizontal') : 'group';
    const wrapping = isFlex ? ( layout.wrapping || false) : '';
    const justifyContent = isFlex ? ( mapFlexDirections(layout.justifyContent) || 'start' ) : '';;
    const alignItems = isFlex ? ( mapFlexDirections(layout.alignItems) || 'start' ) : '';;
    
    const blockClassNames = joinClassNames(
        isFlex ? ( orientation === 'horizontal' ? 'row-block' : 'stack-block' ) : 'group-block',
        normalisedClassNames,
        isFlex ? 'flex' : '',
        isFlex ? (orientation === 'horizontal' ? 'flex-row' : 'flex-col') : '',
        isFlex ? (wrapping ? 'flex-wrap' : 'flex-nowrap') : '',
        isFlex ? `justify-${justifyContent}` : '',
        isFlex ? `items-${alignItems}` : '',
    );

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            {withConditionalInnerWrapper(children, innerHTML, blockClassName)}
        </Tag>
    );
}