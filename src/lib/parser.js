import React from 'react';
import hljs from 'highlight.js';
import parse, { domToReact } from 'html-react-parser';

/**
 * Renders highlighted code using highlight.js.
 * @param {string} code - The code to highlight.
 * @returns {ReactNode} The highlighted code as React elements.
 */
export function renderHighlightedCode(code) {
    const result = hljs.highlightAuto(code); // <-- raw string in
    return parse(result.value || '');
}

/**
 * Converts a CSS style string into a React style object.
 * @param {string} style - The inline style string.
 * @returns {object} The parsed style object.
 */
export function parseStyleString(style = '') {
    return style
        .split(';')
        .filter(Boolean)
        .reduce((acc, rule) => {
            const [key, value] = rule.split(':').map(s => s.trim());
            if (key && value) {
                const reactKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
                acc[reactKey] = value;
            }
            return acc;
        }, {});
}

/**
 * Decodes HTML entities in a string.
 * @param {string} str - The string to decode.
 * @returns {string} The decoded string.
 */
export function decodeHTMLEntities(encoded = '') {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const txt = document.createElement('textarea');
        txt.innerHTML = encoded;
        return txt.value;
    }

    // Fallback for Node/server environments
    return encoded
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

/**
 * Renders inline HTML content into React elements.
 * @param {string} html - The HTML string to parse.
 * @returns {ReactNode} The parsed React elements.
 */
export function renderInlineHTML(html = '') {
    const replace = (node) => {
        if (node.type !== 'tag') return;

        const { name, children = [], attribs = {} } = node;

        switch (name) {
            case 'strong':
            case 'em':
            case 'b': //extra
            case 'i': //extra
            case 'sub':
            case 'sup':
            case 'del':
            case 'span': //extra
                return React.createElement(name, {}, domToReact(children, { replace }));

            case 'a': {
                return (
                    <a href={attribs.href || '#'} target="_blank" rel="noopener noreferrer">
                        {domToReact(children, { replace })}
                    </a>
                );
            }

            case 'code':
                return <code className="inline-code">{domToReact(children, { replace })}</code>;

            case 'kbd':
                return <kbd className="kbd">{domToReact(children, { replace })}</kbd>;

            case 'mark': {

                const rawStyle = attribs?.style || '';
                const rawClass = attribs?.class || '';

                const parsedStyle = parseStyleString(rawStyle)

                const classNames = rawClass
                    .split(/\s+/)
                    .map(cls => {
                        const match = cls.match(/^has-([a-z0-9-]+)-color$/i);
                        return match ? `text-${match[1]}` : null;
                    })
                    .filter(Boolean)
                    .join(' ');
                    
                const onlyContainsText = children?.every(
                    child => child.type === 'text' || (child.type === 'tag' && child.name === 'br')
                );

                if (!onlyContainsText) {
                    console.warn('<mark> contains unexpected non-text nodes.');
                }

                return <mark className={classNames} style={parsedStyle}>
                    {domToReact(children)}
                </mark>;
            }

            case 'img': {
                const { src, alt = '', title = '', style: rawStyle = ''} = attribs;
                const parsedStyle = parseStyleString(rawStyle);

                const img = (
                    <img
                        src={src}
                        alt={alt}
                        {...title ? { title} : {}}
                        className="image-itself"
                        style={ parsedStyle || {
                            display: 'inline',
                            maxHeight: '1em',
                            verticalAlign: 'middle'
                        }}
                    />
                );

                if(this?.options?.context?.lightbox && src) {
                    return (
                        <a href={src} data-lightbox="gallery" data-src={src} className="lightbox">
                            {img}
                        </a>
                    );
                }

                return img;
            }

            case 'sup':
                // Handle footnotes like: <sup><a href="#fn1" id="fnref1">1</a></sup>
                if (children.length === 1 && children[0].name === 'a') {
                    return (
                        <sup>
                            <a
                                href={children[0].attribs?.href || '#'}
                                id={children[0].attribs?.id || ''}
                                className="footnote"
                            >
                                {domToReact(children[0].children)}
                            </a>
                        </sup>
                    );
                }
                return <sup>{domToReact(children, { replace })}</sup>;

            default:
                return undefined;
        }
    };
    return parse(html, { replace });

}