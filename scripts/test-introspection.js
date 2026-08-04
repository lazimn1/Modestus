
require('dotenv').config({ path: '.env.local' });

const url = 'https://' + process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN + '/api/2024-01/graphql.json';
const headers = { 
  'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN, 
  'Content-Type': 'application/json' 
};
const query = `
{
  __type(name: "Customer") {
    fields {
      name
    }
  }
}
`;

fetch(url, { method: 'POST', headers, body: JSON.stringify({ query }) })
  .then(res => res.json())
  .then(json => {
    console.log(json.data.__type.fields.map(f => f.name));
  });
