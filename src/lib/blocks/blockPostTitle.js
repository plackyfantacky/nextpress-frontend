import React from "react";
import { joinClassNames } from "@/lib/utils";

export default function BlockPostTitle({ block, keyPrefix, postContext }) {
    const { attrs = {}, idAttribute = '', normalizedClassNames = '' } = block;
    const { level = 2, isLink = false, rel = '', linkTarget = '' } = attrs; //TODO: investigate (if bored) why level = 1 throws an error in the parser.

    const Tag = `h${level >= 1 && level <= 6 ? level : 2}`;
    const title = postContext?.postTitle || 'Untitled';

    const text = isLink ? (
        <a href={postContext?.postUrl || '#'} {...(rel ? { rel } : {})} {...(linkTarget ? { target: linkTarget } : {})}>{title}</a>
    ) : title;

    const blockClassNames = joinClassNames('post-title', normalizedClassNames); //manual blockClassName as one isn't provided in the block

    return (
        <Tag key={keyPrefix} className={`${blockClassNames}`} {...(idAttribute ? { id: idAttribute } : {})}>{text}</Tag>
    );
}