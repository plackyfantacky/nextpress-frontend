import React from 'react';
import { joinClassNames, extractTag, extractAttributeValue, parseWidthFromStyle } from "@/lib/utils";
import { Figure } from '@/components/Elements';

export default function BlockImage({ block, keyPrefix }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = ''} = block;
    const { lightbox = { enabled: false }  } = attrs;

    //get the contents of the figure tag from the innerHTML - we're rebuilding it from scratch
    const figureBody = extractTag(innerHTML, 'figure', true) || '';

    // The internal img element
    const imgSrc = extractAttributeValue({ html: figureBody, attribute: 'src' });
    const imgAlt = extractAttributeValue({ html: figureBody, attribute: 'alt' });
    const imgWidth = attrs.width || parseWidthFromStyle(figureBody);
    const imgHeight = attrs.height || '';
    let imgID = idAttribute || '';

    let linkHref;
    if(attrs.linkDestination && attrs.linkDestination !== 'none') {
        // If the image is linked, we need to wrap it in a link element. to do that we need to extract the link attributes
        linkHref = extractAttributeValue({ html: figureBody, attribute: 'href' });
    }

    const figureClasses = joinClassNames(
        blockClassName,
        normalisedClassNames,
        imgWidth ? `w-[${imgWidth}]` : '',
    );

    // The figcaption element (if any)
    const caption = extractTag(innerHTML, 'figcaption', true) || '';
   
    return (
        <Figure
            key={`${keyPrefix}-figure`}
            src={imgSrc}
            alt={imgAlt}
            width={imgWidth}
            height={imgHeight}
            imgID={imgID}
            figureClassNames={figureClasses}
            caption={caption}
            lightbox={lightbox.enabled}
            {...( linkHref ? { linkHref: linkHref } : {})}
        />
    );
}