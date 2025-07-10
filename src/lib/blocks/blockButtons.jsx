import React from "react";
import { joinClassNames } from "@/lib/utils";

export default function BlockButtons({ block, keyPrefix, children}) {
    const { attrs = {}, idAttribute = '', blockClassName = '', processedClassNames = ''} = block;

    const orientation = attrs.layout?.orientation || 'horizontal';
    const justifyContent = attrs.layout?.justifyContent || 'left';
    const verticalAlignment = attrs.layout?.verticalAlignment || 'top';

    // Convert orientation, justifyContent, and verticalAlignment to Tailwind CSS classes
    const orientationClass = orientation === 'vertical' ? 'flex-col' : 'flex-row';
    const justifyContentClass = `justify-${justifyContent}`;
    const verticalAlignmentClass = `items-${verticalAlignment}`;

    const blockClassNames = joinClassNames(
        blockClassName,
        processedClassNames,
        `flex gap-4 ${orientationClass} ${justifyContentClass} ${verticalAlignmentClass}`
    );

    return (
        <nav key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            {children}
        </nav>
    );
    
};
