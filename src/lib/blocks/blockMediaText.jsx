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

    const blockClassNames = joinClassNames(
        'media-text-block',
        'flex gap-8',
        (mediaPosition === 'right' ? 'flex-row-reverse' : 'flex-row'),
        processedClassNames
    );

    // isStackedOnMobile will only come from innerHTML, so we need to check if it exists. There is no attribute for it in the block.
    const isStackedOnMobile = block.innerHTML?.includes('is-stacked-on-mobile') || false;

    const imageSrc = mediaUrl || (useFeaturedImage ? postContext?.postImage : null);
    const imageClassNames = joinClassNames(
        'w-full',
        'object-cover',
        (imageFill ? 'h-full' : 'h-auto'),
        (isStackedOnMobile ? 'sm:w-full' : ''),
    );

    const image = imageSrc ? (
        <div className="media-text--media flex-1">
            <Figure
                src={imageSrc}
                alt={mediaAlt}
                id={mediaId}
                imgClassNames={imageClassNames}
                figureClassNames="w-full"
            />
        </div>
    ) : null;

    const content = (
        <div className="media-text--content flex-1">
            {renderBlocksRecursively(innerBlocks, `${keyPrefix}-media-text-content`, postContext)}
        </div>
    );

    return (    
        <div key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            {image}
            {content}
        </div>
    );
}
