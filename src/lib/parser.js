import React from 'react';
import parse, { domToReact } from 'html-react-parser';
import { normaliseClassNames } from '@/lib/styler';
import { A, Image } from '@/components/elements';

/**
 * Converts a CSS style string into a React style object.
 * @param {string} style - The inline style string.
 * @returns {object} The parsed style object.
 */
function parseStyleString(style = '') {
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

/** * Renders inline HTML content as React elements.
 * @param {string} html - The HTML string to render.
 * @returns {ReactNode} The rendered React elements.
 */
// TODO: Not critical, but using the 'Edit HTML' option in the WP Block Editor, it is possible customise the HTML outside of what this parser expects.
// Unhandled cases: custom tags, attributes added to existing tags.
export function renderInlineHTML(html = '') {
    const replace = (node) => {
        if (node.type !== 'tag') return;

        const { name, children = [], attribs = {} } = node;

        const replacedNode = domToReact(children, { replace });

        switch (name) {
            case 'b':
            case 'strong': {
                return <strong>{replacedNode}</strong>;
            }

            case 'i':
            case 'em':
            case 'italic': {
                return <em>{replacedNode}</em>;
            }

            case 'a': {
                return (<A href={attribs.href} target="_blank" rel="noopener noreferrer">{replacedNode}</A>);
            }

            case 'code':
                return <code className="inline-code">{replacedNode}</code>;

            case 'kbd':
                return <kbd className="kbd">{replacedNode}</kbd>;

            case 'mark': {

                const style = parseStyleString(attribs?.style || '');
                const classNames = normaliseClassNames(attribs?.class || '');

                // TODO: why is this one different (not using replacedNode)?
                return <mark className={classNames} style={style}>{domToReact(children)}</mark>;
            }

            case 'img': {
                const { src, alt = '', title = '', style: rawStyle = '' } = attribs;
                const parsedStyle = parseStyleString(rawStyle) || {
                    display: 'inline',
                    maxHeight: '1em',
                    verticalAlign: 'middle'
                };

                // Use this only for inline-images, not for figures or lightboxes.
                return <Image src={src} alt={alt} {...title ? { title } : {}} className="image-itself" style={parsedStyle} />;
            }

            case 'sup':
                // Handle footnotes like: <sup><a href="#fn1" id="fnref1">1</a></sup>
                if (children.length === 1 && children[0].name === 'a') {
                    return (
                        <sup>
                            <A href={children[0].attribs?.href} id={children[0].attribs?.id} className="footnote">
                                {domToReact(children[0].children)}
                            </A>
                        </sup>
                    );
                }
                return <sup>{replacedNode}</sup>;

            case 'sub':
                return <sub>{replacedNode}</sub>;

            case 'del':
            case 'div':
            case 'span': //extra
                return React.createElement(name, {}, domToReact(children, { replace }));

            default:
                return undefined;
        }
    };
    return parse(html, { replace });
}
