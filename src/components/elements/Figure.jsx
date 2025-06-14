import Image from "./Image";
import Lightbox from "../Lightbox";

export default function Figure(props) {
    const {
        src,
        alt = '',
        width = 600,
        height = 400,
        className = '',
        captionClassName = '',
        objectFit = 'cover',
        figureClassName = '',
        caption = '',
        lightbox = false } = props;

    return (
        <figure {...Figure(props.keyPrefix ? { key: keyPrefix } : {})} className={figureClassName}>
            {lightbox ? (
                <Lightbox src={src} alt={alt} id="lightbox-1" />
            ) : (
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={className}
                    style={{ objectFit }}
                />
            )}
            {caption && (
                <figcaption className={captionClassName}>{caption}</figcaption>
            )}
        </figure>
    );
}
