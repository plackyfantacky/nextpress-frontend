import React from 'react';
import { A } from '@/components/elements';
import { renderInlineHTML } from "@/lib/parser";
import { extractTag, extractAttributeValue, joinClassNames } from "@/lib/utils";

export default function BlockButton({ block, keyPrefix }) {
    const {attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block; 
    
    //button style defaults
    const bgColour = attrs.backgroundColor || '';
    const textColour = attrs.textColor || '';
    
    //if the button has a width or height, we need to add it to the class names
    const widthClass = attrs.buttonWidth ? `w-[${attrs.buttonWidth}]` : '';
    const heightClass = attrs.buttonHeight ? `h-[${attrs.buttonHeight}]` : ''; 

    const blockClassNames = joinClassNames(
        blockClassName,
        normalisedClassNames,
        [(bgColour ? `bg-${bgColour}` : 'bg-[#32373c]')],
        [(textColour ? `text-${textColour}` : 'text-white')],
        `text-center`,
        widthClass,
        heightClass,
    );
    
    const a_tag_content = renderInlineHTML(extractTag(innerHTML, 'a', true, true) || '');
    const href = extractAttributeValue(innerHTML, 'a', 'href') || '#';

    return (
        <A
            key={keyPrefix}
            className={blockClassNames}
            {...(idAttribute ? { id: idAttribute } : {})}
            {...(href ? { href: href } : {})}
        >
            {a_tag_content}
        </A>
    );
}