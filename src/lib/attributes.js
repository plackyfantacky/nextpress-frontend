import { parse } from "path";
import { filterWPClassNames, joinClassNames } from "@/lib/utils";
import { convertColour } from "@/lib//styler";

/**
 * An array of functions that handle specific attributes and convert them to Tailwind CSS class names.
 */
const attributeHandlers = [
    handleAlign,
    handleCustomContainer,
    handleCustomGap,
    handleCustomSpacing,
    handleTextAlign,
    handleLayout,
    handleTextColor,
    handleBackgroundColor,
    handleFontSize,
    handleStyle,
    handleVerticalAlignment,
    handleContentPosition
];

/**
 * Processes the entire attrs object, going through section by section and calling the appropriate functions to convert attributes to Tailwind CSS class names.
 * This is a monolith function that handles all attributes, including core classes, margin, padding, and other custom attributes.
 * Garbage in, sanity out (hopefully).
 * 
 * @param {object} attrs - The attributes object containing various properties.
 * @return {string} A string of Tailwind CSS class names derived from the attributes.
 */
export function processAttributesToClassNames(attrs = {}) {
    const classes = attributeHandlers
        .map(handler => handler(attrs))
        .filter(Boolean); // filter out any empty strings

    if (attrs.className) {
        classes.push(filterWPClassNames(attrs.className));
    }

    return joinClassNames(...classes);
}

/**
 * Handles the 'align' attribute and converts it to a Tailwind CSS class name. NOTE: there is a distinction between 'align' and 'textAlign' in WordPress.
 * This function checks the 'align' property in the attrs object and returns the corresponding Tailwind CSS class name for flex alignment
 * 
 * @param {object} attrs - The attributes object containing the 'align' property.
 * @return {string} A Tailwind CSS class name for the alignment, or an empty
 */
function handleAlign(attrs) {
    if (!attrs || typeof attrs !== 'object' || !attrs.align) return '';

    const align = attrs.align;
    switch (attrs.align) {
        case 'left': return 'float-left mr-4 mb-4';
        case 'right': return 'float-right ml-4 mb-4';
        case 'center': return 'mx-auto';
        default: return '';
    }
}

/**
 * Handles the 'textAlign' attribute and converts it to a Tailwind CSS class name.
 * This function checks the 'textAlign' property in the attrs object and returns the corresponding Tailwind CSS class name for text alignment.
 * @param {object} attrs - The attributes object containing the 'textAlign' property.
 * @return {string} A Tailwind CSS class name for the text alignment, or an empty string if not applicable.
 */
function handleTextAlign(attrs) {
    if (!attrs || typeof attrs !== 'object' || !attrs.textAlign) return '';

    const textAlign = attrs.textAlign;
    switch (textAlign) {
        case 'left': return 'text-left';
        case 'right': return 'text-right';
        case 'center': return 'text-center';
        case 'justify': return 'text-justify';
        default: return '';
    }
}

/** * Handles custom spacing attributes and converts them to Tailwind CSS class names.
 * This function checks for custom spacing attributes in the attrs object and returns the corresponding Tailwind CSS class names.
 * @param {object} attrs - The attributes object containing custom spacing properties.
 * @return {string} A string of Tailwind CSS class names for custom spacing, or an empty string if not applicable.
 */
function handleCustomSpacing(attrs) {
    if (!attrs || typeof attrs !== 'object') return '';

    const classNames = [];

    const isNonZero = (v) => v !== undefined && v !== null && `${v}` !== '0';

    const spacingGroups = [
        {
            prefix: 'm',
            top: attrs.marginTop,
            bottom: attrs.marginBottom,
            left: attrs.marginLeft,
            right: attrs.marginRight
        },
        {
            prefix: 'p',
            top: attrs.paddingTop,
            bottom: attrs.paddingBottom,
            left: attrs.paddingLeft,
            right: attrs.paddingRight
        }
    ];

    for (const group of spacingGroups) {
        const { prefix, top, bottom, left, right } = group;

        if (isNonZero(top) && isNonZero(bottom) && top === bottom) {
            classNames.push(`${prefix}y-[${top}]`);
        } else {
            if (isNonZero(top)) classNames.push(`${prefix}t-[${top}]`);
            if (isNonZero(bottom)) classNames.push(`${prefix}b-[${bottom}]`);
        }

        if (isNonZero(left) && isNonZero(right) && left === right) {
            classNames.push(`${prefix}x-[${left}]`);
        } else {
            if (isNonZero(left)) classNames.push(`${prefix}l-[${left}]`);
            if (isNonZero(right)) classNames.push(`${prefix}r-[${right}]`);
        }
    }

    return classNames.join(' ');
}

/**
 * Handles custom gap attributes and converts them to Tailwind CSS class names.
 * This function checks for custom gap attributes in the attrs object and returns the corresponding Tailwind CSS class names.
 * @param {object} attrs - The attributes object containing custom gap properties.
 * @return {string} A string of Tailwind CSS class names for custom gaps, or an empty string if not applicable.
 */
function handleCustomGap(attrs) {
    if (!attrs || typeof attrs !== 'object') return '';

    const classNames = [];

    const isNonZero = (v) => v !== undefined && v !== null && `${v}` !== '0';

    if (isNonZero(attrs.gapHorizontal)) {
        classNames.push(`gap-x-[${attrs.gapHorizontal}]`);
    }
    if (isNonZero(attrs.gapVertical)) {
        classNames.push(`gap-y-[${attrs.gapVertical}]`);
    }

    return classNames.join(' ');
}

/**
 * Handles custom container attributes and converts them to Tailwind CSS class names.
 * This function checks for custom container attributes in the attrs object and returns the corresponding Tailwind CSS class names.
 * @param {object} attrs - The attributes object containing custom container properties.
 * @return {string} A string of Tailwind CSS class names for custom containers, or an empty string if not applicable.
 */
function handleCustomContainer(attrs) {
    if (!attrs || typeof attrs !== 'object') return '';

    const classNames = [];

    // Handle container width and type
    if (attrs.containerType) {
        switch (attrs.containerType) {
            case 'none':
                classNames.push('max-w-none');
                break;
            case 'full':
                classNames.push('w-full');
                break;
            case 'flex':
                classNames.push('flex-1 h-full');
                break;
            case 'boxed':
                if (attrs?.containerWidth) {
                    classNames.push(`w-[${attrs.containerWidth}]`);
                }
                if (attrs?.containerMXAuto) {
                    classNames.push('mx-auto');
                }
                break;
            default:
            // no default action needed
        }
    }

    return classNames.join(' ');
}

/** 
 * Handles layout attributes and converts them to Tailwind CSS class names.
 * This function checks for layout attributes in the attrs object and returns the corresponding Tailwind CSS class names.
 * @param {object} attrs - The attributes object containing layout properties.
 * @return {string} A string of Tailwind CSS class names for layout, or an empty string if not applicable.
 */
function handleLayout(attrs) {
    if (!attrs || typeof attrs !== 'object') return '';

    const classNames = [];

    // Handle layout type
    if (attrs.layout?.type) {
        switch (attrs.layout.type) {
            case 'constrained':
            case 'flex': {
                classNames.push('flex');
                attrs.layout?.orientation
                    ? classNames.push(`flex-col`)
                    : classNames.push('flex-row');

                attrs.layout?.wrapping
                    ? classNames.push('flex-wrap')
                    : classNames.push('flex-nowrap');

                const flexAlignmentMap = {
                    'left': 'start',
                    'right': 'end',
                    'center': 'center',
                    'justify': 'between',
                    'start': 'start',
                    'end': 'end'
                };

                if (attrs.layout?.justifyContent) {
                    attrs.layout.orientation === 'vertical'
                        ? classNames.push(`items-${flexAlignmentMap[attrs.layout.justifyContent] || 'start'}`)
                        : classNames.push(`justify-${flexAlignmentMap[attrs.layout.justifyContent] || 'start'}`);
                }
                if (attrs.layout?.verticalAlignment) {
                    attrs.layout.orientation === 'vertical'
                        ? classNames.push(`justify-${flexAlignmentMap[attrs.layout.verticalAlignment] || 'start'}`)
                        : classNames.push(`items-${flexAlignmentMap[attrs.layout.verticalAlignment] || 'start'}`);
                }
                //handle blockgap
                if (attrs.style?.spacing?.blockGap) {
                    classNames.push(`gap-[${attrs.style.spacing.blockGap}]`);
                } else if (attrs.layout?.gap) {
                    classNames.push(`gap-[${attrs.layout.gap}]`);
                }
            }
                break;
            case 'grid': {
                classNames.push('grid');
                /* coming from WordPress, either we have a columnCount (and maybe minimumColumnWidth = null) or a 
                minimumColumnWidth (with columnCount = null). only one of these should be set. */
                if (attrs.layout?.columnCount) {
                    classNames.push(`grid-cols-${attrs.layout.columnCount}`);
                } else if (attrs.layout?.minimumColumnWidth) {
                    classNames.push(`grid-cols-[repeat(auto-fill,minmax(${attrs.layout.minimumColumnWidth}px,1fr))]`);
                } else {
                    classNames.push('grid-cols-1');
                }

                // Handle grid gap
                if (attrs.layout?.gap) {
                    classNames.push(`gap-[${attrs.layout.gap}]`);
                }
            }
                break;

            case 'block':
            default: {
                classNames.push('block');
            }
                break;
        }
    }

    // Handle custom layout attributes

    const isGridChild = attrs?.style?.layout?.columnSpan || attrs?.style?.layout?.rowSpan;
    if (isGridChild) {
        if (attrs.style?.layout?.columnSpan) {
            classNames.push(`col-span-${attrs.style.layout.columnSpan}`);
        }
        if (attrs.style?.layout?.rowSpan) {
            classNames.push(`row-span-${attrs.style.layout.rowSpan}`);
        }
    }

    return classNames.join(' ');
}

/**
 * Handles text color attributes and converts them to Tailwind CSS class names. Can handles attrs.textColor only
 * @param {object} attrs - The attributes object containing text color properties.
 * @return {string} A Tailwind CSS class name for the text color, or an empty string if not applicable.
 */
function handleTextColor(attrs) {
    if (!attrs || typeof attrs !== 'object' || !attrs.textColor) return '';

    let textColor = attrs.textColor;
    textColor = convertColour(textColor);
    return `text-${textColor}`;

}


function handleBackgroundColor(attrs) {
    if (!attrs || typeof attrs !== 'object' || !attrs.backgroundColor) return '';

    let bgColor = attrs.backgroundColor;
    bgColor = convertColour(bgColor);
    return `bg-${bgColor}`;
}

/**
 * Handles font size attributes and converts them to Tailwind CSS class names.
 * This function checks for font size attributes in the attrs object and returns the corresponding Tailwind CSS class names.
 * NOTE: this function is specifically for handling attrs.fontSize only. if font size are stored elsehwere, they should be handled in the handleStyle function.
 * @param {object} attrs - The attributes object containing font size properties.
 * @return {string} A Tailwind CSS class name for the font size, or an empty string if not applicable.
 */
function handleFontSize(attrs) {
    if (!attrs || typeof attrs !== 'object' || !attrs.fontSize) return '';

    const fontSize = attrs.fontSize;
    // Tailwind uses rem units for font sizes, WordPress uses named sizes.
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
    const twSize = sizeMap[fontSize] || 'base'; // default to base if not found

    return `text-${twSize}`;
}

/* here be dragons */

/**
 * Handles style attributes and converts them to Tailwind CSS class names.
 * This function checks for style attributes in the attrs object and returns the corresponding Tailwind CSS class names.
 * 
 * we need to be able to handle the following:
 * attrs.style
 *  - typography
 *  -- fontStyle
 *  -- fontWeight (number)
 *  -- fontSize (string, e.g. '16px', '1rem', '2em') for custom values
 *  - elements
 *  -- link
 *  --- color
 *  ---- text
 *  - shadow
 
 * @param {object} attrs - The attributes object containing style properties.
 * @return {string} A string of Tailwind CSS class names for styles, or an empty string if not applicable.
 */
function handleStyle(attrs) {
    if (!attrs || typeof attrs !== 'object') return '';

    const classNames = [];

    // Handle typography
    if (attrs.style?.typography) {
        const { fontStyle, fontWeight, fontSize } = attrs.style.typography;
        if (fontStyle) classNames.push((fontStyle === 'italic') ? 'italic' : 'not-italic'); //Tailwind 4.1+

        if (fontWeight) {
            // Tailwind uses font-weight classes like 'font-light', 'font-normal', 'font-bold', etc.
            // Map numeric font weights to Tailwind CSS equivalents
            const weightMap = {
                100: 'thin',
                200: 'extralight',
                300: 'light',
                400: 'normal',
                500: 'medium',
                600: 'semibold',
                700: 'bold',
                800: 'extrabold',
                900: 'black'
            };
            const twWeight = weightMap[fontWeight] || 'normal'; // default to normal if not found
            classNames.push(`font-${twWeight}`);
        }
        if (fontSize) classNames.push(`text-[${fontSize}]`); // assuming fontSize is a valid CSS value like '16px', '1rem', etc.
    }
    if (attrs.style?.elements) {
        const elements = attrs.style.elements;
        //TODO: core/button has been updated to support innerblocks, so we need to come back and monitor this.
        //if (elements?.link?.color) classNames.push(`[&>a]:text-${convertColour(elements.link.color)}`);

        if (elements?.heading?.text) {
            const headingTextColor = convertColour(elements.heading.text);
            classNames.push(`has-headings:text-${headingTextColor}`);
        }
        if (elements?.heading?.background) {
            const headingBackgroundColor = convertColour(elements.heading.background);
            classNames.push(`has-headings:bg-${headingBackgroundColor}`);
        }
    }

    if (attrs.style?.shadow) {

    }

    return classNames.join(' ');
}

/**
 * Handles vertical alignment attributes and converts them to Tailwind CSS class names.
 * This function checks for vertical alignment attributes in the attrs object and returns the corresponding Tailwind CSS class names.
 * @param {object} attrs - The attributes object containing vertical alignment properties.
 * @return {string} A Tailwind CSS class name for the vertical alignment, or an empty string if not applicable.
 */
function handleVerticalAlignment(attrs) {
    if (!attrs || typeof attrs !== 'object' || !attrs.verticalAlignment) return '';

    const classNames = [];

    switch (attrs.verticalAlignment) {
        case 'middle':
        case 'center':
            classNames.push('items-center');
            break;
        case 'bottom':
            classNames.push('items-end');
            break;
        case 'top':
        default:
            classNames.push('items-start');
            break;
        // no default action needed 
    }

    return classNames.join(' ');
}


/* special cases */

/**
 * core/cover has 'contentPosition' attributes that need to be handled.
 * @param {object} attrs - The attributes object containing the 'contentPosition' and 'dimRatio' properties.
 * @return {string} A Tailwind CSS class name for the content position, or an empty string if not applicable.
 */
function handleContentPosition(attrs) {
    if (!attrs || typeof attrs !== 'object') return '';

    const classNames = [];

    //if contentPosition is set, we need to convert it to a Tailwind CSS class name
    if (attrs?.contentPosition && typeof attrs.contentPosition === 'string') {
        const position = attrs.contentPosition || 'center center';
        const [vertical, horizontal] = position.split(' ');

        // Map the horizontal and vertical positions to Tailwind CSS classes
        const direction = {
            left: 'start',
            center: 'center',
            right: 'end',
            top: 'start',
            bottom: 'end'
        };

        classNames.push(`flex items-${direction[horizontal] || 'center'} justify-${direction[vertical] || 'center'}`);
    }

    return classNames.join(' ');
}
