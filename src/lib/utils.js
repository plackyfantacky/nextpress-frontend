/**
 * Extract the text content and css classes from a given string of innerHTML.
 * @param {string} innerHTML - The HTML string to extract from.
 * @returns {Object} An object containing the text content, block class name (first css class) and remaining css classes.
 */
export function extractTextAndClasses(innerHTML) {
    if (typeof innerHTML !== 'string') { return { text: '', classNames: '' }; }

    // Parse the first tag in the string
    const match = innerHTML.match(/<[^>]+class\s*=\s*["']([^"']+)["']/i);
    const extractedClassNames = match?.[1] ?? '';
    const text = innerHTML.replace(/<[^>]+>/g, '').trim();

    // Remove WordPress-injected utility classes
    const filteredClasses = extractedClassNames
        .split(/\s+/)
        .filter(cls => !cls.startsWith('wp-'));

    return { text, extractedClassNames: filteredClasses.join(' ') };
}

/**
 * Convert blockName from "core/paragraph" to "paragraph"
 * @param {string} blockName - The block name to normalize.
 * @returns {string} The normalized block name, e.g. "paragraph" or "cover".
 */
export function normalizeBlockName(blockName = '') {
    if (typeof blockName !== 'string') return '';
    return blockName.replace(/^core\//, '') + '-block'; // Append "-block" to match the convention used in block renderers
}

/**
 * Converts a content position string (e.g. "center left") to Tailwind CSS flex classes.
 * This is useful for aligning content in a flex container based on the position specified in WordPress.
 * @param {string} pos - The content position string, e.g. "center left".
 * @returns {string} A string of Tailwind CSS classes for flex alignment.
 */
export function contentPositionToTailwind(pos) {
    // WordPress uses e.g. "center left", "top right", etc.
    const [vertical, horizontal] = pos.split(' ');

    const justify = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
    }[horizontal] || 'justify-center';

    const align = {
        top: 'items-start',
        center: 'items-center',
        bottom: 'items-end',
    }[vertical] || 'items-center';

    return `flex ${justify} ${align}`;
}

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
 * Wraps children in a div with class "inner" if the innerHTML contains an "inner" class.
 * This is useful for blocks that require a specific inner structure.
 * @param {ReactNode} children - The children to wrap.
 * @param {string} innerHTML - The innerHTML string to check for the "inner" class.
 * @returns {ReactNode} The children wrapped in a div with class "inner" if applicable.
 */
export function withConditionalInnerWrapper(children, innerHTML = '', blockName = '') {
    const hasInner = innerHTML.includes('class="inner"') || innerHTML.includes("class='inner'");
    const blockSuffix = blockName ? `${blockName.replace('-block', '')}-inner` : '';
    const innerClasses = hasInner ? `${blockSuffix} inner`.trim() : '';

    return hasInner
        ? <div className={innerClasses}>{children}</div>
        : children;
}

/**
 * Extracts the text content from a <cite> element within a block's innerHTML.
 * @param {string} html - The HTML string to search within.
 * @returns {string|null} The text content of the <cite> element, or null if not found.
 */
export function extractCiteText(innerContent = []) {
    const citeHTML = innerContent.find(
        (s) => typeof s === 'string' && s.includes('<cite')
    );
    const match = citeHTML?.match(/<cite[^>]*>(.*?)<\/cite>/i);
    return match?.[1]?.trim() || null;
}

/**
 * Maps quote styles to Tailwind CSS classes.
 * @param {Object} attrs - The attributes of the quote block.
 * @returns {Array} An array of Tailwind CSS classes for the quote block.
 */
export function mapQuoteStyles(attrs = {}) {
    const classes = [];

    if (attrs.backgroundColor) {
        classes.push(`bg-${attrs.backgroundColor}`);
    }

    if (attrs.textColor) {
        classes.push(`text-${attrs.textColor}`);
    }

    if (attrs.fontSize) {
        classes.push(`text-${attrs.fontSize}`);
    }

    return classes;
}

export function stripParagraphWrapper(html = '') {
    return html
        .trim()
        .replace(/^<p[^>]*>/i, '')
        .replace(/<\/p>$/i, '')
        .trim();
}

export function stripHeadingWrapper(html = '') {
    return html
        .trim()
        .replace(/^<h[1-6][^>]*>/i, '')
        .replace(/<\/h[1-6]>$/i, '')
        .trim();
}