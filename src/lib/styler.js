import { filterWPClassNames } from "@/lib/utils";

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

    let newClassList = filterWPClassNames(classList)
        .split(/\s+/)
        .filter(Boolean)
        .filter(cls => {
            if (seen.has(cls)) return false;
            seen.add(cls);
            return true;
        })
        .map(cls => convert ? applyConverters(cls) : cls)
        .join(' ');

    //console.log('AFTER', newClassList);

    return newClassList;
}

const converters = [
    convertBackgroundColour,
    convertTextAlignment,
    convertFontSize,
    convertTextColour,
    convertFontFamily,
    convertVerticalAlignment,
    convertPosition,
    convertAlignment,
    convertMediaTextAlignment,
    convertStackedOnMobile,
    convertParallax,
    convertRepeat,
    convertRoundedStyle,
    convertItemsJustification 
];

function applyConverters(classNames) {
    for (const convert of converters) {
        const result = convert(classNames);
        if (result !== classNames) return result;
    }
    return classNames;
}

// And now for a series of tranformer functions...

/**
 * Converts a background color string from WordPress format to Tailwind CSS format.
 * @param {string} input - The background color string from WordPress.
 * @returns {string} The converted Tailwind CSS class for the background color.
 */
export function convertBackgroundColour(className) {
    if (className.startsWith('has-') && className.endsWith('-background-color')) {
        const color = className.replace('has-', '').replace('-background-color', '');
        return `bg-${color}`;
    }
    return className;
}

/**
 * Converts a text alignment string from WordPress format to Tailwind CSS format.
 * @param {string} className - The text alignment string from WordPress.
 * @returns {string} The converted Tailwind CSS class for text alignment.
 */
export function convertTextAlignment(className) {
    if (className.startsWith('has-text-align-')) {
        const alignment = className.replace('has-text-align-', '');
        if (alignment === 'left') return 'text-left';
        if (alignment === 'right') return 'text-right';
        if (alignment === 'center') return 'text-center';
        if (alignment === 'justify') return 'text-justify';
    }
    return className;
}

/**
 * Converts a font size string from WordPress format to Tailwind CSS format. NOTE: we should check
 * if developers have tried to use the text- prefix already, and if so, we should not add it again.
 * @param {string} className - The font size string from WordPress.
 * @returns {string} The converted Tailwind CSS class for font size.
 */
export function convertFontSize(className) {
    if (className.startsWith('has-') && className.endsWith('-font-size')) {
        //check if the value already starts with "text-", if so, return without "has-" and "-font-size"

        let size;

        if (className.startsWith('has-text-') || className.startsWith('has-')) {
            size = className
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
            // TO DO: maybe map these to a config file later?
        };
        size = sizeMap[size] || size; // Default to the original size if not found
        //check the strin and remove any "text-" prefix and any subsequent dashes
        size = size
            .replace('text-', '')
            .replace(/-/g, '');

        return `text-${size}`;
    }
    return className;
}

/**
 * Converts a text color string from WordPress format to Tailwind CSS format.
 * @param {string} className - The text color string from WordPress.
 * @returns {string} The converted Tailwind CSS class for text color.
 */
export function convertTextColour(className) {
    if (className.startsWith('has-') && className.endsWith('-color')) {
        const color = className.replace('has-', '').replace('-color', '');
        return `text-${color}`;
    }
    return className;
}

/**
 * Converts a font family string from WordPress format to Tailwind CSS format.
 * @param {string} className - The font family string from WordPress.
 * @returns {string} The converted Tailwind CSS class for font family.
 */
export function convertFontFamily(className) {
    if (className.startsWith('has-') && className.endsWith('-font-family')) {
        const family = className.replace('has-', '').replace('-font-family', '');
        return `font-${family}`;
    }
    return className;
}

/**
 * Converts a vertical alignment string from WordPress format to Tailwind CSS format.
 * @param {string} className - The vertical alignment string from WordPress.
 * @returns {string} The converted Tailwind CSS class for vertical alignment.
 */
export function convertVerticalAlignment(className) {
    if (className.startsWith('is-vertically-aligned-')) {
        const direction = className.replace('is-vertically-aligned-', '');
        if (direction === 'top') return 'items-start';
        if (direction === 'center') return 'items-center';
        if (direction === 'bottom') return 'items-end';
    }
    return className;
}

/**
 * Converts a position string from WordPress format to Tailwind CSS format.
 * @param {string} className - The position string from WordPress.
 * @returns {string} The converted Tailwind CSS class for position.
 */
export function convertPosition(className) {
    if (className.startsWith('is-position-')) {
        const [vertical, horizontal] = className.split(' ');

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
    return className;
}

/**
 * Converts an alignment string from WordPress format to Tailwind CSS format.
 * @param {string} className - The alignment string from WordPress.
 * @returns {string} The converted Tailwind CSS class for alignment.
 */
export function convertAlignment(className) {
    if (className.startsWith('align')) {
        const align = className.slice(5);
        // TODO: left, right, and center are acceptable currently, but don't allow wraping
        if (align === 'left') return 'self-start mr-4 mb-4';
        if (align === 'right') return 'self-end ml-4 mb-4';
        if (align === 'center') return 'self-center mx-auto';
        // TODO: haven't tested these with images/figures. They do work with group-blocks.
        //if (align === 'wide') return 'w-wide mx-auto'; // Example for wide alignment
        if (align === 'full') return 'w-[100cqw]'; // Example for full width. I don't know if this is genius or madness, but it works.
    }
    return className;
}

// generic functions

/**
 * Converts a colour name to a Tailwind CSS class. Can be ued for background, text, or border colours.
 * This function is generic and can be used for any colour name that follows the WordPress convention.
 * Handles:
 *  - named colours (e.g. 'vivid-red'),
 *  - custom hex colours (e.g. '#ff0000'. rgb is converted to hex),
 *  - block editor long class names (e.g. 'has-vivid-red-background-color').
 *  - block markup preset strings (e.g 'var:preset|color|white'). 
 * @param {string} colourNamePartial - The partial colour name from WordPress.
 * @returns {string} The converted Tailwind CSS class for the colour.
 */
export function convertColour(colourNamePartial) {
    if (!colourNamePartial || typeof colourNamePartial !== 'string') return '';
    let colourName = colourNamePartial;
    //determine the type of colour name
    if (colourNamePartial.startsWith('has-') && colourNamePartial.endsWith('-color')) {
        // block editor long class names
        //also replace any 'text', 'link', 'border' or 'background' prefix/suffix
        colourName = colourNamePartial
            .replace('has-', '')
            .replace('-color', '')
            .replace('text-', '')
            .replace('link-', '')
            .replace('border-', '')
            .replace('-background', '');
    } else if (colourNamePartial.startsWith('var:preset|color|')) {
        // block markup preset strings
        colourName = colourNamePartial.replace('var:preset|color|', '');
    } else if (colourNamePartial.startsWith('#')) {
        // custom hex colours
        // convert hex to Tailwind CSS format
        colourName = `[${colourNamePartial}]`
    }

    return colourName; // Tailwind CSS arbitrary value syntax
}

// block spectific functions

/**
 * Converts a media text block alignment string from WordPress format to Tailwind CSS format.
 * @param {string} className - The media text block alignment string from WordPress.
 * @returns {string} The converted Tailwind CSS class for media text block alignment.
 */
function convertMediaTextAlignment(className) {
    if (className.startsWith('has-media-on-the-')) {
        const position = className.replace('has-media-on-the-', '');
        if (position === 'left') return 'flex-row';
        if (position === 'right') return 'flex-row-reverse';
    }
    return className;
}

// obscure and singular functions

/**
 * If WordPress throws in a className to just say is-stacked-on-mobile or is-not-stacked-on-mobile,
 * we convert that to Tailwind CSS flex classes.
 * @param {string} className - The class name from WordPress.
 */
function convertStackedOnMobile(className) {
    if (className === 'is-stacked-on-mobile') return 'sm:flex-col';
    if (className === 'is-not-stacked-on-mobile') return 'sm:flex-row';
    return className;
}

/**
 * Converts a parallax class from WordPress to Tailwind CSS.
 * @param {string} className - The class name from WordPress.
 * @returns {string} The converted Tailwind CSS class for parallax.
 */
function convertParallax(className) {
    if (className === 'has-parallax') return 'bg-fixed';
    return className;
}

/**
 * Converts a repeat class from WordPress to Tailwind CSS.
 * @param {string} className - The class name from WordPress.
 * @returns {string} The converted Tailwind CSS class for repeat.
 */
function convertRepeat(className) {
    if (className === 'is-repeated') return 'bg-repeat';
    return className;
}

/**
 * Converts a rounded style class from WordPress to Tailwind CSS.
 * @param {string} className - The class name from WordPress.
 * @returns {string} The converted Tailwind CSS class for rounded style.

 */
function convertRoundedStyle(className) {
    if (className === 'is-style-rounded') return 'rounded-full overflow-hidden';
    return className;
}

/**
 * Converts a 3rd-party justification class (outermost/icon) to Tailwind CSS.
 * @param {string} className - The class name from the plugin.
 * @returns {string} The converted Tailwind CSS class for items justification.
 */
function convertItemsJustification(className) {
    if (className.startsWith('items-justified-')) {
        const justification = className.replace('items-justified-', '');
        if (justification === 'left') return 'justify-start';
        if (justification === 'center') return 'justify-center';
        if (justification === 'right') return 'justify-end';
    }
    return className;
}