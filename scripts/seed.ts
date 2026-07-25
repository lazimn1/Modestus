import { createClient } from '@supabase/supabase-js';
import { products } from '../src/lib/products';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding products...');
  for (const p of products) {
    const { data, error } = await supabase
      .from('products')
      .upsert({
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        price: p.price,
        original_price: p.originalPrice || null,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        rating: p.rating,
        review_count: p.reviewCount,
        description: p.description,
        fabric: p.fabric,
        size_guide: p.sizeGuide,
        badge: p.badge || null,
        aspect_class: p.aspectClass,
      }, { onConflict: 'id' });

    if (error) {
      console.error(`Error inserting ${p.slug}:`, error.message);
    } else {
      console.log(`Inserted ${p.slug}`);
    }
  }
  console.log('Done!');
}

seed().catch(console.error);
