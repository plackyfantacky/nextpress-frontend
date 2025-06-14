import React from "react";
import { normalizeClassNames, contentPositionToTailwind, extractAttributeValue, joinClassNames, withConditionalInnerWrapper } from "@/lib/utils";

export default function BlockCover({ block, keyPrefix, postContext, children }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalizedClassNames = '', innerHTML = ''} = block;
    const {
        minHeight = 300,
        minHeightUnit = 'px',
        //style = {}, TODO: handle style object (it should only be drop shadows but their format is weird)
        alt,
        url = '', // this is the image URL, if not using featured image
        useFeaturedImage = false,
        customOverlayColor = '', // this is not output in innerHTML, so process it directly
        dimRatio = 50, // append to bg- classes
        focalPoint = { x: 0.5, y: 0.5 },
        contentPosition = 'center center', // this is not output in innerHTML, so process it directly
        tagName: Tag = 'section', // this is not output in innerHTML, so process it directly
    } = attrs;

    let normalisedImageClasses = normalizeClassNames(extractAttributeValue({ html: innerHTML, attribute: 'class', tag: 'div', index: 1 }) || '');
    let normalisedOverlayClasses = normalizeClassNames(extractAttributeValue({ html: innerHTML, attribute: 'class', tag: 'span' }) || '');
    let normalisedPositioningClasses = contentPositionToTailwind(contentPosition);

    const imageURL = (useFeaturedImage ? postContext?.postImage : url) || '';
    const minHeightValue = `${minHeight}${minHeightUnit}`; // there will always be a minHeight and minHeightUnit (default params)

    //if focalPoint is something other than { x: 0.5, y: 0.5 }, then we need to set the background position as a tailwind class
    const focalPointClass = focalPoint && (focalPoint.x !== 0.5 || focalPoint.y !== 0.5) ? `bg-position-[${focalPoint.x * 100}%_${focalPoint.y * 100}%]` : '';

    //TODO: Tailwind 4.1 prefers bg-<color>/<opacity_as_percentage> but custom colors can be used yet.
    //if dimRatio is not 0, then we need to set the opactity as a tailwind class. Convert dimRatio decimal to percentage and output `opacity-<dimRatio>`
    const dimRatioClass = dimRatio > 0 ? `opacity-${dimRatio}` : '';

    const blockContainerClasses = joinClassNames(
        blockClassName,
        normalizedClassNames,
        'relative',
        normalisedPositioningClasses
    );

    const blockContainerStyle = {
        minHeight: minHeightValue,
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
        normalisedPositioningClasses
    );

    return (
        <Tag key={keyPrefix} className={blockContainerClasses} {...(blockContainerStyle ? { style: blockContainerStyle } : {})} {...( idAttribute ? { id: idAttribute } : {} )}>
            <div role="img" aria-label={alt || ''} className={blockImageClasses} {...(blockImageStyle ? { style: blockImageStyle } : {})} />
            <span aria-hidden="true" className={blockOverlayClasses} {...(blockOverlayStyle ? { style: blockOverlayStyle } : {})} />
            {withConditionalInnerWrapper(children, innerHTML, blockClassName, blockContentClasses)}
        </Tag>
    );
}