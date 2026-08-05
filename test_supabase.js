require("dotenv").config({ path: ".env.local" });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Try to GET from a table named 'reviews'
  const res = await fetch(`${supabaseUrl}/rest/v1/reviews?select=*`, {
    headers: {
      "apikey": anonKey,
      "Authorization": `Bearer ${anonKey}`,
    }
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

run();
