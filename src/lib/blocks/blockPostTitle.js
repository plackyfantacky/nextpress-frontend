import React from "react";
import { joinClassNames } from "../utils";


export default function BlockPostTitle({ block, keyPrefix, postContext }) {
    const { attrs = {}, blockName = '', normalizedClassNames = '' } = block;

    const {
        level = 2,
        isLink = false,
        rel = '',
        linkTarget = '',
    } = attrs;

    const Tag = `h${level >= 1 && level <= 6 ? level : 2}`;
    const title = postContext?.postTitle || 'Untitled';
    const titleNode = isLink ? (
        <a href={postContext?.postUrl || '#'} {...(rel ? { rel } : {})} {...(linkTarget ? { target: linkTarget } : {})}>{title}</a>
    ) : title;

    const blockClassNames = joinClassNames(blockName, normalizedClassNames);

    return (
        <Tag key={keyPrefix} className={blockClassNames}>{titleNode}</Tag>
    );
}