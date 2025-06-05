import { getPageBySlug } from "@/lib/api";
import { parseBlocks, renderBlock } from "@/lib/blocks";

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

    const renderedBlocks = blocks.map((block, i) =>
        renderBlock(block, `block-${i}`, postContext)
    );

    //console.log("SentContext:", page);

    return (
        <>
            {renderedBlocks}
        </>
    );
}