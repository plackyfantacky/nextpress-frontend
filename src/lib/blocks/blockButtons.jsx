import React from "react";
import { joinClassNames } from "@/lib/utils";

export default function BlockButtons({ block, keyPrefix, children}) {
    const { attrs = {}, idAttribute = '', blockClassName = '', processedClassNames = ''} = block;

    const blockClassNames = joinClassNames(
        blockClassName,
        processedClassNames
    );

    return (
        <nav key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            {children}
        </nav>
    );
    
};
