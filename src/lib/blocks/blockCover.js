import React from "react";

import { normalizeClassNames, extractAttributeValue, joinClassNames, withConditionalInnerWrapper } from "@/lib/utils";

export default function BlockCover({ block, keyPrefix, postContext, children }) {
    const { attrs = {}, blockName = '', normalizedClassNames = '', innerHTML = '' } = block;
    const {
        minHeight = 200,
        minHeightUnit = 'px',
        //style = {}, TODO: handle style object (it should only be drop shadows but their format is weird)
        alt,
        url = '', // this is the image URL, if not using featured image
        useFeaturedImage = false,
        dimRatio = 50, // append to bg- classes
        focalPoint = { x: 0.5, y: 0.5 },
        tagName = 'section',
    } = attrs;


    let normalisedImageClasses = normalizeClassNames(extractAttributeValue({ html: innerHTML, attribute: 'class', tag: 'div', index: 1 }) || '');
    let normalisedOverlayClasses = normalizeClassNames(extractAttributeValue({ html: innerHTML, attribute: 'class', tag: 'span' }) || '');

    const Tag = tagName;
    const imageURL = (useFeaturedImage ? postContext?.postImage : url) || '';
    const minHeightValue = `${minHeight}${minHeightUnit}`; // there will always be a minHeight and minHeightUnit (default params)

    //if focalPoint is something other than { x: 0.5, y: 0.5 }, then we need to set the background position as a tailwind class
    const focalPointClass = focalPoint && (focalPoint.x !== 0.5 || focalPoint.y !== 0.5) ? `bg-position-[${focalPoint.x * 100}%_${focalPoint.y * 100}%]` : '';

    //if any css class in normalisedOverlayClasses starts with 'bg-', append `/{dimRatio}` to just that class. note there could be multiple classes
    if (normalisedOverlayClasses && normalisedOverlayClasses.startsWith('bg-')) { // && dimRatio > 0 //dimRatio is 50 by default
        normalisedOverlayClasses = normalisedOverlayClasses.split(' ').map(cls => {
            if (cls.startsWith('bg-')) {
                return `${cls}/${dimRatio}`;
            }
            return cls;
        }
        ).join(' ');
    }

    const blockContainerClasses = joinClassNames(
        blockName,
        normalizedClassNames,
        minHeightValue,
        'relative w-full'
    );

    const blockContainerStyle = {
        minHeight: minHeightValue,
        //style, // TODO: handle style object (it should only be drop shadows but their format is weird)
    };

    const blockImageClasses = joinClassNames(
        'cover-image',
        normalisedImageClasses,
        focalPointClass,
        'absolute inset-0 z-0',
    );

    const blockImageStyle = {
        ...imageURL ? { backgroundImage: `url(${imageURL})` } : {},
    };

    const blockOverlayClasses = joinClassNames(
        'cover-overlay',
        normalisedOverlayClasses,
        'absolute inset-0 z-10 pointer-events-none',
    );


    console.log('COVER blockImageClasses', blockImageClasses);
    console.log('COVER blockContainerClasses', blockContainerClasses);
    console.log('COVER blockOverlayClasses', blockOverlayClasses);
    console.log();

    return (
        <Tag key={keyPrefix} className={blockContainerClasses} {...(blockContainerStyle ? { style: blockContainerStyle } : {})}>
            <div role="img" aria-label={alt || ''} className={blockImageClasses} {...(blockImageStyle ? { style: blockImageStyle } : {})} />
            <span aria-hidden="true" className={blockOverlayClasses} />

            {withConditionalInnerWrapper(children, innerHTML, blockName, 'z-20 relative')}
        </Tag>

    );
}