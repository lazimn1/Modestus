const { shopifyFetch } = require('./src/lib/shopify/index.js');
const { getCustomerToken } = require('./src/app/actions/auth.js');

async function testCustomerCart() {
  const query = `
    query getCustomerCart($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        email
        # Does cart exist?
      }
    }
  `;
  // Just testing if the field exists by looking at schema or trying it out
}
