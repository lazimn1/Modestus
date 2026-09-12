import * as fs from "fs";
import { products } from "../src/lib/products.ts";

function generateSql() {
  let sql = `-- ============================================================
-- Modestus Seed Data
-- Run this in the Supabase SQL Editor to populate products
-- ============================================================\n\n`;

  sql += `TRUNCATE TABLE public.reviews CASCADE;\n`;
  sql += `TRUNCATE TABLE public.products CASCADE;\n\n`;

  for (const p of products) {
    const imagesArray = JSON.stringify(p.images);
    const colorsJson = JSON.stringify(p.colors);
    const sizesArray = JSON.stringify(p.sizes);

    sql += `INSERT INTO public.products (
      id, slug, title, subtitle, price, original_price, images, colors, sizes, badge, description, fabric, size_guide, rating, review_count, aspect_class
    ) VALUES (
      ${p.id},
      '${p.slug.replace(/'/g, "''")}',
      '${p.title.replace(/'/g, "''")}',
      '${p.subtitle.replace(/'/g, "''")}',
      ${p.price},
      ${p.originalPrice || 'NULL'},
      '${imagesArray}',
      '${colorsJson.replace(/'/g, "''")}',
      '${sizesArray}',
      ${p.badge ? `'${p.badge.replace(/'/g, "''")}'` : 'NULL'},
      '${p.description.replace(/'/g, "''")}',
      '${p.fabric.replace(/'/g, "''")}',
      '${p.sizeGuide.replace(/'/g, "''")}',
      ${p.rating},
      ${p.reviewCount},
      '${p.aspectClass.replace(/'/g, "''")}'
    );\n`;

    if (p.reviews && p.reviews.length > 0) {
      for (const r of p.reviews) {
        sql += `INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          ${r.id},
          ${p.id},
          '${r.author.replace(/'/g, "''")}',
          '${r.location.replace(/'/g, "''")}',
          ${r.rating},
          '${r.date.replace(/'/g, "''")}',
          '${r.text.replace(/'/g, "''")}',
          '${r.initials.replace(/'/g, "''")}',
          '${r.avatarColor.replace(/'/g, "''")}'
        );\n`;
      }
    }
    sql += '\n';
  }

  // reset sequences
  sql += `SELECT setval(pg_get_serial_sequence('public.products', 'id'), (SELECT MAX(id) FROM public.products));\n`;
  sql += `SELECT setval(pg_get_serial_sequence('public.reviews', 'id'), (SELECT MAX(id) FROM public.reviews));\n`;

  fs.writeFileSync('./scripts/seed_products.sql', sql);
  console.log('Successfully generated ./scripts/seed_products.sql');
}

generateSql();
