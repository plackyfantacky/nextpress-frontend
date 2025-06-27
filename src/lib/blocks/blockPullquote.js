import React from 'react';

import { joinClassNames, extractTag } from "@/lib/utils";
import { renderInlineHTML } from "@/lib/parser";
import { Blockquote } from "@/components/elements";

export default function BlockPullquote({ block, keyPrefix }) {
    const { idAttribute = '', blockClassName = '', normalisedClassNames = '', innerHTML = '' } = block;

    return <Blockquote block={block} key={keyPrefix} wrapInFigure={true} />;
};