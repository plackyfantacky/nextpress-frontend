import React from 'react';
import { A } from '@/components/elements';
import { renderInlineHTML } from "@/lib/parser";
import { extractTag, extractAttributeValue, joinClassNames } from "@/lib/utils";

export default function BlockButton({ block, keyPrefix, postContext, inheritedProps, children }) {
    const {attrs = {}, idAttribute = '', blockClassName = '', processedClassNames = '', innerHTML = '' } = block; 
    const { url = '', target = '', rel = '' } = attrs;


    //button style defaults
    // const bgColour = attrs.backgroundColor || '';
    // const textColour = attrs.textColor || '';
    
    // //if the button has a width or height, we need to add it to the class names
    // const widthClass = attrs.buttonWidth ? `w-[${attrs.buttonWidth}]` : '';
    // const heightClass = attrs.buttonHeight ? `h-[${attrs.buttonHeight}]` : ''; 

    const blockClassNames = joinClassNames(
        blockClassName,
        processedClassNames,
    );

    const content = children?.length > 0
        ? children
        : renderInlineHTML(innerHTML ? innerHTML.trim() : '');
    
    const a_tag_content = renderInlineHTML(extractTag(innerHTML, 'a', true, true) || '');
    const href = url || '#';

    return (
        <A
            key={keyPrefix}
            className={blockClassNames}
            {...(idAttribute ? { id: idAttribute } : {})}
            {...(href ? { href: href } : {})}
        >
            {content}
        </A>
    );
}