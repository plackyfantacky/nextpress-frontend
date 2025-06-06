import React from "react";
import { contentPositionToTailwind, joinClassNames, withConditionalInnerWrapper } from "../utils";

export default function BlockCover({ block, keyPrefix, postContext, children }) {
    const { attrs, blockClassName, innerHTML } = block;
    const {
        url,
        alt,
        id,
        useFeaturedImage = false,
        hasParallax,
        isRepeated,
        dimRatio = 50,
        overlayColor,
        isUserOverlayColor,
        focalPoint,
        contentPosition = 'center center',
        tagName = 'section',
        className = '', //explicably set by the user in the editor
        sizeSlug,
        align,
        layout = {}
    } = attrs;

    const Tag = tagName;
    const positionClass = contentPositionToTailwind(contentPosition);

    let bgColour = overlayColor ? (`bg-${overlayColor}` + (dimRatio ? `/${dimRatio}` : '')) : '';

    const overlayClasses = joinClassNames(
        'cover-overlay',
        !isUserOverlayColor && overlayColor ? `bg-${overlayColor || 'black'}`: '',
        bgColour,
        'absolute inset-0 z-10 pointer-events-none',
    );

    const overlayStyle = {
        ...(dimRatio > 0 ? { opacity: dimRatio / 100 } : {}),
        ...(isUserOverlayColor && overlayColor ? { backgroundColor: overlayColor } : {})
    };

    const imageURL = useFeaturedImage ? postContext?.postImage : url;

    const bgStyle = {
        backgroundImage: imageURL ? `url(${imageURL})` : undefined,
        backgroundPosition: focalPoint ? `${focalPoint.x * 100}% ${focalPoint.y * 100}%` : undefined,
    }

    const imageClasses = joinClassNames(
        'cover-image',
        id ? `asset-${id || 'default'}` : '',
        sizeSlug ? `image-${sizeSlug}` : '',
        hasParallax ? 'parallax' : '',
        isRepeated ? 'bg-repeat' : 'bg-cover',
        'absolute inset-0 z-0',
    );

    const containerClass = joinClassNames(
        blockClassName,
        className,
        align ? `align-${align || 'center'}` : '',
        hasParallax ? 'parallax' : '',
        isRepeated ? 'bg-repeat' : 'bg-cover',
        positionClass,
        'relative flex items-center justify-center min-h-[200px] min-w-full overflow-hidden',
    );
    
    const finalClassNames = joinClassNames(blockClassName, contentPositionToTailwind(contentPosition), className);

    return (
        <Tag key={keyPrefix} className={containerClass}>
            {imageURL && (
                <div role="img" aria-label={alt || ''} className={imageClasses} style={bgStyle} />
            )}
            <span aria-hidden="true" className={overlayClasses} style={overlayStyle} />

            {withConditionalInnerWrapper(children, innerHTML, blockClassName)}
        </Tag>
    );
}