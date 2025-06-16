/**
 * Normalizes a list of class names by removing duplicates, filtering out WordPress-specific classes,
 * and converting WordPress-style classes to Tailwind CSS equivalents.
 * @param {string} classList - The class list string to normalise.
 * @param {Object} options - Options for normalization.
 * @param {boolean} options.convert - Whether to convert WordPress-style classes to Tailwind CSS equivalents.
 * @returns {string} A normalised class list string suitable for use with Tailwind CSS.
 */
export function normaliseClassNames(classList = '', { convert = true } = {}) {
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
                    .replace(/-/g, '');

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
                // TODO: left, right, and center are acceptable currently, but don't allow wraping
                if (align === 'left') return 'self-start mr-4 mb-4';
                if (align === 'right') return 'self-end ml-4 mb-4';
                if (align === 'center') return 'self-center mx-auto';
                // TODO: haven't tested these with images/figures. They do work with group-blocks.
                if (align === 'wide') return 'w-wide mx-auto'; // Example for wide alignment
                if (align === 'full') return 'w-[100cqw]'; // Example for full width. I don't know if this is genius or madness, but it works.
            }

            // Convert WP position variants to Tailwind CSS flex classes
            // TODO: check blockGroup for an inline function that may need to come here. Untested: What happens if the flex-direction is changed?
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
            if (cls === 'has-background') return 'opacity-100';

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
 * Some blocks dont have innerHTML, but have classNames and other style properties in block attributes.
 */
export function normaliseClassNamesFromAttributes(attrs) {
    if (!attrs || typeof attrs !== 'object') return '';
    const { className = '', style = {} } = attrs;

    let normalisedClassNames = '';

    /*
       rollcall for potential classNames:
        - backgroundColor
        - textColor
        - fontSize
        - fontFamily

        also be careful:

        - style.typography - letterSpacing
        - style.layout - selfStretch, flexSize
    */

    const classNames = [];

    if (attrs.backgroundColor) { classNames.push(`bg-${attrs.backgroundColor}`); }
    if (attrs.textColor) { classNames.push(`text-${attrs.textColor}`); }
    if (attrs.fontSize) { classNames.push(`text-${attrs.fontSize}`); }
    if (attrs.fontFamily) { classNames.push(`font-${attrs.fontFamily}`); }

    // Convert style properties to Tailwind CSS classes
    if (style?.typography?.letterSpacing) { classNames.push(`tracking-[${style.typography.letterSpacing}]`); }

    // TODO: check these are valid properties.
    //if (style?.layout?.selfStretch) { classNames.push('self-stretch'); }
    //if (style?.layout?.flexSize) { classNames.push(`flex-${style.layout.flexSize}`); } 

    return joinClassNames(className, normalisedClassNames, ...classNames);
}


/**
 * Convert blockName from "core/paragraph" to "paragraph"
 * @param {string} blockName - The block name to normalise.
 * @returns {string} The normalised block name, e.g. "paragraph" or "cover".
 */
export function normaliseBlockName(blockName = '') {
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
    // assume the flex container is a column
    const [vertical, horizontal] = pos.split(' ');

    //console.log(pos);

    const direction = {
        left: 'start',
        center: 'center',
        right: 'end',
    };

    return `flex items-${direction[horizontal] || 'center'} justify-${direction[vertical] || 'center'}`;

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
 * Normalizes the class list of a figure element by removing duplicates and converting WordPress-specific classes to Tailwind CSS equivalents.
 * @param {string} classList - The class list string to normalise.
 * @returns {string} A normalised class list string suitable for use with Tailwind CSS.
 * This function filters out WordPress-specific classes like 'wp-block-image' and 'is-resized', and converts alignment and size classes to Tailwind equivalents.
 */
export function normaliseFigureClasses(classList = '') {
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
 * Parses the width from a CSS style string.
 * @param {string} style - The CSS style string to parse.
 * @returns {string|null} The width value if found, otherwise null.
 */
export function parseWidthFromStyle(style = '') {
    const match = style.match(/width\s*:\s*([0-9.]+[a-z%]*)/i);
    return match ? match[1] : null;
}

/**
 * Extracts the first occurrence of a specific HTML tag from a string.
 * @param {string} html - The HTML string to search within.
 * @param {string} tag - The tag name to extract (e.g., 'p', 'div').
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


export function preprocessBlock(block) {
    const blockWrapperTags = {
        'core/list-item': 'li',
        'core/paragraph': 'p'
    };

    return {
        ...block,
        wrapperTag: blockWrapperTags[block.blockName] || '',
    };
}