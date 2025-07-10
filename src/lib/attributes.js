import { parse } from "path";

/**
 * Process an array of attribures for Tailwind like class names, and returns a string of class names.
 * Other className functionality is handled by the `normaliseClassNames` function.
 * 
 * Written as a pure function, so it can be used in other places without needing to import the `normaliseClassNames` function.
 * 
 * @params {object} attrs - The attributes object, typically from a block.
 * @returns {string} A string of class names suitable for use with Tailwind CSS.
 */
export function processAttributesToClassNames(attrs = {}, includeCoreClasses = false) {
    if (!attrs || typeof attrs !== 'object') return '';

    const classNames = [];

    // these attribute values may already have an associated className (which will be processed by `normaliseClassNames` function)
    // so we don't normally need to include them here. some blocks won't have classNames at all, so we can include them here.
    const coreClasses = {
        backgroundColor: 'bg',
        textColor: 'text',
        fontSize: 'text',
        fontFamily: 'font',
        textAlign: 'text'
    };

    //potential classNames from WordPress that could be converted to Tailwind CSS classes
    const marginGroup = {
        marginTop: 'mt',
        marginBottom: 'mb',
        marginLeft: 'ml',
        marginRight: 'mr'
    };

    const paddingGroup = {
        paddingTop: 'pt',
        paddingBottom: 'pb',
        paddingLeft: 'pl',
        paddingRight: 'pr'
    };

    const otherClasses = {
        containerHeight: 'h',
        gapHorizontal: 'gap-x',
        gapVertical: 'gap-y',
        width: 'w'
    };

    if (includeCoreClasses) {
        // Add core classes if requested
        Object.entries(coreClasses).forEach(([key, prefix]) => {
            if (attrs[key]) {
                const value = attrs[key];
                classNames.push(`${prefix}-${value}`);
            }
        });
    }

    addDirectionalSpacing(attrs, 'm', ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'], classNames);
    addDirectionalSpacing(attrs, 'p', ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'], classNames);

    Object.entries(otherClasses).forEach(([key, prefix]) => {
        const val = attrs[key];
        if (val !== undefined && val !== null && `${val}` !== '0') {
            classNames.push(`${prefix}-[${val}]`);
        }
    });

    //special case for containerWidth. if present, also check for attrs.containerType. if that is present and equals 'boxed', then add a class for the width.
    if (attrs?.containerType) {
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
                if (attrs.containerWidth) {
                    classNames.push(`w-[${attrs.containerWidth}]`);
                }
                break;
            default:
                // no default action needed
        }
    }

    return classNames
        //.flat() // allow arrays inside arguments
        .filter(Boolean) // remove null, undefined, false, '', 0
        .join(' ');
}

/**
 * Adds directional spacing classes to the classNames array based on the provided attributes.
 * @param {object} attrs - The attributes object containing spacing values.
 * @param {string} prefix - The prefix for the class names (e.g., 'm' for margin, 'p' for padding).
 * @param {Array} keys - An array of keys corresponding to the spacing values in the attrs object.
 * @param {Array} classNames - The array to which the generated class names will be added.
 * @returns {void} 
 */
function addDirectionalSpacing(attrs, prefix, keys, classNames) {
    const [topKey, bottomKey, leftKey, rightKey] = keys;

    const top = attrs[topKey];
    const bottom = attrs[bottomKey];
    const left = attrs[leftKey];
    const right = attrs[rightKey];

    const isNonZero = (v) => v !== undefined && v !== null && `${v}` !== '0';

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

/**
 * Extracts and parses styles stored within the style property of attributes.
 * A variety of blocks store styles in a nested object format, like this:
 * attrs.style.typography.fontWeight = '300';
 * This function extracts those styles and returns them as a flat object.
 * @param {object} attrs - The attributes object containing style properties.
 * @return {string} styles - string of styles we can normalise and use in classNames.
 */
export function parseNestedStyleAttributes(attrs) {
    if (!attrs || typeof attrs !== 'object' || !attrs.style) return {};

    const styles = {};
    const style = attrs.style;

    // Flatten the nested style attributes
    Object.entries(attrs.style).forEach(([groupKey, groupValue]) => {
        if (typeof groupValue === 'object' && groupValue !== null) {
            Object.entries(groupValue).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    styles[key] = value;
                }
            });
        } else if (typeof groupValue === 'string' || typeof groupValue === 'number') {
            styles[groupKey] = groupValue;
        }
    });

    // Convert styles to a string format suitable for class names
    const styleEntries = Object.entries(styles)
        .map(([key, value]) => {
            // Convert camelCase to kebab-case for CSS properties
            const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            return `${kebabKey}:${value}`;
        })
        .join(';');
        
    return styleEntries ? `${styleEntries};` : '';
}

/**
 * Processes a CSS style string or object into Tailwind CSS class names.
 * This function takes a CSS style string or object and converts it into a string of Tailwind CSS class names.
 * It supports both inline styles (as a string) and nested styles (as an object).
 * 
 * @param {string|object} sourceData - The CSS style string or object to process.
 * @param {string} sourceType - The type of source data, either 'inline' for a string or 'nested' for an object.
 * @returns {string} A string of Tailwind CSS class names.
*/
export function processStylesToClassNames(sourceData, sourceType = 'nested') {
    if (typeof sourceData === 'string' || sourceType === 'inline') {
    return sourceData
        .split(';')
        .map(rule => rule.split(':').map(s => s.trim()))
        .filter(([key, val]) => key && val)
        .map(([key, val]) => {
            switch(key) {
                case 'margin-top': return `mt-[${val}]`;
                case 'margin-bottom': return `mb-[${val}]`;
                case 'margin-left': return `ml-[${val}]`;
                case 'margin-right': return `mr-[${val}]`;
                case 'padding-top': return `pt-[${val}]`;
                case 'padding-bottom': return `pb-[${val}]`;
                case 'padding-left': return `pl-[${val}]`;
                case 'padding-right': return `pr-[${val}]`;
                case 'width': return `w-[${val}]`;
                case 'height': return `h-[${val}]`;
                case 'font-size': return `text-[${val}]`;
                //TODO: font-weight will be numerical e.g 300, 400, 500, etc
                case 'font-weight': (val) => {
                    const weightMap = {
                        '100': 'thin',
                        '200': 'extra-light',
                        '300': 'light',
                        '400': 'normal',
                        '500': 'medium',
                        '600': 'semi-bold',
                        '700': 'bold',
                        '800': 'extra-bold',
                        '900': 'black'
                    };
                    return `font-${weightMap[val] || val}`;
                }
                case 'font-family': return `font-${val}`;
                case 'text-align': return `text-${val}`;
                default: return '';
            }
        })
        .filter(Boolean)
        .join(' ');
    };

    if (typeof sourceData === 'object' && sourceType === 'nested') {
        const flattened = parseNestedStyleAttributes(sourceData);
        return typeof flattened === 'string' 
            ? processStylesToClassNames(flattened, 'inline')
            : ''
    }
    return '';
}
