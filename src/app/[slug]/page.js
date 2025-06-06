import { getPageBySlug } from "@/lib/api";
import { parseBlocks, renderBlock } from "@/lib/blocks";
import { PerformanceMarker } from "@/lib/performance";

export const dynamic = 'force-dynamic';

export default async function Page(props) {
    const params = await props.params;
    const page = await getPageBySlug(params.slug);

    if (!page) { return <div>Page not found</div>; } //TODO: 404 page

    const postContext = {
        postId: page.databaseId,
        postTitle: page.title,
        postUrl: `${page.uri}`,
        postSlug: page.slug,
        postImage: page.featuredImage?.node?.sourceUrl,
    };

    const blocks = parseBlocks(page.blocksJSON);
    if (!blocks || blocks.length === 0) return <div>No content available</div>;

    const t0 = performance.now();
    const renderedBlocks = blocks.map((block, i) =>
        renderBlock(block, `block-${i}`, postContext)
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