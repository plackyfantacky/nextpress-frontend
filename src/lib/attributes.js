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
    if (attrs.containerType === 'boxed') {
        if (attrs.containerWidth) {
            classNames.push(`w-[${attrs.containerWidth}]`);
        }
    } else if (attrs.containerType === 'full') {
        classNames.push('w-[100cqw]');
    }


    return classNames
        //.flat() // allow arrays inside arguments
        .filter(Boolean) // remove null, undefined, false, '', 0
        .join(' ');
}

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