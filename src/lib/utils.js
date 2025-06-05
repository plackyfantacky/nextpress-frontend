/**
 * Extract the text content and css classes from a given string of innerHTML.
 * @param {string} innerHTML - The HTML string to extract from.
 * @returns {Object} An object containing the text content, block class name (first css class) and remaining css classes.
 */
export function extractTextAndClasses(innerHTML) {
    if (typeof innerHTML !== 'string') return { text: '', className: '' };

    // SSR fallback
    if (typeof window === 'undefined') {

        const classMatch = innerHTML.match(/class="([^"]+)"/);
        const text = innerHTML.replace(/<[^>]+>/g, '').trim();

        return { text, blockClassName: classMatch?.[1] ?? '', remainingClasses: classMatch?.[1]?.split(/\s+/) || [] };
    }

    // CSR main functionality
    const wrapper = document.createElement('div');
    wrapper.inertHTML = innerHTML.trim();


    const firstEl = wrapper.firstElementChild;

    return {
        text: firstEl?.textContent?.trim() ?? '',
        blockClassName: firstEl?.className?.trim() ?? '',
        remainingClasses: firstEl?.className?.trim()?.split(/\s+/) || []
    };
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
 * Normalizes a block class name by mapping WordPress block class names to custom class names.
 * This is useful for converting WordPress block class names to a more readable format.
 * @param {string} input - The block class name to normalize.
 * @returns {string} The normalized class name.
 */
export function normalizeBlockClassName(input = '') {

    if (typeof input !== 'string') return '';

    const classMap = {
        'wp-block-group': 'group-block',
        'wp-block-columns': 'columns-block',
        'wp-block-column': 'column-block',
        'wp-block-cover': 'cover-block',
        'wp-block-image': 'image',
        'wp-block-paragraph': 'paragraph',
        'wp-block-heading': 'heading',
        'wp-block-list': 'list',
        'wp-block-media-text': 'media-text-block',
    };
    const words = input.trim().split(/\s+/);

    const renamed = words.flatMap(wpClass =>
        classMap[wpClass]?.split(' ') || []
    );

    return renamed.join(' ');
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
export function withConditionalInnerWrapper(children, innerHTML = '') {
    return innerHTML.includes('class="inner"') || innerHTML.includes("class='inner'")
        ? <div className="inner">{children}</div>
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