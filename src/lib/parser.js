import React from 'react';
import hljs from 'highlight.js';
import parse, { domToReact } from 'html-react-parser';
import { extractTag, normaliseClassNames } from "./utils";
import { A, Image } from '@/components/Elements';

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

/**
 * Parses a table cell tag and extracts its content (not classnames or styles for now).
 * @param {string} tag - The HTML string of the table cell.
 * @param {string} tagName - The name of the tag to parse (default is 'td').
 * @returns {object} An object containing the content (classnames and style may be added later).
 */
export function parseCellTag(tag = '', tagName = 'td') {
    const contentMatch = tag.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));

    return { content: contentMatch[1]?.trim() || '' };
}

/**
 * Renders a table cell from a given tag.
 * @param {string} tag - The HTML string of the table cell.
 * @param {number} i - The index of the cell in the row.
 * @param {string} tagName - The name of the tag to render (default is 'td').
 * @returns {ReactNode} The rendered table cell as a React element.
 */
export function renderTableCell(tag, i, tagName = 'td') {
    const { content, className, style } = parseCellTag(tag, tagName);

    return React.createElement(
        tagName,
        {
            key: `cell-${i}`,
        },
        renderInlineHTML(content)
    );
}

/**
 * Renders a table row from a given HTML string.
 * @param {string} rowHTML - The HTML string of the table row.
 * @param {number} i - The index of the row in the table.
 * @param {string} cellTag - The name of the tag for table cells (default is 'td').
 * @returns {ReactNode|null} The rendered table row as a React element, or null if no cells are found.
 */
export function renderTableRow(rowHTML, i, cellTag = 'td') {
    const cellTags = extractTag(rowHTML, cellTag, false, false);
    if (!cellTags || cellTags.length === 0) return null;

    return (
        <tr key={`row-${i}`}>
            {cellTags.map((tag, j) => renderTableCell(tag, j, cellTag))}
        </tr>
    );
}

/**
 * Renders a table section (thead, tbody, tfoot) from a given HTML string.
 * @param {string} sectionTag - The tag of the section to render (thead, tbody, tfoot).
 * @param {string} innerHTML - The HTML string containing the section.
 * @returns {ReactNode|null} The rendered section as a React element, or null if no rows are found.
 */
export function renderTableSection(sectionTag = 'tbody', innerHTML = '') {
    if (!['thead', 'tbody', 'tfoot'].includes(sectionTag)) return null;

    const sectionHTML = extractTag(innerHTML, sectionTag, false, true);
    if (!sectionHTML) return null;

    const rowTags = extractTag(sectionHTML, 'tr', false, false);
    if (!rowTags || rowTags.length === 0) return null;

    const isBody = sectionTag === 'tbody';
    const cellTag = sectionTag === 'thead' ? 'th' : 'td';

    return React.createElement(sectionTag, {}, rowTags.map((rowHTML, rowIndex) => {
        const cellTags = extractTag(rowHTML, cellTag, false, false) || [];

        return (
            <tr
                key={`${sectionTag}-row-${rowIndex}`}
                id={isBody ? `row-${rowIndex}` : undefined}
                className={isBody ? (rowIndex % 2 === 0 ? 'even' : 'odd') : undefined}
                data-row-index={isBody ? rowIndex : undefined}
            >
                {cellTags.map((cellHTML, i) => {
                    const contentMatch = cellHTML.match(new RegExp(`<${cellTag}[^>]*>([\\s\\S]*?)<\\/${cellTag}>`, 'i'));
                    const content = contentMatch?.[1] || '';
                    return React.createElement(cellTag, { key: `${cellTag}-${i}` }, parse(content));
                })}
            </tr>
        );
    }));
}
