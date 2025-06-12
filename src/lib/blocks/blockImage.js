import React from 'react';
import {
    joinClassNames,
    extractTextFromTag,
    extractFigureBody,
    extractAttributeValue,
    stripFigcaption,
    normalizeFigureClasses,
    parseWidthFromStyle
} from '../utils';
import { renderInlineHTML } from '../parser';
import Lightbox from '@/components/Lightbox';

export default function BlockImage({ block, keyPrefix }) {
    const { attrs = {}, blockClassName = '', extractedClassNames = '', innerHTML = '' } = block;
    const {
        width,
        height,
        scale,
        aspectRatio,
        linkDestination,
    } = attrs;

    const isLightboxEnabled = attrs?.lightbox?.enabled === true;

    const figureBody = extractFigureBody(innerHTML);
    const figure = stripFigcaption(figureBody);
    const rawFigureClass = normalizeFigureClasses(extractAttributeValue({ html: innerHTML, tag: 'figure', attribute: 'class' }));

    const imgSrc = extractAttributeValue({ html: figureBody, attribute: 'src' });
    const imgAlt = extractAttributeValue({ html: figureBody, attribute: 'alt' });

    const imgWidth = width || parseWidthFromStyle(figureBody);

    const figureClass = joinClassNames(
        blockClassName,
        normalizeFigureClasses(rawFigureClass),
        imgWidth ? `w-[${imgWidth}]` : '',
    );

    const caption = extractTextFromTag(innerHTML, 'figcaption');

    return (
        <figure key={keyPrefix} className={figureClass}>
            {isLightboxEnabled ? (
                <Lightbox src={imgSrc} alt={imgAlt} id="lightbox-1" />
            ) : (
                renderInlineHTML(figure, {
                    context: {
                        lightbox: false,
                        imageAttrs: { width, height, scale, aspectRatio }
                    }
                })
            )}
            {caption && <figcaption className="max-w-full break-words">{renderInlineHTML(caption)}</figcaption>}
        </figure>
    );

}