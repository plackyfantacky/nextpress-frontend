import { getHomePageBlocks } from '@/lib/api';
import { parseBlocks, renderBlock } from '@/lib/blocks';
import { PerformanceMarker } from "@/lib/performance";

export default async function Homepage() {

    const homepage = await getHomePageBlocks();
    const blocks = parseBlocks(homepage);

    if (!blocks || blocks.length === 0) return <div>No content available</div>;

    const t0 = performance.now();
    const renderedBlocks = blocks.map((block, i) =>
        renderBlock(block, `block-${i}`)
    );
    const t1 = performance.now();
    
    console.log(`🕓 Rendered ${blocks.length} blocks in ${t1 - t0} ms`);

    return (
        <>
            <PerformanceMarker />
            {renderedBlocks}
        </>
    );

}