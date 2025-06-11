import React from 'react';
import parse from 'html-react-parser';
import { joinClassNames, extractFigcaption, extractFigureBody, stripFigcaption } from '../utils';
import { renderInlineHTML } from '../parser';

export default function BlockImage({ block, keyPrefix }) {
    const { attrs = {}, blockClassName = '', extractedClassNames = '', innerHTML = '' } = block;
    const {
        id,
        width,
        height,
        sizeSlug,
        linkDestination,
        align,
    } = attrs;

    const figureClass = joinClassNames(
        'image-block',
        blockClassName,
        extractedClassNames,
        align ? `align${align}` : '',
        sizeSlug ? `size-${sizeSlug}` : ''
    );

    const caption = extractFigcaption(innerHTML);
    const figureBody = extractFigureBody(innerHTML);
    const figure = stripFigcaption(figureBody);

    return (
        <figure key={keyPrefix} className={figureClass}>
            {renderInlineHTML(figure, { context: { lightbox: attrs?.lightbox?.enabled } })}
            {caption && <figcaption>{renderInlineHTML(caption)}</figcaption>}
        </figure>
    )

}