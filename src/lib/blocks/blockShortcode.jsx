import React from 'react';
import { joinClassNames } from "@/lib/utils";
import { parseShortcodeTag } from "@/lib/parser";
import { getShortcodeRenderer } from "@/components/shortcodes";

export default function BlockShortcode({ block, keyPrefix }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '', innerContent = '' } = block;

    const rawContent = innerContent?.[0] || '';
    const shortcode = parseShortcodeTag(rawContent);

    const blockClassNames = joinClassNames(
        blockClassName,
        normalisedClassNames,
        attrs.class || '',
        'border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-sm w-full h-full',
    );

    if (!shortcode) {
        return (
            <div key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
                [Unrecognised or empty shortcode]
            </div>
        );
    }

    const ShortcodeComponent = getShortcodeRenderer(shortcode.name);

    if (ShortcodeComponent) {
        return (
            <ShortcodeComponent
                key={keyPrefix}
                shortcode={shortcode}
                block={block}
                idAttribute={idAttribute}
                keyPrefix={keyPrefix}
                className={blockClassNames}
            />
        );
    }

    return (
        <div key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            [Unrecognised shortcode: {shortcode.name}]
        </div>
    );
}