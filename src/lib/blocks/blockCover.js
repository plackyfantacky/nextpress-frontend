import React from "react";
import { extractAttributeValue, joinClassNames } from "@/lib/utils";
import { normaliseClassNames } from "@/lib/styler";

export default function BlockCover({ block, keyPrefix, postContext, children }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', innerHTML = ''} = block;
    const {
        minHeight = 300,
        minHeightUnit = 'px',
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
    const minHeightValue = `${minHeight}${minHeightUnit}`; // there will always be a minHeight and minHeightUnit (default params)

    //if focalPoint is something other than { x: 0.5, y: 0.5 }, then we need to set the background position as a tailwind class
    const focalPointClass = focalPoint && (focalPoint.x !== 0.5 || focalPoint.y !== 0.5) ? `bg-position-[${focalPoint.x * 100}%_${focalPoint.y * 100}%]` : '';

    const dimRatioValue = dimRatio !== undefined && dimRatio !== 100 ? Math.round(dimRatio) : 100; // ensure dimRatio is a number between 0 and 100
    const dimRatioClass = dimRatioValue < 100 ? `opacity-${dimRatioValue}` : '';

    const blockContainerClasses = joinClassNames(
        blockClassName,
        normalisedPositioningClasses,
        'relative flex flex-col @container/cover'
    );

    const blockContainerStyle = {
        //minHeight: minHeightValue,
        //style, // TODO: handle style object (it should only be drop shadows but their format is weird)
    };

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
    );

    return (
        <Tag key={keyPrefix} className={blockContainerClasses} {...(blockContainerStyle ? { style: blockContainerStyle } : {})} {...( idAttribute ? { id: idAttribute } : {} )}>
            <div role="img" aria-label={alt || ''} className={blockImageClasses} {...(blockImageStyle ? { style: blockImageStyle } : {})} />
            <span aria-hidden="true" className={blockOverlayClasses} {...(blockOverlayStyle ? { style: blockOverlayStyle } : {})} />
            <div className={blockContentClasses}>{children}</div>
        </Tag>
    );
}