import React from "react";
import { joinClassNames} from "@/lib/utils";

export default function BlockColumns({ block, keyPrefix, children, inheritedProps }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', processedClassNames = '' } = block;
    const { tagName: Tag = 'div' } = attrs;

    const blockClassNames = joinClassNames(blockClassName, processedClassNames, 'grid grid-cols-12 w-full');

    //count the number of columns based on the children
    // genrate a Tailwind class for the number of columns (divide 12 by the number of columns)
    const columnCount = React.Children.count(children) || 1; // Default to 1 column if no children
    const columnClass = `col-(--colspan-${Math.floor(12 / columnCount)})`;

    const nextInheritedProps = {
        ...inheritedProps,
        columnClass
    };

    const modifiedChildren = React.Children.map(children, (child, index) => {
        // Clone each child and add the column class
        return React.cloneElement(child, {
            inheritedProps: nextInheritedProps,
            key: `${keyPrefix}-col-${index}`
        });
    });

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...( idAttribute ? { id: idAttribute } : {} )}>
            {modifiedChildren}
        </Tag>
    );
}