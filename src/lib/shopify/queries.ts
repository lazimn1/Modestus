import { shopifyFetch } from './index';

// GraphQL query to get the first 10 products
const getProductsQuery = `
  query getProducts {
    products(first: 20) {
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
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
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

  return res.body?.data?.products?.edges?.map((edge: any) => edge.node) || [];
}

// GraphQL query to get a single product by handle
const getProductQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
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
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

// Helper function to call the single product query
export async function getProduct(handle: string) {
  const res = await shopifyFetch({
    query: getProductQuery,
    variables: { handle },
    cache: 'no-store'
  });

  return res.body?.data?.product;
}

// Create a Shopify Checkout/Cart
const cartCreateMutation = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createShopifyCheckout(lines: { merchandiseId: string; quantity: number }[]) {
  const res = await shopifyFetch({
    query: cartCreateMutation,
    variables: {
      input: {
        lines
      }
    },
    cache: 'no-store'
  });

  const cartCreate = res.body?.data?.cartCreate;
  if (cartCreate?.userErrors?.length > 0) {
    throw new Error(cartCreate.userErrors.map((e: any) => e.message).join(", "));
  }

  return cartCreate?.cart?.checkoutUrl;
}

