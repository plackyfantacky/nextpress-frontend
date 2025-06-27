const API_URL = process.env.WP_URL;
const IS_DEV = process.env.NODE_ENV === 'development';

export async function fetchAPI(query, { variables } = {}) {
    

    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        ...(IS_DEV
            ? { cache: 'no-store' }
            : { next: { revalidate: 86400 } }
        )
    };

    const res = await fetch(API_URL, fetchOptions);
    const json = await res.json();

    if (json.errors) {
        console.error(json.errors);
        throw new Error('Failed to fetch API');
    }

    return json.data;
}

export async function getAllPagesWithSlugs() {
    const data = await fetchAPI(`
        query AllPages {
            pages {
                edges {
                    node {
                        slug
                    }
                }
            }
        }
    `);

    return data?.pages?.edges || [];
}

export async function getPageBySlug(slug) {
    const data = await fetchAPI(`
        query PageBySlug($slug: ID!) {
            page(id: $slug, idType: URI) {
                title
                uri
                slug
                guid
                databaseId
                blocksJSON
                featuredImage {
                    node {
                        sourceUrl
                        altText
                        title
                        caption
                    }
                }
            }
        }`,
        {
            variables: { slug },
        }
    );
    return data?.page || null;
}

export async function getHomePageBlocks() {
    const data = await fetchAPI(`
        query GetHomePage {
            page(id: "home", idType: URI) {
                blocksJSON
            }
        }`,
    );

    return data?.page?.blocksJSON || [];
}