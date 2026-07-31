import { shopifyFetch } from './index';

// GraphQL query to get the first 10 products
const getProductsQuery = `
  query getProducts {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

// Helper function to call the query
export async function getProducts() {
  const res = await shopifyFetch({
    query: getProductsQuery,
    cache: 'no-store' // Use 'force-cache' for production to cache products
  });

  return res.body.data.products.edges.map((edge: any) => edge.node);
}
