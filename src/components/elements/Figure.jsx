import React from 'react';
import Lightbox from "@/components/Lightbox";
import { A, Image } from "@/components/elements";

const Figure = ({children, ...props}) => {
    const {
        src,
        alt = '',
        width = '',
        height = '',
        imgClassNames = '',
        imgID = '',
        objectFit = 'cover',
        captionClassNames = '',
        figureClassNames = '',
        caption = '',
        lightbox = false,
        linkHref = '' } = props;
        
    const image = <Image
        src={src}
        alt={alt}
        {...(width ? { width } : {})}
        {...(height ? { height } : {})}
        {...(imgID ? { id: imgID} : {}) }
        className={[ imgClassNames, objectFit === 'cover' ? 'object-cover' : '' ].filter(Boolean).join(' ')} />;

    const content = lightbox
        ? <Lightbox
            src={src}
            alt={alt}
            {...(width ? { width } : {})}
            {...(height ? { height } : {})}
            {...(imgID ? { id: imgID} : {}) }
            {...(imgClassNames ? { className: imgClassNames } : {})} />
        : linkHref ? ( <A href={linkHref}>{image}</A> ) : image;

    return (
        <figure className={figureClassNames}>
            { children || content }
            { caption && <figcaption className={captionClassNames}>{caption}</figcaption> }
        </figure>
    );
}

export default Figure;