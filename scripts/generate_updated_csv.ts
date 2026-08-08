import fs from 'fs';
import { products } from '../src/lib/products';

const headers = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags",
  "Published", "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", 
  "Option3 Name", "Option3 Value", "Variant SKU", "Variant Grams", 
  "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy", 
  "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price", 
  "Variant Requires Shipping", "Variant Taxable", "Image Src", "Image Position", 
  "Image Alt Text", "Gift Card", "SEO Title", "SEO Description", "Variant Image", 
  "Variant Weight Unit", "Cost per item", "Status"
];

function escapeCSV(val: any) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

let csvContent = headers.map(escapeCSV).join(',') + '\n';

// GitHub Raw base URL for Modestus repository
const BASE_URL = 'https://raw.githubusercontent.com/lazimn1/Modestus/main/public';

products.forEach(p => {
  const variants: any[] = [];
  p.sizes.forEach(size => {
    p.colors.forEach(color => {
      variants.push({ size, color: color.name });
    });
  });

  const numRows = Math.max(variants.length, p.images.length);

  for (let i = 0; i < numRows; i++) {
    const isFirst = i === 0;
    const variant = i < variants.length ? variants[i] : null;
    const image = i < p.images.length ? p.images[i] : null;

    const row = new Array(headers.length).fill('');

    row[0] = p.slug; // Handle

    if (isFirst) {
      row[1] = p.title; // Title
      row[2] = p.description + " <br><br> Fabric: " + p.fabric + " <br><br> Size Guide: " + p.sizeGuide; // Body
      row[3] = 'Modestus'; // Vendor
      row[7] = 'TRUE'; // Published
      row[8] = 'Size'; // Option1 Name
      row[10] = 'Color'; // Option2 Name
      row[33] = 'active'; // Status
    }

    if (variant) {
      row[9] = variant.size; // Option1 Value
      row[11] = variant.color; // Option2 Value
      row[16] = 'shopify'; // Variant Inventory Tracker
      row[17] = '10'; // Variant Inventory Qty
      row[18] = 'deny'; // Variant Inventory Policy
      row[19] = 'manual'; // Variant Fulfillment Service
      row[20] = p.price; // Variant Price
      if (p.originalPrice) row[21] = p.originalPrice; // Variant Compare At Price
      row[22] = 'TRUE'; // Variant Requires Shipping
      row[23] = 'TRUE'; // Variant Taxable
      row[31] = 'g'; // Variant Weight Unit
    }

    if (image) {
      // Convert absolute local path like /images/hero-model.webp to github raw URL
      let imgUrl = image;
      if (image.startsWith('/')) {
        imgUrl = BASE_URL + image;
      }
      row[24] = imgUrl; // Image Src
      row[25] = i + 1; // Image Position
    }

    csvContent += row.map(escapeCSV).join(',') + '\n';
  }
});

const outputPath = 'C:\\\\Users\\\\USER\\\\Downloads\\\\modestus_products_updated_images.csv';
fs.writeFileSync(outputPath, csvContent, 'utf8');
console.log('CSV created successfully at ' + outputPath);
