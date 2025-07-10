import React from 'react';
import Image from '@/components/elements/Image';
import { renderBlocksRecursively } from '@/lib/blocks';
import { joinClassNames } from '@/lib/utils';
import { Figure } from "@/components/elements";

export default function BlockMediaText({ block, keyPrefix, postContext }) {
    const { attrs = {}, idAttribute = '', processedClassNames = '', innerBlocks = [] } = block;

    const {
        mediaUrl,
        mediaAlt = '',
        mediaId,
        useFeaturedImage = false,
        imageFill = false,
        mediaPosition = 'left',
        verticalAlignment = ''
    } = attrs;

    const layoutDirection =
        mediaPosition === 'right' ? 'flex-row-reverse' : 'flex-row';

    const alignmentClass = {
        top: 'items-start',
        center: 'items-center',
        bottom: 'items-end'
    }[verticalAlignment] || '';

    // isStackedOnMobile will only come from innerHTML, so we need to check if it exists. There is no attribute for it in the block.
    const isStackedOnMobile = block.innerHTML?.includes('is-stacked-on-mobile') || false;

    const blockClassNames = joinClassNames(
        'media-text',
        `media-text--${mediaPosition}`,
        `media-text--${isStackedOnMobile ? 'stacked' : 'inline'}`,
        `media-text--${imageFill ? 'fill' : 'contain'}`,
        alignmentClass,
        processedClassNames
    );

    const imageSrc = mediaUrl || (useFeaturedImage ? postContext?.postImage : null);

    const image = imageSrc ? (
        <div className="media-text__media flex-1">
            <Figure
                src={imageSrc}
                alt={mediaAlt}
                id={mediaId}
                imgClassNames={`w-full ${ imageFill ? 'h-full' : 'h-auto' } object-cover ${isStackedOnMobile ? 'sm:w-full' : ''}`.trim()}
                figureClassNames="w-full"
            />
        </div>
    ) : null;

    const content = (
        <div className="media-text__content flex-1">
            {renderBlocksRecursively(innerBlocks, `${keyPrefix}-media-text-content`, postContext)}
        </div>
    );

    const wrapperClassNames = joinClassNames(
        'media-text__wrapper',
        `flex ${layoutDirection}`,
        `${isStackedOnMobile ? 'flex-col sm:flex-row' : ''} ${alignmentClass}`
    ).trim();

    return (    
        <div key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            <div className={wrapperClassNames}>
                {image}
                {content}
            </div>
        </div>
    );
}
