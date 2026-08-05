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
  return body;
}

async function run() {
  const res = await shopifyAdminFetch({ query: `query { shop { name } }` });
  console.log("Shop query:", res);

  const res2 = await shopifyAdminFetch({ query: `query { customers(first:1) { edges { node { id } } } }` });
  console.log("Customers query:", res2);
}

run();
