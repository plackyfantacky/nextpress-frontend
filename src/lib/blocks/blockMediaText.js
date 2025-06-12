import Figure from '@/components/elements/Figure';
import { joinClassNames, extractAttributeValue } from '@/lib/utils';

export default function BlockMediaText({keyPrefix, block, children }) {
    const { attrs = {}, blockName = '', innerHTML = '' } = block;

    //console.log('block', block);

    const {
        mediaPosition = 'left',
        verticalAlignment = 'center',
        backgroundColor = '',

    } = attrs;

    // const containerClasses = joinClassNames(
    //     'flex',
    //     mediaPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
    //     verticalAlignment === 'center' && 'items-center',
    //     backgroundColor && `bg-${backgroundColor}`,
    //     blockName,
    //     normalizedClassNames
    // );

    return (
        <div>work in progress</div>
    );

}