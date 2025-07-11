import React from "react";
import { extractAttributeValue, joinClassNames } from "@/lib/utils";
import { normaliseClassNames, convertColour } from "@/lib/styler";

export default function BlockCover({ block, keyPrefix, postContext, children }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', innerHTML = ''} = block;
    const {
        //style = {}, TODO: handle style object (it should only be drop shadows but their format is weird)
        alt,
        url = '', // this is the image URL, if not using featured image
        useFeaturedImage = false,
        customOverlayColor = '', // this is not output in innerHTML, so process it directly
        dimRatio = 100, // append to bg- classes
        focalPoint = { x: 0.5, y: 0.5 },
        tagName: Tag = 'section', // this is not output in innerHTML, so process it directly
    } = attrs;

    let normalisedImageClasses = normaliseClassNames(extractAttributeValue({ html: innerHTML, attribute: 'class', tag: 'div', index: 1 }) || '');
    let normalisedOverlayClasses = normaliseClassNames(extractAttributeValue({ html: innerHTML, attribute: 'class', tag: 'span' }) || '');
    const imageURL = (useFeaturedImage ? postContext?.postImage : url) || '';

    //if focalPoint is something other than { x: 0.5, y: 0.5 }, then we need to set the background position as a tailwind class
    const focalPointClass = focalPoint && (focalPoint.x !== 0.5 || focalPoint.y !== 0.5) ? `bg-position-[${focalPoint.x * 100}%_${focalPoint.y * 100}%]` : '';

    const dimRatioValue = dimRatio !== undefined && dimRatio !== 100 ? Math.round(dimRatio) : 100; // ensure dimRatio is a number between 0 and 100
    const dimRatioClass = dimRatioValue < 100 ? `opacity-${dimRatioValue}` : '';

    //some attrs may be customised in WP admin
    // - attrs.style.color (for custom) or attrs.textColor (for named)
    //-  attrs.style.elements.heading.color.text
    // -  also check if the className contains `has-white-color`

    const textColour = convertColour(attrs.style?.color || attrs.textColor || attrs.className?.match(/has-(\w+)-color/)?.[1] || '');
    const headingTextColour = convertColour(attrs.style?.elements?.heading?.color?.text || '');
    //it might be possible for headings to have a background colour (the WP UI allows this)
    const headingBackgroundColour = convertColour(attrs.style?.elements?.heading?.color?.background || '');

    let colorClasses = [];
    if (textColour) { colorClasses.push(`[&>*]:text-${textColour}`); }
    
    // using addVariant in tailwind.config.js, we can add a variant for headings
    if (headingTextColour) colorClasses.push(`has-headings:text-${headingTextColour}`);
    if (headingBackgroundColour) colorClasses.push(`has-headings:bg-${headingBackgroundColour}`);

    const blockContainerClasses = joinClassNames(
        blockClassName,
        'relative flex flex-col w-full @container/cover'
    );

    const blockImageClasses = joinClassNames(
        'cover-image',
        normalisedImageClasses,
        'absolute inset-0 z-0 flex w-full h-full',
        focalPointClass
    );

    const blockImageStyle = {
        ...imageURL ? { backgroundImage: `url(${imageURL})` } : {},
    };

    const blockOverlayClasses = joinClassNames(
        'cover-overlay',
        normalisedOverlayClasses,
        'absolute inset-0 z-[1] pointer-events-none',
        dimRatioClass
    );

    const blockOverlayStyle = customOverlayColor ? { backgroundColor: customOverlayColor } : {};

    const blockContentClasses = joinClassNames(
        'cover-content',
         'flex flex-col relative z-[2]',
        colorClasses,
    );

    return (
        <Tag key={keyPrefix} className={blockContainerClasses} {...( idAttribute ? { id: idAttribute } : {} )}>
            <div role="img" aria-label={alt || ''} className={blockImageClasses} {...(blockImageStyle ? { style: blockImageStyle } : {})} />
            <span aria-hidden="true" className={blockOverlayClasses} {...(blockOverlayStyle ? { style: blockOverlayStyle } : {})} />
            <div className={blockContentClasses}>{children}</div>
        </Tag>
    );
}