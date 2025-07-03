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

/**
 * Wrap 'html-react-parser' in an internal function to centralise all potential uses into one
 * common import. If we need to we change change the parser later without having to
 * refactor all the components that use it.
 * @param {string} html - The HTML string to parse.
 * @returns {ReactNode} The parsed React elements.
 */
export function parseHTML(html = '', options = {}) {
    return parse(html, options)
}

/** * An array of inline transformers to apply to HTML nodes.
 * Each transformer is a function that takes a node, index, and keyPrefix,
 * and returns a React element or undefined if no transformation is applied.
 */
const inlineTransformers = [
    transformTextNode,
    transformLinebreak,
    transformBold,
    transformItalic,
    transformStrikethrough,
    transformHyperlink,
    transformCodeTag,
    transformKeyboardTag,
    transformMarkTag,
    tranformImage,
    transformSuperscript,
    transformSubscript,
    transformDiv,
    transformSpan
];

/**
 * Renders inline children of a node as React elements.
 * @param {object} node - The HTML node containing children to render.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode[]} An array of React elements representing the inline children.
 */
function renderInlineChildren(children, keyPrefix, index) {
    return domToReact(children, {
        replace: (child, i) => applyTransformers(child, i, `${keyPrefix}-${index}`)
    });
}

/**
 * Applies inline transformers to a node.
 * @param {object} node - The HTML node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} The transformed React element or null if no transformation was applied.
 */
// This function is used to apply custom transformations to inline HTML elements.
// It iterates through the `inlineTransformers` array and applies each transformer to the node.
// If a transformer returns a non-undefined value, that value is returned immediately.
// If no transformer applies, it returns null.
function applyTransformers(node, index, keyPrefix) {
    for(const tranformer of inlineTransformers) {
        const result = tranformer(node, index, keyPrefix);
        if (result !== undefined) return result;
    }

    if (process.env.NODE_ENV === 'development') {
        console.warn('Unhandled inline HTML node:', node);
    }

    return null;
}

/** * Renders inline HTML content as React elements.
 * @param {string} html - The HTML string to render.
 * @returns {ReactNode} The rendered React elements.
 */

// Unhandled cases: custom tags, attributes added to existing tags.
export function renderInlineHTML(input = '', keyPrefix) {
    // If no HTML, return null;
    if (!input || typeof input !== 'string') return null;

    const parsed = parse(input, {
        replace: (node, index) => applyTransformers(node, index, keyPrefix)
    });

    if(Array.isArray(parsed)) {
        // If the parsed result is an array, we need to return it as a React fragment.
        // Filter out nulls and whitespace-only strings
        const filtered = parsed.filter(el => el !== null && !(typeof el === 'string' && el.trim() === ''));
        return filtered.map((el, i) => (
            <React.Fragment key={`${keyPrefix}-fragment-${i}`}>{el}</React.Fragment>
        ));
    }
    
    return parsed;
}

/**
 * Transforms a text node into a string.
 * @param {object} node - The text node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {string|null} The text content of the node or null if not a text node.
 */
function transformTextNode(node, index, keyPrefix) {
    if (node.type === 'text') return node.data;
}


function transformLinebreak(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'br') {
        return <br key={`${keyPrefix}-${index}`} />;
    }
}

/**
 * Transforms a bold node into a React element.
 * @param {object} node - The bold node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the bold text or null if not a bold node.
 */
function transformBold(node, index, keyPrefix) {
    if (node.type === 'tag' && (node.name === 'strong' || node.name === 'b')) {
        return (
            <strong key={`${keyPrefix}-${index}`}>
                 { renderInlineChildren(node.children, keyPrefix, index) }
            </strong>
        );
    }
}

/**
 * Transforms an italic node into a React element.
 * @param {object} node - The italic node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the italic text or null if not an italic node.
 */
function transformItalic(node, index, keyPrefix) {
    if (node.type === 'tag' && (node.name === 'em' || node.name === 'i' || node.name === 'italic')) {
        return (
            <em key={`${keyPrefix}-${index}`}>
                { renderInlineChildren(node.children, keyPrefix, index) }
            </em>
        );
    }
}

function transformStrikethrough(node, index, keyPrefix) {
    if (node.type === 'tag' && (node.name === 's' || node.name === 'strike' || node.name === 'del')) {
        return (
            <del key={`${keyPrefix}-${index}`}>
                { renderInlineChildren(node.children, keyPrefix, index) }
            </del>
        );
    }
}


/** * Transforms a hyperlink node into a React element.
 * @param {object} node - The hyperlink node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the hyperlink or null if not a hyperlink node.
 */
function transformHyperlink(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'a') {
        const { attribs = {}, children = [] } = node;
        const { href, target = '_blank', rel = 'noopener noreferrer' } = attribs;

        return (
            <A
                key={`${keyPrefix}-${index}`}
                href={href}
                target={target}
                rel={rel}
            >
                { renderInlineChildren(children, keyPrefix, index) }
            </A>
        );
    }
}

/**
 * Transforms an inline code node into a React element.
 * @param {object} node - The inline code node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the inline code or null if not an inline code node.
 */
function transformCodeTag(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'code') {
        return (
            <code key={`${keyPrefix}-${index}`} className="inline-code">
                { renderInlineChildren(node.children, keyPrefix, index) }
            </code>
        );
    }
}

/**
 * Transforms a keyboard tag node into a React element.
 * @param {object} node - The keyboard tag node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the keyboard tag or null if not a keyboard tag node.
 */
function transformKeyboardTag(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'kbd') {
        return (
            <kbd key={`${keyPrefix}-${index}`} className="kbd">
                { renderInlineChildren(node.children, keyPrefix, index) }
            </kbd>
        );
    }
}

/**
 * Transforms a mark tag node into a React element.
 * @param {object} node - The mark tag node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the mark tag or null if not a mark tag node.
 */
function transformMarkTag(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'mark') {
        const { attribs = {}, children = [] } = node;
        const style = parseStyleString(attribs?.style || '');
        const classNames = normaliseClassNames(attribs?.class || '');

        return (
            <mark key={`${keyPrefix}-${index}`} className={classNames} style={style}>
                { renderInlineChildren(children, keyPrefix, index) }
            </mark>
        );
    }
}

/**
 * Transforms an image node into a React element.
 * @param {object} node - The image node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the image or null if not an image node.
 */
function tranformImage(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'img') {
        const { attribs = {} } = node;
        const { src, alt = '', title = '', style: rawStyle = '' } = attribs;
        const parsedStyle = parseStyleString(rawStyle) || {
            display: 'inline',
            maxHeight: '1em',
            verticalAlign: 'middle'
        };

        return (
            <Image
                key={`${keyPrefix}-${index}`}
                src={src}
                alt={alt}
                {...(title ? { title } : {})}
                className="image-itself"
                style={parsedStyle}
            />
        );
    }
}

/**
 * Transforms a superscript node into a React element.
 * Handles footnotes like: <sup><a href="#fn1" id="fnref1">1</a></sup>
 * @param {object} node - The superscript node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the superscript or null if not a superscript node.
 */
function transformSuperscript(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'sup') {
        const { attribs = {}, children = [] } = node;
        // Handle footnotes like: <sup><a href="#fn1" id="fnref1">1</a></sup>
        if (children.length === 1 && children[0].type === 'tag' && children[0].name === 'a') {
            return (
                <sup key={`${keyPrefix}-${index}`}>
                    <A href={children[0].attribs?.href} id={children[0].attribs?.id} className="footnote">
                        { renderInlineChildren(children[0].children, keyPrefix, index) }
                    </A>
                </sup>
            );
        }
        // If not a footnote, just render the content inside a <sup> tag.
        return (
            <sup key={`${keyPrefix}-${index}`}>
                { renderInlineChildren(children, keyPrefix, index) }
            </sup>
        );
    }
}

/**
 * Transforms a subscript node into a React element.
 * @param {object} node - The subscript node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the subscript or null if not a subscript node.
 */
function transformSubscript(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'sub') {
        return (
            <sub key={`${keyPrefix}-${index}`}>
                { renderInlineChildren(node.childre, keyPrefix, index) }
            </sub>
        );
    }
}

/**
 * Transforms a div node into a React element.
 * @param {object} node - The div node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the div or null if not a div node.
 */
function transformDiv(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'div') {
        const { attribs = {}, children = [] } = node;
        const classNames = normaliseClassNames(attribs?.class || '');
        const style = parseStyleString(attribs?.style || '');
        
        return (
            <div key={`${keyPrefix}-${index}`} className={classNames} style={style}>
                { renderInlineChildren(children, keyPrefix, index) }
            </div>
        );
    }
}

/**
 * Transforms a span node into a React element.
 * @param {object} node - The span node to transform.
 * @param {number} index - The index of the node in the parent.
 * @param {string} keyPrefix - The prefix for the key attribute.
 * @returns {ReactNode|null} A React element representing the span or null if not a span node.
 */
function transformSpan(node, index, keyPrefix) {
    if (node.type === 'tag' && node.name === 'span') {
        const { attribs = {}, children = [] } = node;
        const classNames = normaliseClassNames(attribs?.class || '');
        const style = parseStyleString(attribs?.style || '');
        
        return (
            <span key={`${keyPrefix}-${index}`} className={classNames} style={style}>
                { renderInlineChildren(children, keyPrefix, index) }
            </span>
        );
    }
}