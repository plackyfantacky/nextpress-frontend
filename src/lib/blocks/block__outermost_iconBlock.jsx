import React from "react";
import { joinClassNames } from "@/lib/utils";
import { convertColour } from "../styler";
import { parseHTML } from "@/lib/parser";
import { Figure } from "@/components/elements";

export default function Block__Outermost_IconBlock({ block, keyPrefix }) {
    const { attrs = {}, idAttribute = '', normalisedClassNames = '' } = block;

    const iconColour = convertColour(attrs.iconColor || attrs.iconColorValue || attrs.customIconColor || 'currentColor');
    const iconBackgroundColour = convertColour(attrs.iconBackgroundColor || attrs.iconBackgroundColorValue || attrs.customIconBackgroundColor || 'transparent');

    const blockClassNames = joinClassNames(
        ['icon-block'],
        normalisedClassNames,
        [`text-${iconColour}`],
        [`bg-${iconBackgroundColour}`]
    );

    //extract the SVG icon from the innerHTML
    const iconHTML = block.innerHTML.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    let iconSVG = iconHTML ? iconHTML[0] : '';

    //remove the 'width' and 'height' attributes from the SVG if they exist
    iconSVG = iconSVG.replace(/width="[^"]*"/i, '').replace(/height="[^"]*"/i, '');

    //convert the SVG to a React component
    const IconComponent = parseHTML(iconSVG );

    return (
        <Figure
            key={keyPrefix}
            figureClassNames={blockClassNames}
            {...(idAttribute ? { id: idAttribute } : {})}
            style={{ width: attrs.width || '24px' }}
        >
            {IconComponent}
        </Figure>
    );
}
