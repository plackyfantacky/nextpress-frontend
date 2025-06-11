export function generateBlockClassNames(block) {
    const { blockName, attrs = {} } = block;
    const classes = [];

    // Block-level shorthand
    if (attrs.textColor) classes.push(`text-${attrs.textColor}`);
    if (attrs.backgroundColor) classes.push(`bg-${attrs.backgroundColor}`);
    if (attrs.fontSize) classes.push(attrs.fontSize);
    if (attrs.fontFamily) classes.push(`font-${attrs.fontFamily}`);

    // Typography
    const letterSpacing = attrs?.style?.typography?.letterSpacing;
    if (letterSpacing) {
        classes.push(`tracking-[${letterSpacing}]`);
    }

    // Layout / selfStretch / flexSize — optional
    const stretch = attrs?.style?.layout?.selfStretch;
    if (stretch === 'fixed') classes.push('self-start'); // or self-stretch
    const flexSize = attrs?.style?.layout?.flexSize;
    if (flexSize) classes.push(`basis-[${flexSize}]`);

    // if the attrs contain blockName = core/post-title and isLink = false or not present, abort early
    if (blockName == 'core/post-title' && (attrs.isLink === false || attrs.isLink === undefined)) {
        return classes.join(' ');
    }

    // Link styles (only if block wraps a link)
    const linkColorVar = attrs?.style?.elements?.link?.color?.text;
    const linkMatch = linkColorVar?.match(/var:preset\|color\|([a-z0-9-]+)/);
    if (linkMatch) {
        const linkColor = linkMatch[1];
        classes.push(`[&>a]:text-${linkColor}`);
    }

    return classes.join(' ');
};