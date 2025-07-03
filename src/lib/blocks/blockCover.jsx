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
        contentPosition = 'center center', // this is not output in innerHTML, so process it directly. order is vertical horizontal.
        tagName: Tag = 'section', // this is not output in innerHTML, so process it directly
    } = attrs;

    let normalisedImageClasses = normaliseClassNames(extractAttributeValue({ html: innerHTML, attribute: 'class', tag: 'div', index: 1 }) || '');
    let normalisedOverlayClasses = normaliseClassNames(extractAttributeValue({ html: innerHTML, attribute: 'class', tag: 'span' }) || '');

    const [vertical, horizontal] = contentPosition.split(' ');
    const direction = { left: 'start', center: 'center', right: 'end' };

    let normalisedPositioningClasses = `flex items-${direction[horizontal] || 'center'} justify-${direction[vertical] || 'center'}`;

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
    if (headingTextColour) {
        colorClasses.push(
            `[&_h1]:text-${headingTextColour}`,
            `[&_h2]:text-${headingTextColour}`,
            `[&_h3]:text-${headingTextColour}`,
            `[&_h4]:text-${headingTextColour}`,
            `[&_h5]:text-${headingTextColour}`,
            `[&_h6]:text-${headingTextColour}`
        );
    }
    if (headingBackgroundColour) {
        colorClasses.push(
            `[&_h1]:bg-${headingBackgroundColour}`,
            `[&_h2]:bg-${headingBackgroundColour}`,
            `[&_h3]:bg-${headingBackgroundColour}`,
            `[&_h4]:bg-${headingBackgroundColour}`,
            `[&_h5]:bg-${headingBackgroundColour}`,
            `[&_h6]:bg-${headingBackgroundColour}`
        );
    }

    const blockContainerClasses = joinClassNames(
        blockClassName,
        normalisedPositioningClasses,
        'relative flex flex-col @container/cover'
    );

    const blockImageClasses = joinClassNames(
        'cover-image',
        normalisedImageClasses,
        focalPointClass,
        'absolute inset-0 z-0 flex w-full h-full',
    );

    const blockImageStyle = {
        ...imageURL ? { backgroundImage: `url(${imageURL})` } : {},
    };

    const blockOverlayClasses = joinClassNames(
        'cover-overlay',
        normalisedOverlayClasses,
        dimRatioClass,
        'absolute inset-0 z-[1] pointer-events-none',
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