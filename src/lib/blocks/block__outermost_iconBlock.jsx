import React, { cloneElement, isValidElement } from "react";
import { joinClassNames } from "@/lib/utils";
import { convertColour } from "../styler";
import { parseHTML } from "@/lib/parser";
import { Figure } from "@/components/elements";

export default function Block__Outermost_IconBlock({ block, keyPrefix }) {
    const { attrs = {}, idAttribute = '', processedClassNames = '' } = block;

    const iconColour = convertColour(attrs.iconColor || attrs.iconColorValue || attrs.customIconColor || 'currentColor');
    const iconBackgroundColour = convertColour(attrs.iconBackgroundColor || attrs.iconBackgroundColorValue || attrs.customIconBackgroundColor || 'transparent');

    const flipHorizontally = attrs.flipHorizontal ? '-scale-x-100' : '';
    const flipVertically = attrs.flipVertical ? '-scale-y-100' : '';

    const iconWidth = attrs.width || '24px';
    
    // Strip any width-related Tailwind class (e.g. w-6, w-[10rem], w-full, etc.)
    const filteredClassNames = processedClassNames
        .split(' ')
        .filter(cls => !/^w(-|\[)/.test(cls))
        .join(' ');

    const blockClassNames = joinClassNames(
        ['icon-block'],
        filteredClassNames,
        [`text-${iconColour}`],
        [`bg-${iconBackgroundColour}`],
        flipHorizontally,
        flipVertically
    );

    //extract the SVG icon from the innerHTML
    const iconHTML = block.innerHTML.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    let iconSVG = iconHTML ? iconHTML[0] : '';

    //remove the 'width' and 'height' attributes from the SVG if they exist
    iconSVG = iconSVG.replace(/width="[^"]*"/i, '').replace(/height="[^"]*"/i, '');

    //convert the SVG to a React component
    const parsed = parseHTML(iconSVG);
    const rawIcon = Array.isArray(parsed) ? parsed[0] : parsed;

    const IconComponent = isValidElement(rawIcon)
        ? cloneElement(rawIcon, {
            className: joinClassNames(rawIcon.props.className,  `w-[${iconWidth}]`, `h-[${iconWidth}]`),
            ...rawIcon.props,
        })
        : rawIcon;

    return (
        <Figure
            key={keyPrefix}
            figureClassNames={blockClassNames}
            {...(idAttribute ? { id: idAttribute } : {})}
        >
            {IconComponent}
        </Figure>
    );
}
