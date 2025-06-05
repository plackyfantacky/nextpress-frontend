const API_URL = process.env.WP_URL;

export async function fetchAPI(query, { variables } = {}) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 60 }
    });

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