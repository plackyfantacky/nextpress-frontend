import React from 'react';
import { joinClassNames, extractTag, extractAttributeValue } from "@/lib/utils";
import { Figure } from '@/components/elements';
import { normaliseClassNames } from "@/lib/styler";

export default function BlockImage({ block, keyPrefix }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', processedClassNames = '', innerHTML = ''} = block;
    const { lightbox = { enabled: false }  } = attrs;

    //get the contents of the figure tag from the innerHTML - we're rebuilding it from scratch
    const figureBody = extractTag(innerHTML, 'figure', true) || '';

    // The internal img element
    let imgID = idAttribute || '';
    const imgSrc = extractAttributeValue({ html: figureBody, attribute: 'src' });
    const imgAlt = extractAttributeValue({ html: figureBody, attribute: 'alt' });
    const imgHeight = attrs.height || '';
    
    const imgWidth = attrs.width || (() => { 
        const match = figureBody.match(/width\s*:\s*([0-9.]+[a-z%]*)/i);
        return match ? match[1] : null;
    })();

    let linkHref;
    if(attrs.linkDestination && attrs.linkDestination !== 'none') {
        // If the image is linked, we need to wrap it in a link element. to do that we need to extract the link attributes
        linkHref = extractAttributeValue({ html: figureBody, attribute: 'href' });
    }

    //normalise class names
    let normalisedClassNames = normaliseClassNames(processedClassNames);

    const figureClasses = joinClassNames(
        blockClassName,
        normalisedClassNames
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