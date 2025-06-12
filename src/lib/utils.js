/**
 * Normalizes a list of class names by removing duplicates, filtering out WordPress-specific classes,
 * and converting WordPress-style classes to Tailwind CSS equivalents.
 * @param {string} classList - The class list string to normalize.
 * @param {Object} options - Options for normalization.
 * @param {boolean} options.convert - Whether to convert WordPress-style classes to Tailwind CSS equivalents.
 * @returns {string} A normalized class list string suitable for use with Tailwind CSS.
 */
export function normalizeClassNames(classList = '', { convert = true } = {}) {
    const seen = new Set();

    return classList
        .split(/\s+/)
        .filter(Boolean)
        .filter(cls => {
            if (seen.has(cls)) return false;
            seen.add(cls);

            // Always remove WP core block prefix
            if (cls.startsWith('wp-block-')) return false;

            // Remove obvious defaults/redundancy
            if (cls === 'is-style-default') return false;

            return true;
        })
        .map(cls => {
            if (!convert) return cls;

            // Convert WP-style color background
            if (cls.startsWith('has-') && cls.endsWith('-background-color')) {
                const color = cls.replace('has-', '').replace('-background-color', '');
                return `bg-${color}`;
            }

            // Convert WP-style font sizes
            if (cls.startsWith('has-') && cls.endsWith('-font-size')) {
                const size = cls.replace('has-', '').replace('-font-size', '');
                return `text-${size}`;
            }

            // Convert WP-style text colors
            if (cls.startsWith('has-') && cls.endsWith('-color')) {
                const color = cls.replace('has-', '').replace('-color', '');
                return `text-${color}`;
            }

            // Generic has-background
            if (cls === 'has-background') return 'bg-opacity-100';

            return cls;
        })
        .join(' ');
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
 * @param {string} blockName - The name of the block, used to generate a specific class suffix.
 * @param {string} additionalClasses - Additional classes to apply to the inner div. use rarely.
 * @returns {ReactNode} The children wrapped in a div with class "inner" if applicable.
 */
export function withConditionalInnerWrapper(children, innerHTML = '', blockName = '', additionalClasses = '') {
    const hasInner = innerHTML.includes('class="inner"') || innerHTML.includes("class='inner'");
    const blockSuffix = blockName ? `${blockName.replace('-block', '')}-inner` : '';
    let innerClasses = hasInner ? `${blockSuffix} inner`.trim() : '';

    if (additionalClasses) {
        const classNames = hasInner ? `${innerClasses} ${additionalClasses}` : additionalClasses;
        return <div className={classNames}>{children}</div>;
    } else {
        return hasInner
            ? <div className={innerClasses}>{children}</div>
            : children;
    }

}

/**
 * Strips the <figcaption> element from a given HTML string.
 * This is useful for removing captions from figure blocks when only the image or content is needed.
 * @param {string} html - The HTML string to process.
 * @returns {string} The HTML string without the <figcaption> element.
 */
export function stripFigcaption(html = '') {
    return html.replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/i, '').trim();
}

/**
 * Extracts the body content of a <figure> element from a given HTML string.
 * This is useful for isolating the main content of a figure block, excluding any caption.
 * @param {string} html - The HTML string to search within.
 * @returns {string} The body content of the <figure> element, or the original HTML if not found.
 */
export function extractFigureBody(html = '') {
    const match = html.match(/<figure[^>]*>([\s\S]*?)<\/figure>/i);
    if (!match) return html; // fallback
    return match[1].trim();
}

/**
 * Extracts the class attribute from a <figure> element in a given HTML string.
 * This is useful for identifying the classes applied to a figure block, which can then be normalized or transformed.
 * @param {string} html - The HTML string to search within.
 * @returns {string} The class attribute value of the <figure> element, or an empty string if not found.
 */
export function extractFigureClass(html = '') {
    return html.match(/<figure[^>]*class="([^"]+)"/i)?.[1] || '';
}

/**
 * Extracts the class attribute from a <figure> element in a given HTML string.
 * This is useful for identifying the classes applied to a figure block, which can then be normalized or transformed.
 * @param {string} html - The HTML string to search within.
 * @returns {string} The class attribute value of the <figure> element, or an empty string if not found.
 */
export function extractFigureStyle(html = '') {
    return html.match(/<figure[^>]*style="([^"]+)"/i)?.[1] || '';
}

/**
 * Normalizes the class list of a figure element by removing duplicates and converting WordPress-specific classes to Tailwind CSS equivalents.
 * @param {string} classList - The class list string to normalize.
 * @returns {string} A normalized class list string suitable for use with Tailwind CSS.
 * This function filters out WordPress-specific classes like 'wp-block-image' and 'is-resized', and converts alignment and size classes to Tailwind equivalents.
 */
export function normalizeFigureClasses(classList = '') {
    const seen = new Set();
    const classNames = classList.split(/\s+/);

    return classNames
        .filter(cls => {
            if (['wp-block-image', 'is-resized'].includes(cls)) return false; // Exclude WordPress-specific classes

            if (seen.has(cls)) return false; // Filter out duplicates
            seen.add(cls);
            return true; // Keep unique classes
        })
        .map(cls => {
            // Convert known WP classes to Tailwind equivalents
            if (cls.startsWith('align')) {
                const align = cls.replace('align', '');
                if (align === 'left') return 'float-left mr-4 mb-4';
                if (align === 'right') return 'float-right ml-4 mb-4';
                if (align === 'center') return 'mx-auto';
            }
            if (cls.startsWith('size-')) {
                return `media-${cls.slice(5)}`; //only used as an identifier, not a class
            }
            return cls; // Return the class as is if no transformation is needed
        })
        .join(' ');
}

/**
 * Strips the <p> wrapper from a given HTML string.
 * @param {string} html - The HTML string to process.
 * @returns {string} The HTML string without the <p> wrapper.
 */
export function stripParagraphWrapper(html = '') {
    return html
        .trim()
        .replace(/^<p[^>]*>/i, '')
        .replace(/<\/p>$/i, '')
        .trim();
}

/**
 * Strips the heading wrapper from a given HTML string.
 * @param {string} html - The HTML string to process.
 * @returns {string} The HTML string without the heading wrapper.
 */
export function stripHeadingWrapper(html = '') {
    return html
        .trim()
        .replace(/^<h[1-6][^>]*>/i, '')
        .replace(/<\/h[1-6]>$/i, '')
        .trim();
}

/**
 * Parses the width from a CSS style string.
 * @param {string} style - The CSS style string to parse.
 * @returns {string|null} The width value if found, otherwise null.
 */
export function parseWidthFromStyle(style = '') {
    const match = style.match(/width\s*:\s*([0-9.]+[a-z%]*)/i);
    return match ? match[1] : null;
}

/**
 * Extracts the text content from a specific HTML tag.
 * @param {string} html - The HTML string to search within.
 * @param {string} tag - The tag name to extract text from (e.g., 'p', 'div').
 * @returns {string|null} The text content of the specified tag, or null if not found.
 */
export function extractTextFromTag(html = '', tag = '') {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = html.match(regex);
    return match ? match[1].trim() : null;
}

/**
 * Extracts the value of a specific attribute from an HTML string.
 * @param {string} html - The HTML string to search within.
 * @param {string} attribute - The attribute name to extract (e.g., 'src', 'href').
 * @param {string|optional} tag - The tag name to search for (e.g., 'img', 'a').
 * @returns {string|null} The value of the specified attribute, or null if not found.
 */
export function extractAttributeValue({html = '', tag = '', attribute = ''} = {}) {
    if (!html || !attribute) return null;

    const pattern = tag
        ? `<${tag}[^>]*\\s${attribute}\\s*=\\s*"([^"]*)"`
        : `${attribute}\\s*=\\s*"([^"]*)"`;

    const regex = new RegExp(pattern, 'i');
    const match = html.match(regex);

    return match ? match[1] : null;
}