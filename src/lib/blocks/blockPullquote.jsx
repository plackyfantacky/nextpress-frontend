import React from 'react';
import { Blockquote } from "@/components/elements";

export default function BlockPullquote({ block, keyPrefix }) {
    return <Blockquote block={block} key={keyPrefix} wrapInFigure={true} />;
};