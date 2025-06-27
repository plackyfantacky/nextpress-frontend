import React from "react";
import { joinClassNames } from "@/lib/utils";

export default function BlockGroup({ block, keyPrefix, children, inheritedProps = {} }) {
    const { attrs = {}, idAttribute = '', blockClassName = '', normalisedClassNames = '' } = block;
    const { layout = {}, tagName: Tag = 'div' } = attrs;
    
    let groupClasses = [], flexboxClasses = [], gridClasses = [], gridChildClasses = []; //roll your sleeves up, this is going to be messy

    const isPlainGroup = layout?.type === 'constrained' || !layout; // this should be the default
    const isFlex = layout?.type === 'flex';
    const isGridParent = layout?.type === 'grid';
    const isGridChild = attrs?.style?.layout?.columnSpan || attrs?.style?.layout?.rowSpan; // TODO: hacky, but not sure what else to do

    const flexAlignmentMap = {
        'left': 'start',
        'right': 'end',
        'center': 'center',
        'justify': 'between',
        'start': 'start',
        'end': 'end'
    }

    // Is the group a flexbox layout?
    if(isFlex) {

        flexboxClasses.push({
            orientation: (layout?.orientation == 'vertical' ? 'stack-block flex flex-col' : 'row-block flex'), //usually only vertical is defined
            wrapping: (layout?.wrapping ? 'flex-wrap' : 'flex-nowrap'),
            //if orientation is horizontal, then main axis is horizontal, so justifyContent is used
            //if orientation is vertical, then main axis is vertical, so alignItems is used
            //NOTE: the really confusing part is that the 'justifyContent' and 'verticalAlignment' attributes are used for both horizontal and vertical orientations, 
            // but they mean different things depending on the orientation.
            horizontalAlignment: (() => {
                if(layout?.orientation === 'vertical') 
                    return `items-${flexAlignmentMap[layout?.justifyContent] || 'start'}`;
                return `justify-${flexAlignmentMap[layout?.justifyContent] || 'start'}`;
            })(),
            verticalAlignment: (() => {
                if(layout?.orientation === 'vertical') 
                    return `justify-${flexAlignmentMap[layout?.verticalAlignment] || 'start'}`;
                return `items-${flexAlignmentMap[layout?.verticalAlignment] || 'start'}`;    
            })()
        })
    }

    // Is the group a grid layout? (with children)
    if(isGridParent) {
        //either we have a columnCount (and maybe minimumColumnWidth = null) or a minimumColumnWidth (with columnCount = null). only one of these should be set.
        let gridTemplate = (layout?.columnCount ? `grid-cols-${layout.columnCount}` : (layout?.minimumColumnWidth ? `grid-cols-[repeat(auto-fill, minmax(${layout.minimumColumnWidth}px_1fr))]` : '1fr'));

        gridClasses.push({
            gridTemplateColumns: gridTemplate,
        });
    }

    // Is the group a grid child?
    if(isGridChild) {
        gridChildClasses.push({
            columnClass: `col-[span_${attrs?.style?.layout?.columnSpan}]` || '',
            rowClass: `row-[span_${attrs?.style?.layout?.rowSpan || 1}]` || '',
        });
    }

    // If the block is a plain group, check for one weird edge-case where 'justifyContent` may have been specified in attrs.layout.justifyContent
    // This is a workaround for a bug in the WordPress editor where the 'justifyContent' attribute is not applied correctly to the group block.
    // TO DO: there is a wierd bug in that if user doesn't specifically set the toolbar alignment to 'center', no alignment is applied. The problem
    // here is the editor doesn't make it clear that the center alignment is applied or not (they both show applied).
    if(isPlainGroup && layout?.justifyContent) {
        groupClasses.push([
            'group-block',
            'flex',
            `justify-${flexAlignmentMap[layout.justifyContent] || 'start'}`, // default to 'start' if not found
        ]);
    }

    // Combine all classes into a single className
    const blockClassNames = joinClassNames(
        ...groupClasses,
        ...flexboxClasses.map(cls => joinClassNames(cls.orientation, cls.wrapping, cls.horizontalAlignment, cls.verticalAlignment)),
        ...gridClasses.map(cls => joinClassNames('grid-block grid', cls.gridTemplateColumns)),
        ...gridChildClasses.map(cls => joinClassNames(cls.columnClass, cls.rowClass)),
        normalisedClassNames
    );

    //console.log('Group Block Class Names:', blockClassNames);

    return (
        <Tag key={keyPrefix} className={blockClassNames} {...(idAttribute ? { id: idAttribute } : {})}>
            {children}
        </Tag>
    );
}