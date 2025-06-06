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

            case 'a':
                return (
                    <a href={attribs.href || '#'} target="_blank" rel="noopener noreferrer">
                        {domToReact(children, { replace })}
                    </a>
                );

            case 'code':
                return <code className="inline-code">{domToReact(children, { replace })}</code>;

            case 'kbd':
                return <kbd className="kbd">{domToReact(children, { replace })}</kbd>;

            case 'mark':
                const rawStyle = attribs.style || '';
                const className = attribs.class || '';

                const parsedStyle = rawStyle ? rawStyle.split(';').reduce((acc, rule) => {
                    const [key, value] = rule.split(':').map(s => s.trim());
                    if (key && value) {
                        const reactKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
                        acc[reactKey] = value;
                    }
                    return acc;
                }, {}) : {};

                const onlyContainsText = children?.every(
                    child => child.type === 'text' || (child.type === 'tag' && child.name === 'br')
                );

                if (!onlyContainsText) {
                    console.warn('<mark> contains unexpected non-text nodes.');
                }

                return <mark className={className} style={parsedStyle}>
                    {domToReact(children)}
                </mark>;

            case 'img':
                return (
                    <img
                        src={attribs.src}
                        alt={attribs.alt || ''}
                        className="inline-image"
                        style={{ display: 'inline', maxHeight: '1em', verticalAlign: 'middle' }}
                    />
                );

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