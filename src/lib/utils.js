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

    //console.log('BEFORE', classList);

    let newClassList = classList
        .split(/\s+/)
        .filter(Boolean)
        .filter(cls => {
            if (seen.has(cls)) return false;
            seen.add(cls);

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
                'wp-image-'
            ];
            if (removeThese.some(str => cls.includes(str))) return false;

            return true;
        })
        .map(cls => {
            if (!convert) return cls;

            // Convert WP-style color background
            if (cls.startsWith('has-') && cls.endsWith('-background-color')) {
                const color = cls.replace('has-', '').replace('-background-color', '');
                return `bg-${color}`;
            }

            // Convert WP has-text-align-{alignment} to Tailwind CSS text alignment classes
            if (cls.startsWith('has-text-align-')) {
                const alignment = cls.replace('has-text-align-', '');
                if (alignment === 'left') return 'text-left';
                if (alignment === 'right') return 'text-right';
                if (alignment === 'center') return 'text-center';
                if (alignment === 'justify') return 'text-justify';
            }

            // Convert WP-style font sizes
            if (cls.startsWith('has-') && cls.endsWith('-font-size')) {
                //check if the value already starts with "text-", if so, return without "has-" and "-font-size"

                let size;

                if (cls.startsWith('has-text-') || cls.startsWith('has-')) {
                    size = cls
                        .replace('has-', '')
                        .replace('text-', '')
                        .replace('-font-size', '');
                }
                
                // Map WP font sizes to Tailwind CSS equivalents
                const sizeMap = {
                    'small': 'sm',
                    'medium': 'base',
                    'large': 'lg',
                    'x-large': 'xl',
                    'xx-large': '2xl',
                    'huge': '3xl',
                    // Add more mappings as needed
                };
                size = sizeMap[size] || size; // Default to the original size if not found
                //check the strin and remove any "text-" prefix and any subsequent dashes
                size = size
                    .replace('text-', '')
                    .replace(/-/g, '')
                
                return `text-${size}`;
            }

            // Convert WP-style text colors
            if (cls.startsWith('has-') && cls.endsWith('-color')) {
                const color = cls.replace('has-', '').replace('-color', '');
                return `text-${color}`;
            }

            // Convert WP-style font families
            if (cls.startsWith('has-') && cls.endsWith('-font-family')) {
                const family = cls.replace('has-', '').replace('-font-family', '');
                return `font-${family}`;
            }

            // Convert WP Media Text block alignment to flex-direction
            if (cls.startsWith('has-media-on-the-')) {
                const position = cls.replace('has-media-on-the-', '');
                if (position === 'left') return 'flex-row';
                if (position === 'right') return 'flex-row-reverse';
            }

            // Conver WP is-vertically-aligned-{direction} to Tailwind CSS flex classes
            if (cls.startsWith('is-vertically-aligned-')) {
                const direction = cls.replace('is-vertically-aligned-', '');
                if (direction === 'top') return 'items-start';
                if (direction === 'center') return 'items-center';
                if (direction === 'bottom') return 'items-end';
            }

            //Convert WP is-(not-)stacked-on-mobile to sm:flex-col
            if (cls === 'is-stacked-on-mobile') return 'sm:flex-col';
            if (cls === 'is-not-stacked-on-mobile') return 'sm:flex-row';

            // Convert WP alignments to Tailwind CSS float classes
            if (cls.startsWith('align')) {
                const align = cls.slice(5);
                if (align === 'left') return 'float-left mr-4 mb-4';
                if (align === 'right') return 'float-right ml-4 mb-4';
                if (align === 'center') return 'mx-auto';
                if (align === 'wide') return 'mx-auto'; // Example for wide alignment
                if (align === 'full') return 'w-full'; // Example for full width
            }

            // Convert WP position variants to Tailwind CSS flex classes
            if (cls.startsWith('is-position-')) {
                const [vertical, horizontal] = cls.split(' ');

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

            //convert WP has-parallax to Tailwind CSS background-attachment
            if (cls === 'has-parallax') return 'bg-fixed';

            // Convert WP is-repeated to Tailwind CSS background-repeat
            if (cls === 'is-repeated') return 'bg-repeat';

            // Generic has-background
            if (cls === 'has-background') return 'bg-opacity-100';

            // Convert WP size classes to Tailwind CSS media classes
            if (cls.startsWith('size-')) {
                return `media-${cls.slice(5)}`; //only used as an identifier, not a class
            }

            return cls;
        })
        .join(' ');

    //console.log('AFTER', newClassList);

    return newClassList;
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
 * @param {number} index - The index of the match to return (default is 1, for the first match).
 * @returns {string|null} The value of the specified attribute, or null if not found.
 */
export function extractAttributeValue({html = '', tag = '', attribute = '', index = 0} = {}) {
    if (!html || !attribute) return null;

    const pattern = tag
        ? `<${tag}[^>]*\\s${attribute}\\s*=\\s*(['"])(.*?)\\1`
        : `${attribute}\\s*=\\s*(['"])(.*?)\\1`;

    const regex = new RegExp(pattern, 'gi'); // global + case-insensitive
    const matches = [...html.matchAll(regex)];

    return matches[index]?.[2] || null;
}