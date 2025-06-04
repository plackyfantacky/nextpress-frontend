/**
 * Parses the JSON block data.
 * @param {*} blockData 
 * @return {Array} An array of parsed blocks.
 */
export function parseBlocks(blockData) {
    if (!blockData || typeof blockData !== 'string') return [];

    try {
        const parsed = JSON.parse(blockData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error parsing block data:', error, blockData?.slice?.(0, 100)); //we don't need that much data
        return [];
    }
}


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

export const wrappableBlocks = [
    'core/group',
    'core/columns',
    'core/cover',
    'core/quote',
    'core/pullquote',
    'core/media-text',
    'core/classic',
];


/**
 * Renders a single block of content.
 * 
 * Note: some blocks contain a attrs property which contains additional attributes like src for images.
 * 
 * @param {*} blockData 
 * @returns 
 */
export function renderBlock(block, keyPrefix = 'block', postContext = {}) {
    const { blockName, attrs = {}, innerBlocks = [], innerHTML = '' } = block;

    const key = `${keyPrefix}-${Math.random().toString(36).substring(2, 8)}`; // unique enough for now

    const { text, blockClassName: rawClass, remainingClasses } = extractTextAndClasses(block.innerHTML);
    let blockClassName = normalizeBlockClassName(rawClass);

    switch (blockName) {

        //cover block
        case 'core/cover': {
            const {
                contentPosition = 'center center',
                tagName = 'section',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || 'section';

            const positionClass = contentPositionToTailwind(contentPosition);
            const finalClassNames = joinClassNames(blockClassName, positionClass, className); // remove this for now ...remainingClasses

            const blockChildren = innerBlocks.map((child, i) =>
                renderBlock(child, `${keyPrefix}-cover-${i}`, postContext)
            );

            return (
                <Tag key={key} className={finalClassNames} >
                    {withConditionalInnerWrapper(blockChildren, innerHTML)}
                </Tag>
            );
        }

        //group/column/row block
        case 'core/group': {
            const {
                layout = {},
                tagName = 'div',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const type = layout.type || 'default';
            const orientation = type === 'flex' ? layout.orientation || 'horizontal' : undefined;

            let layoutClass = '';

            if (type === 'flex') {
                blockClassName = orientation === 'horizontal' ? 'row-block' : 'column-block';
                layoutClass = orientation === 'horizontal' ? 'flex flex-row' : 'flex flex-col';
            }

            const Tag = tagName || 'div';

            const finalClassNames = joinClassNames(blockClassName, layoutClass, className); // remove this for now ...remainingClasses

            const blockChildren = innerBlocks.map((child, i) =>
                renderBlock(child, `${keyPrefix}-cover-${i}`, postContext)
            );

            return (
                <Tag key={key} className={finalClassNames} >
                    {withConditionalInnerWrapper(blockChildren, innerHTML)}
                </Tag>
            );
        }

        //columns (and column) block
        case 'core/columns': {
            const {
                tagName = 'div',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || 'div';

            const finalClassNames = joinClassNames(blockClassName, 'grid grid-cols-12', className);

            const blockChildren = innerBlocks.map((child, i) =>
                renderBlock(child, `${keyPrefix}-cover-${i}`, postContext)
            );

            return (
                <Tag key={key} className={finalClassNames} >
                    {withConditionalInnerWrapper(blockChildren, innerHTML)}
                </Tag>
            );
        }

        case 'core/column': {
            const {
                width = '100%',
                tagName = 'div',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || 'div';

            const finalClassNames = joinClassNames(blockClassName, className);
            
            const blockChildren = innerBlocks.map((child, i) =>
                renderBlock(child, `${keyPrefix}-cover-${i}`, postContext)
            );

            return (
                <Tag key={key} className={finalClassNames} >
                    {withConditionalInnerWrapper(blockChildren, innerHTML)}
                </Tag>
            );
        } 

        //post title block
        case 'core/post-title': {
            const {
                level = 2,
                isLink = false,
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = `h${level >= 1 && level <= 6 ? level : 2}`;

            const title = postContext?.postTitle || 'Untitled';

            const titleNode = isLink ? (
                <a href={postContext?.postUrl || '#'}>{title}</a>
            ) : (
                title
            );

            const finalClassNames = joinClassNames('post-title',`text-${Tag}`, className); //special case: this block has no blockClassName 

            return (
                <Tag key={key} className={`${finalClassNames}`}>{titleNode}</Tag>
            );
        }

        //heading block
        case 'core/heading': {
            const {
                level = 2,
                tagName = `h${level >= 1 && level <= 6 ? level : 2}`,
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || `h${level}`;

            const finalClassNames = joinClassNames(blockClassName,`text-${Tag}`, className);

            return (
                <Tag key={key} className={finalClassNames}>
                    {text}
                </Tag>
            );
        }

        //paragraph block
        case 'core/paragraph': {
            const {
                tagName = 'p',
                className = '' //explicably set by the user in the editor
            } = attrs;

            const Tag = tagName || 'p';

            const finalClassNames = joinClassNames(blockClassName, className);

            return <Tag key={key} className={finalClassNames}>{text}</Tag>;
        }






        default: {
            console.warn(`Unhandled block type: ${blockName}`);
            return null;
        }
    }
}


/**
 * Maps wordpress alignment classnames to Tailwind CSS classes.
 */
function contentPositionToTailwind(pos) {
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
 * rename WP classnames to custom ones.
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
 * join class names with a space.
 * @param {...string} classes - The class names to join.
 */
export function joinClassNames(...args) {
    return args
        .flat() // allow arrays inside arguments
        .filter(Boolean) // remove null, undefined, false, '', 0
        .join(' ');
}

/**
 * detect if the block contains an div.inner element/className
 */
export function withConditionalInnerWrapper(children, innerHTML = '') {
  return innerHTML.includes('class="inner"') || innerHTML.includes("class='inner'")
    ? <div className="inner">{children}</div>
    : children;
}