import React from "react";
import { joinClassNames } from "../utils";
import { generateBlockClassNames } from "../generateBlockClassNames";

export default function BlockPostTitle({ block, keyPrefix, postContext }) {
    const { attrs = {}, blockClassName = '', extractedClassNames = '', innerHTML } = block;

    const {
        level = 2,
        isLink = false,
        classNames = '', //explicably set by the user in the editor
        rel = '',
        linkTarget = '',
    } = attrs;

    const Tag = `h${level >= 1 && level <= 6 ? level : 2}`;
    const title = postContext?.postTitle || 'Untitled';
    const titleNode = isLink ? (
        <a href={postContext?.postUrl || '#'} {...(rel ? { rel } : {})} {...(linkTarget ? { target: linkTarget } : {})}>{title}</a>
    ) : title;

    const tailwindClasses = generateBlockClassNames(block);

    const finalClassNames = joinClassNames('post-title', tailwindClasses, classNames);

    return (
        <Tag key={keyPrefix} className={`${finalClassNames}`}>{titleNode}</Tag>
    );
}