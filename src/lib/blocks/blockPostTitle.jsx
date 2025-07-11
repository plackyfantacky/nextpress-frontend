import React from "react";
import { joinClassNames } from "@/lib/utils";
import { processAttributesToClassNames } from "@/lib/attributes";
import { A } from "@/components/elements";

export default function BlockPostTitle({ block, keyPrefix, postContext }) {
    
    // NOTE! Styles are attrs, but this block has not innerHTML, so we don't need to extract them.
    
    const { attrs = {}, idAttribute = ''} = block;
    const {
        level = 2,
        isLink = false,
        rel = '',
        linkTarget = '',
        className = ''
    } = attrs; //TODO: investigate (if bored) why level = 1 throws an error in the parser.

    const Tag = `h${level >= 1 && level <= 6 ? level : 2}`;
    const title = postContext?.postTitle || 'Untitled';

    const processedClassNames = processAttributesToClassNames(attrs, true);

    const text = isLink ? (
        <>
            <A hzref={postContext?.postUrl} {...(rel ? { rel } : {})} {...(linkTarget ? { target: linkTarget } : {})}>
                {title}
            </A>
        </>
    ) : title;

    const blockClassNames = joinClassNames('post-title', processedClassNames); //manual blockClassName as one isn't provided in the block

    return (
        <Tag key={keyPrefix} className={`${blockClassNames}`} {...(idAttribute ? { id: idAttribute } : {})}>{text}</Tag>
    );
}