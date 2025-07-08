/**
 * Joins multiple class names into a single string, filtering out falsy values.
 * This is useful for dynamically constructing class names in React components.
 * @param {...(string|string[]|null|undefined|boolean)} args - Class names to join.
 * @returns {string} A single string of class names.
 */
export function joinClassNames(...args) {
    return args
        .flat() // allow arrays inside arguments
        .filter(Boolean) // remove null, undefined, false, '', 0
        .join(' ');
}

/**
 * Extracts the first occurrence of a specific HTML tag from a string.
 * @param {string} html - The HTML string to search within.
 * @param {string} tag - The tag name to extract (e.g., 'p', 'div').
 * @param {boolean} contentOnly - If true, returns only the content inside the tag; otherwise, returns the full tag.
 * @param {boolean} asString - If true, returns the first match as a string; if false, returns an array of all matches.
 * @returns {string|null} The first occurrence of the specified tag, or null if not found.
 */
export function extractTag(html = '', tag = '', contentOnly = true, asString = true) {
    if (!html || !tag) return null;

    //const tagRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const tagRegex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const matches = [...html.matchAll(tagRegex)];

    if (matches.length === 0) return null;

    if (asString === false) {
        return matches.map(m => (contentOnly ? m[1].trim() : m[0].trim()));
    }

    // Legacy behavior — return only first match
    return contentOnly ? matches[0][1].trim() : matches[0][0].trim();
}

/**
 * Extracts the value of a specific attribute from an HTML string.
 * @param {string} html - The HTML string to search within.
 * @param {string} attribute - The attribute name to extract (e.g., 'src', 'href').
 * @param {string|optional} tag - The tag name to search for (e.g., 'img', 'a').
 * @param {number} index - The index of the match to return (default is 1, for the first match).
 * @returns {string|null} The value of the specified attribute, or null if not found.
 */
export function extractAttributeValue({ html = '', tag = '', attribute = '', index = 0 } = {}) {
    if (!html || !attribute) return null;

    // If a specific tag is requested, match only that tag’s opening
    if (tag) {
        const tagRegex = new RegExp(`<${tag}[^>]*>`, 'i');
        const match = html.match(tagRegex);
        if (!match) return null;

        const attrRegex = new RegExp(`${attribute}\\s*=\\s*(['"])(.*?)\\1`, 'gi');
        const attrMatches = [...match[0].matchAll(attrRegex)];
        return attrMatches[index]?.[2] || null;
    }

    // Otherwise: fallback to original logic
    const pattern = `${attribute}\\s*=\\s*(['"])(.*?)\\1`;
    const regex = new RegExp(pattern, 'gi');
    const matches = [...html.matchAll(regex)];

    return matches[index]?.[2] || null;
}

/**
 * Preprocesses a block to add a wrapper tag based on the block type.
 * This is useful for blocks that need specific HTML structure.
 * NOTE: currently only called by ./src/lib/blocks.index.js but leaving this here as this function
 * could grow in the future.
 * @param {Object} block - The block object to preprocess.
 * @returns {Object} The preprocessed block with an added wrapperTag property.
 */
export function preprocessBlock(block) {
    const blockWrapperTags = {
        'core/list-item': 'li',
        'core/paragraph': 'p'
    };
    return { ...block, wrapperTag: blockWrapperTags[block.blockName] || '' };
}

/**
 * Filters out WordPress-specific class names from a class list.
 * This is useful for cleaning up class names before applying them in a React component.
 * @param {string} classList - The class list string to filter.
 * @returns {string} A filtered class list string without WordPress-specific classes.
 */
export function filterWPClassNames(classList = '') {
    if (!classList) return '';
    
    const removeThese = [
        'wp-block',
        'is-layout',
        'has-text-color',
        'has-link-color',
        'is-style-default',
        'is-style-plain',
        'is-image-fill-element',
        'has-background',
        'has-custom-content-position',
        'is-light',
        'is-dark',
        'wp-image-',
        'wp-element-',
        'is-resized',
        'size-',
        'alignwide'
    ];

    return classList
        .split(/\s+/)
        .filter(cls => !removeThese.some(str => cls.includes(str)))
        .join(' ');
}