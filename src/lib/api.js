import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.WP_URL;
const IS_DEV = process.env.NODE_ENV === 'development';

export async function fetchAPI(query, { variables } = {}) {
    
    if (!API_URL) {
        throw new Error('API URL is not defined. Please set WP_URL in your environment variables.');
    }

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
    if (!res.ok) {
        console.error(`Error fetching API: ${res.status} ${res.statusText}`);
        throw new Error(`Failed to fetch API: ${res.status} ${res.statusText}`);
    }
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
                        uri
                        parent {
                            node {
                                uri
                            }
                        }
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

/**
 * Parses the JSON block data.
 * @param {*} blockData 
 * @return {Array} An array of parsed blocks.
 */
export function parseBlocks(blockData) {
    if (!blockData || typeof blockData !== 'string') return [];

    try {
        const parsed = JSON.parse(blockData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error parsing block data:', error, blockData?.slice?.(0, 100)); //we don't need that much data
        return [];
    }
}