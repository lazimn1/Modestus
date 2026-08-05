require("dotenv").config({ path: ".env.local" });

async function shopifyAdminFetch({ query, variables }) {
  const result = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_PRIVATE_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await result.json();
  if (body.errors) {
    throw body.errors[0];
  }
  return { body };
}

async function run() {
  try {
    const SET_METAFIELD_MUTATION = `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    const GET_PROD = `query { products(first:1) { edges { node { id } } } }`;
    const prodRes = await shopifyAdminFetch({ query: GET_PROD });
    const id = prodRes.body.data.products.edges[0].node.id;

    console.log("Setting metafield for:", id);

    const res = await shopifyAdminFetch({
      query: SET_METAFIELD_MUTATION,
      variables: {
        metafields: [
          {
            ownerId: id,
            namespace: "custom",
            key: "product_reviews",
            type: "json",
            value: JSON.stringify([]),
          },
        ],
      },
    });
    console.log("Success:", JSON.stringify(res.body));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
