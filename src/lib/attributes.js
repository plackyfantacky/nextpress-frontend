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
    const potentialTailwindClasses = {
        marginTop: 'mt',
        marginBottom: 'mb',
        marginLeft: 'ml',
        marginRight: 'mr',
        paddingTop: 'pt',
        paddingBottom: 'pb',
        paddingLeft: 'pl',
        paddingRight: 'pr',
        containerWidth: 'w',
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

    // Convert potential class names to Tailwind CSS classes
    Object.entries(potentialTailwindClasses).forEach(([key, prefix]) => {
        if (attrs[key]) {
            const value = attrs[key];
            classNames.push(`${prefix}-[${value}]`);
        }
    });

    return classNames
        .flat() // allow arrays inside arguments
        .filter(Boolean) // remove null, undefined, false, '', 0
        .join(' ')
}