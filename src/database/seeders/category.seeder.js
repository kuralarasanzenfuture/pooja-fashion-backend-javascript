import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabasePool } from '../connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceCategoryImagesDir = path.resolve(__dirname, '..', 'images', 'product-masters', 'category');
const uploadsCategoriesDir = path.resolve(__dirname, '..', '..', 'uploads', 'categories');

/**
 * ============================================================
 * REALISTIC CATEGORIES & SUBCATEGORIES SEED DATA
 * ============================================================
 * 25 Categories & 130 Child Subcategories
 * Matches authentic seed images from src/database/images/product-masters/category
 * ============================================================
 */

export const REALISTIC_CATEGORIES = [
  {
    category_code: 'MENS-WEAR',
    category_name: "Men's Wear",
    display_order: 1,
    is_active: true,
    image_file: 'Five Stylish Menswear Models Isolated.png',
    image_url: '/uploads/categories/mens-wear/five-stylish-menswear-models-isolated.png',
    image_key: 'categories/mens-wear/five-stylish-menswear-models-isolated.png',
    subcategories: [
      { subcategory_code: 'MENS-SHIRTS', subcategory_name: 'Shirts', display_order: 1 },
      { subcategory_code: 'MENS-TSHIRTS', subcategory_name: 'T-Shirts', display_order: 2 },
      { subcategory_code: 'MENS-TROUSERS', subcategory_name: 'Trousers', display_order: 3 },
      { subcategory_code: 'MENS-JEANS', subcategory_name: 'Jeans', display_order: 4 },
      { subcategory_code: 'MENS-CASUAL', subcategory_name: 'Casual Wear', display_order: 5 },
      { subcategory_code: 'MENS-FORMAL', subcategory_name: 'Formal Wear', display_order: 6 },
      { subcategory_code: 'MENS-SHORTS', subcategory_name: 'Shorts', display_order: 7 },
      { subcategory_code: 'MENS-TRACKPANTS', subcategory_name: 'Track Pants', display_order: 8 },
      { subcategory_code: 'MENS-KURTAS', subcategory_name: 'Kurtas', display_order: 9 },
      { subcategory_code: 'MENS-WESTCOATS', subcategory_name: 'Waistcoats', display_order: 10 },
    ],
  },
  {
    category_code: 'WOMENS-WEAR',
    category_name: "Women's Wear",
    display_order: 2,
    is_active: true,
    image_file: 'Women’s Fashion Style Showcase.png',
    image_url: '/uploads/categories/womens-wear/womens-fashion-style-showcase.png',
    image_key: 'categories/womens-wear/womens-fashion-style-showcase.png',
    subcategories: [
      { subcategory_code: 'WOMEN-TOPS', subcategory_name: 'Tops', display_order: 1 },
      { subcategory_code: 'WOMEN-KURTIS', subcategory_name: 'Kurtis', display_order: 2 },
      { subcategory_code: 'WOMEN-LEGGINGS', subcategory_name: 'Leggings', display_order: 3 },
      { subcategory_code: 'WOMEN-PALAZZO', subcategory_name: 'Palazzo Pants', display_order: 4 },
      { subcategory_code: 'WOMEN-TUNICS', subcategory_name: 'Tunics', display_order: 5 },
      { subcategory_code: 'WOMEN-DRESSES', subcategory_name: 'Dresses', display_order: 6 },
      { subcategory_code: 'WOMEN-GOWNS', subcategory_name: 'Gowns', display_order: 7 },
      { subcategory_code: 'WOMEN-SKIRTS', subcategory_name: 'Skirts', display_order: 8 },
      { subcategory_code: 'WOMEN-JEANS', subcategory_name: 'Jeans', display_order: 9 },
      { subcategory_code: 'WOMEN-PLAZZO-SETS', subcategory_name: 'Palazzo Sets', display_order: 10 },
      { subcategory_code: 'WOMEN-SALWAR', subcategory_name: 'Salwar Suits', display_order: 11 },
      { subcategory_code: 'WOMEN-SHRUGS', subcategory_name: 'Shrugs', display_order: 12 },
    ],
  },
  {
    category_code: 'KIDS-WEAR',
    category_name: 'Kids Wear',
    display_order: 3,
    is_active: true,
    image_file: 'Colorful Kids’ Fashion Catalog Group.png',
    image_url: '/uploads/categories/kids-wear/colorful-kids-fashion-catalog-group.png',
    image_key: 'categories/kids-wear/colorful-kids-fashion-catalog-group.png',
    subcategories: [
      { subcategory_code: 'KIDS-TSHIRTS', subcategory_name: 'T-Shirts', display_order: 1 },
      { subcategory_code: 'KIDS-SHIRTS', subcategory_name: 'Shirts', display_order: 2 },
      { subcategory_code: 'KIDS-PANTS', subcategory_name: 'Pants', display_order: 3 },
      { subcategory_code: 'KIDS-JEANS', subcategory_name: 'Jeans', display_order: 4 },
      { subcategory_code: 'KIDS-DRESSES', subcategory_name: 'Dresses', display_order: 5 },
      { subcategory_code: 'KIDS-SETS', subcategory_name: 'Clothing Sets', display_order: 6 },
      { subcategory_code: 'KIDS-SHORTS', subcategory_name: 'Shorts', display_order: 7 },
      { subcategory_code: 'KIDS-NIGHTWEAR', subcategory_name: 'Nightwear', display_order: 8 },
      { subcategory_code: 'KIDS-ETHNIC', subcategory_name: 'Ethnic Wear', display_order: 9 },
    ],
  },
  {
    category_code: 'BOYS-WEAR',
    category_name: 'Boys Wear',
    display_order: 4,
    is_active: true,
    image_file: 'Trendy Boys’ Fashion Lineup.png',
    image_url: '/uploads/categories/boys-wear/trendy-boys-fashion-lineup.png',
    image_key: 'categories/boys-wear/trendy-boys-fashion-lineup.png',
    subcategories: [
      { subcategory_code: 'BOYS-TSHIRTS', subcategory_name: 'T-Shirts', display_order: 1 },
      { subcategory_code: 'BOYS-SHIRTS', subcategory_name: 'Shirts', display_order: 2 },
      { subcategory_code: 'BOYS-PANTS', subcategory_name: 'Pants', display_order: 3 },
      { subcategory_code: 'BOYS-JEANS', subcategory_name: 'Jeans', display_order: 4 },
      { subcategory_code: 'BOYS-SHORTS', subcategory_name: 'Shorts', display_order: 5 },
      { subcategory_code: 'BOYS-ETHNIC', subcategory_name: 'Ethnic Wear', display_order: 6 },
    ],
  },
  {
    category_code: 'GIRLS-WEAR',
    category_name: 'Girls Wear',
    display_order: 5,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'GIRLS-TOPS', subcategory_name: 'Tops', display_order: 1 },
      { subcategory_code: 'GIRLS-DRESSES', subcategory_name: 'Dresses', display_order: 2 },
      { subcategory_code: 'GIRLS-FROCKS', subcategory_name: 'Frocks', display_order: 3 },
      { subcategory_code: 'GIRLS-LEGGINGS', subcategory_name: 'Leggings', display_order: 4 },
      { subcategory_code: 'GIRLS-SKIRTS', subcategory_name: 'Skirts', display_order: 5 },
      { subcategory_code: 'GIRLS-ETHNIC', subcategory_name: 'Ethnic Wear', display_order: 6 },
    ],
  },
  {
    category_code: 'ETHNIC-WEAR',
    category_name: 'Ethnic Wear',
    display_order: 6,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'ETHNIC-KURTA', subcategory_name: 'Kurta Sets', display_order: 1 },
      { subcategory_code: 'ETHNIC-SHERWANI', subcategory_name: 'Sherwanis', display_order: 2 },
      { subcategory_code: 'ETHNIC-CHURIDAR', subcategory_name: 'Churidars', display_order: 3 },
      { subcategory_code: 'ETHNIC-DHOTI', subcategory_name: 'Dhotis', display_order: 4 },
      { subcategory_code: 'ETHNIC-NEHRU', subcategory_name: 'Nehru Jackets', display_order: 5 },
      { subcategory_code: 'ETHNIC-LEHENGA', subcategory_name: 'Lehengas', display_order: 6 },
    ],
  },
  {
    category_code: 'WESTERN-WEAR',
    category_name: 'Western Wear',
    display_order: 7,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'WESTERN-TOPS', subcategory_name: 'Tops', display_order: 1 },
      { subcategory_code: 'WESTERN-DRESSES', subcategory_name: 'Dresses', display_order: 2 },
      { subcategory_code: 'WESTERN-JUMPSUITS', subcategory_name: 'Jumpsuits', display_order: 3 },
      { subcategory_code: 'WESTERN-JEANS', subcategory_name: 'Jeans', display_order: 4 },
      { subcategory_code: 'WESTERN-SKIRTS', subcategory_name: 'Skirts', display_order: 5 },
      { subcategory_code: 'WESTERN-SHIRTS', subcategory_name: 'Shirts', display_order: 6 },
    ],
  },
  {
    category_code: 'INNERWEAR',
    category_name: 'Innerwear',
    display_order: 8,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'INNER-BRIEFS', subcategory_name: 'Briefs', display_order: 1 },
      { subcategory_code: 'INNER-VESTS', subcategory_name: 'Vests', display_order: 2 },
      { subcategory_code: 'INNER-BRAS', subcategory_name: 'Bras', display_order: 3 },
      { subcategory_code: 'INNER-PANTIES', subcategory_name: 'Panties', display_order: 4 },
      { subcategory_code: 'INNER-THERMALS', subcategory_name: 'Thermals', display_order: 5 },
    ],
  },
  {
    category_code: 'NIGHTWEAR',
    category_name: 'Nightwear',
    display_order: 9,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'NIGHT-PYJAMAS', subcategory_name: 'Pyjama Sets', display_order: 1 },
      { subcategory_code: 'NIGHT-NIGHTIES', subcategory_name: 'Nighties', display_order: 2 },
      { subcategory_code: 'NIGHT-ROBES', subcategory_name: 'Bathrobes', display_order: 3 },
      { subcategory_code: 'NIGHT-SLEEPWEAR', subcategory_name: 'Sleepwear Sets', display_order: 4 },
    ],
  },
  {
    category_code: 'SPORTSWEAR',
    category_name: 'Sportswear',
    display_order: 10,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'SPORTS-TRACKSUITS', subcategory_name: 'Tracksuits', display_order: 1 },
      { subcategory_code: 'SPORTS-TRACKPANTS', subcategory_name: 'Track Pants', display_order: 2 },
      { subcategory_code: 'SPORTS-TEES', subcategory_name: 'Sports T-Shirts', display_order: 3 },
      { subcategory_code: 'SPORTS-SHORTS', subcategory_name: 'Sports Shorts', display_order: 4 },
      { subcategory_code: 'SPORTS-LEGGINGS', subcategory_name: 'Sports Leggings', display_order: 5 },
    ],
  },
  {
    category_code: 'WINTER-WEAR',
    category_name: 'Winter Wear',
    display_order: 11,
    is_active: true,
    image_file: 'Winter Wardrobe Collection.png',
    image_url: '/uploads/categories/winter-wear/winter-wardrobe-collection.png',
    image_key: 'categories/winter-wear/winter-wardrobe-collection.png',
    subcategories: [
      { subcategory_code: 'WINTER-JACKETS', subcategory_name: 'Jackets', display_order: 1 },
      { subcategory_code: 'WINTER-SWEATERS', subcategory_name: 'Sweaters', display_order: 2 },
      { subcategory_code: 'WINTER-HOODIES', subcategory_name: 'Hoodies', display_order: 3 },
      { subcategory_code: 'WINTER-SWEATSHIRTS', subcategory_name: 'Sweatshirts', display_order: 4 },
    ],
  },
  {
    category_code: 'SAREES',
    category_name: 'Sarees',
    display_order: 12,
    is_active: true,
    image_file: 'Vibrant Silk Sarees Display.png',
    image_url: '/uploads/categories/sarees/vibrant-silk-sarees-display.png',
    image_key: 'categories/sarees/vibrant-silk-sarees-display.png',
    subcategories: [
      { subcategory_code: 'SAREE-COTTON', subcategory_name: 'Cotton Sarees', display_order: 1 },
      { subcategory_code: 'SAREE-SILK', subcategory_name: 'Silk Sarees', display_order: 2 },
      { subcategory_code: 'SAREE-KANJEEVARAM', subcategory_name: 'Kanjeevaram Sarees', display_order: 3 },
      { subcategory_code: 'SAREE-CHIFFON', subcategory_name: 'Chiffon Sarees', display_order: 4 },
      { subcategory_code: 'SAREE-GEORGETTE', subcategory_name: 'Georgette Sarees', display_order: 5 },
      { subcategory_code: 'SAREE-FANCY', subcategory_name: 'Fancy Sarees', display_order: 6 },
      { subcategory_code: 'SAREE-DAILY', subcategory_name: 'Daily Wear Sarees', display_order: 7 },
      { subcategory_code: 'SAREE-PARTY', subcategory_name: 'Party Wear Sarees', display_order: 8 },
    ],
  },
  {
    category_code: 'DUPATTAS',
    category_name: 'Dupattas',
    display_order: 13,
    is_active: true,
    image_file: 'Embroidered Magenta Gold Dupatta.png',
    image_url: '/uploads/categories/dupattas/embroidered-magenta-gold-dupatta.png',
    image_key: 'categories/dupattas/embroidered-magenta-gold-dupatta.png',
    subcategories: [
      { subcategory_code: 'DUPATTA-COTTON', subcategory_name: 'Cotton Dupattas', display_order: 1 },
      { subcategory_code: 'DUPATTA-SILK', subcategory_name: 'Silk Dupattas', display_order: 2 },
      { subcategory_code: 'DUPATTA-CHIFFON', subcategory_name: 'Chiffon Dupattas', display_order: 3 },
      { subcategory_code: 'DUPATTA-EMBROIDERED', subcategory_name: 'Embroidered Dupattas', display_order: 4 },
    ],
  },
  {
    category_code: 'DRESS-MATERIALS',
    category_name: 'Dress Materials',
    display_order: 14,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'MATERIAL-COTTON', subcategory_name: 'Cotton Materials', display_order: 1 },
      { subcategory_code: 'MATERIAL-SILK', subcategory_name: 'Silk Materials', display_order: 2 },
      { subcategory_code: 'MATERIAL-CHURIDAR', subcategory_name: 'Churidar Materials', display_order: 3 },
      { subcategory_code: 'MATERIAL-UNSTITCHED', subcategory_name: 'Unstitched Sets', display_order: 4 },
    ],
  },
  {
    category_code: 'FABRICS',
    category_name: 'Fabrics',
    display_order: 15,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'FABRIC-COTTON', subcategory_name: 'Cotton Fabric', display_order: 1 },
      { subcategory_code: 'FABRIC-SILK', subcategory_name: 'Silk Fabric', display_order: 2 },
      { subcategory_code: 'FABRIC-LINEN', subcategory_name: 'Linen Fabric', display_order: 3 },
      { subcategory_code: 'FABRIC-POLYESTER', subcategory_name: 'Polyester Fabric', display_order: 4 },
    ],
  },
  {
    category_code: 'FOOTWEAR',
    category_name: 'Footwear',
    display_order: 16,
    is_active: true,
    image_file: 'Men’s and Women’s Footwear Collection.png',
    image_url: '/uploads/categories/footwear/mens-and-womens-footwear-collection.png',
    image_key: 'categories/footwear/mens-and-womens-footwear-collection.png',
    subcategories: [
      { subcategory_code: 'SHOES', subcategory_name: 'Shoes', display_order: 1 },
      { subcategory_code: 'SANDALS', subcategory_name: 'Sandals', display_order: 2 },
      { subcategory_code: 'SLIPPERS', subcategory_name: 'Slippers', display_order: 3 },
      { subcategory_code: 'HEELS', subcategory_name: 'Heels', display_order: 4 },
      { subcategory_code: 'SPORTS-SHOES', subcategory_name: 'Sports Shoes', display_order: 5 },
    ],
  },
  {
    category_code: 'BAGS',
    category_name: 'Bags',
    display_order: 17,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'BAGS-HANDBAGS', subcategory_name: 'Handbags', display_order: 1 },
      { subcategory_code: 'BAGS-SCHOOL', subcategory_name: 'School Bags', display_order: 2 },
      { subcategory_code: 'BAGS-BACKPACKS', subcategory_name: 'Backpacks', display_order: 3 },
      { subcategory_code: 'BAGS-TRAVEL', subcategory_name: 'Travel Bags', display_order: 4 },
      { subcategory_code: 'BAGS-WALLETS', subcategory_name: 'Wallets', display_order: 5 },
    ],
  },
  {
    category_code: 'ACCESSORIES',
    category_name: 'Accessories',
    display_order: 18,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'ACC-SCARVES', subcategory_name: 'Scarves', display_order: 1 },
      { subcategory_code: 'ACC-HANDKERCHIEFS', subcategory_name: 'Handkerchiefs', display_order: 2 },
      { subcategory_code: 'ACC-HAIR', subcategory_name: 'Hair Accessories', display_order: 3 },
      { subcategory_code: 'ACC-SUNGLASSES', subcategory_name: 'Sunglasses', display_order: 4 },
      { subcategory_code: 'ACC-WATCHES', subcategory_name: 'Watches', display_order: 5 },
    ],
  },
  {
    category_code: 'JEWELLERY',
    category_name: 'Jewellery',
    display_order: 19,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'JEW-EARRINGS', subcategory_name: 'Earrings', display_order: 1 },
      { subcategory_code: 'JEW-NECKLACES', subcategory_name: 'Necklaces', display_order: 2 },
      { subcategory_code: 'JEW-BANGLES', subcategory_name: 'Bangles', display_order: 3 },
      { subcategory_code: 'JEW-BRACELETS', subcategory_name: 'Bracelets', display_order: 4 },
      { subcategory_code: 'JEW-CHAINS', subcategory_name: 'Chains', display_order: 5 },
    ],
  },
  {
    category_code: 'BELTS',
    category_name: 'Belts',
    display_order: 20,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'BELT-LEATHER', subcategory_name: 'Leather Belts', display_order: 1 },
      { subcategory_code: 'BELT-CASUAL', subcategory_name: 'Casual Belts', display_order: 2 },
      { subcategory_code: 'BELT-FORMAL', subcategory_name: 'Formal Belts', display_order: 3 },
    ],
  },
  {
    category_code: 'SOCKS',
    category_name: 'Socks',
    display_order: 21,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'SOCKS-ANKLE', subcategory_name: 'Ankle Socks', display_order: 1 },
      { subcategory_code: 'SOCKS-CREW', subcategory_name: 'Crew Socks', display_order: 2 },
      { subcategory_code: 'SOCKS-KIDS', subcategory_name: 'Kids Socks', display_order: 3 },
    ],
  },
  {
    category_code: 'CAPS',
    category_name: 'Caps and Hats',
    display_order: 22,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'CAPS-BASEBALL', subcategory_name: 'Baseball Caps', display_order: 1 },
      { subcategory_code: 'CAPS-SUN', subcategory_name: 'Sun Hats', display_order: 2 },
      { subcategory_code: 'CAPS-KIDS', subcategory_name: 'Kids Caps', display_order: 3 },
    ],
  },
  {
    category_code: 'UNIFORMS',
    category_name: 'Uniforms',
    display_order: 23,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'UNIFORM-SCHOOL', subcategory_name: 'School Uniforms', display_order: 1 },
      { subcategory_code: 'UNIFORM-SHIRT', subcategory_name: 'Uniform Shirts', display_order: 2 },
      { subcategory_code: 'UNIFORM-PANTS', subcategory_name: 'Uniform Pants', display_order: 3 },
      { subcategory_code: 'UNIFORM-SPORTS', subcategory_name: 'Sports Uniforms', display_order: 4 },
    ],
  },
  {
    category_code: 'MATERNITY',
    category_name: 'Maternity Wear',
    display_order: 24,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'MATERNITY-DRESSES', subcategory_name: 'Maternity Dresses', display_order: 1 },
      { subcategory_code: 'MATERNITY-TOPS', subcategory_name: 'Maternity Tops', display_order: 2 },
      { subcategory_code: 'MATERNITY-BOTTOMS', subcategory_name: 'Maternity Bottoms', display_order: 3 },
    ],
  },
  {
    category_code: 'OTHER',
    category_name: 'Other Products',
    display_order: 25,
    is_active: true,
    image_file: null,
    image_url: null,
    image_key: null,
    subcategories: [
      { subcategory_code: 'OTHER-FASHION', subcategory_name: 'Other Fashion Products', display_order: 1 },
    ],
  },
];

/**
 * Ensures category images from seed image repository exist physically in src/uploads/categories/<slug>/
 * Copies source images to static upload directories with canonical and descriptive filenames.
 *
 * @returns {Promise<{ imagesCopied: number, uploadsDir: string }>}
 */
export const ensureCategoryImagesOnDisk = async () => {
  if (!fs.existsSync(uploadsCategoriesDir)) {
    fs.mkdirSync(uploadsCategoriesDir, { recursive: true });
  }

  let imagesCopied = 0;

  for (const cat of REALISTIC_CATEGORIES) {
    if (!cat.image_file) continue;

    const sourcePath = path.join(sourceCategoryImagesDir, cat.image_file);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`  ⚠️ Seed image file not found on disk: "${cat.image_file}" at ${sourcePath}`);
      continue;
    }

    const slug = cat.category_code.toLowerCase();
    const targetDir = path.join(uploadsCategoriesDir, slug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. Canonical slug file: e.g. mens-wear.png
    const canonicalFileName = `${slug}.png`;
    const canonicalDestPath = path.join(targetDir, canonicalFileName);

    // 2. Descriptive filename matching image_url: e.g. five-stylish-menswear-models-isolated.png
    const descriptiveFileName = cat.image_url ? path.basename(cat.image_url) : canonicalFileName;
    const descriptiveDestPath = path.join(targetDir, descriptiveFileName);

    // 3. Exact original source filename
    const originalDestPath = path.join(targetDir, cat.image_file);

    try {
      await fs.promises.copyFile(sourcePath, canonicalDestPath);
      if (descriptiveDestPath !== canonicalDestPath) {
        await fs.promises.copyFile(sourcePath, descriptiveDestPath);
      }
      if (originalDestPath !== canonicalDestPath && originalDestPath !== descriptiveDestPath) {
        await fs.promises.copyFile(sourcePath, originalDestPath);
      }
      imagesCopied++;
    } catch (err) {
      console.error(`  ❌ Failed to copy category image for ${cat.category_code}:`, err.message);
    }
  }

  return {
    imagesCopied,
    uploadsDir: uploadsCategoriesDir,
  };
};

/**
 * Seed realistic categories and child subcategories idempotently across ALL existing companies (or a specified company)
 *
 * @param {Object} [options]
 * @param {number|string|null} [options.companyId] - Specific company ID (if null/omitted, seeds for ALL existing companies)
 * @param {string|null} [options.companyName] - Optional company name filter (if provided, limits to matching company)
 * @param {boolean} [options.allCompanies=false] - Explicit flag to seed for all companies
 * @param {Object|null} [options.pool] - Optional database pool instance (for dependency injection/testing)
 * @returns {Promise<{
 *   totalCompanies: number,
 *   totalCategoriesSeeded: number,
 *   totalSubcategoriesSeeded: number,
 *   totalImagesSeeded: number,
 *   companies: Array<{
 *     companyId: number,
 *     companyName: string,
 *     companyCode: string,
 *     categoriesCount: number,
 *     subcategoriesCount: number,
 *     categories: Array
 *   }>,
 *   companyId: number|null,
 *   categoriesCount: number,
 *   subcategoriesCount: number,
 *   categories: Array
 * }>}
 */
export const seedCategories = async ({
  companyId = null,
  companyName = null,
  allCompanies = false,
  pool: customPool = null,
} = {}) => {
  const pool = customPool || getDatabasePool();

  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  // Ensure physical assets exist in uploads directory before database writes
  const { imagesCopied } = await ensureCategoryImagesOnDisk();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Resolve Target Companies:
    let targetCompanies = [];

    if (companyId && companyId !== 'all') {
      const companyRes = await client.query(
        `SELECT id, company_name, company_code FROM companies WHERE id = $1`,
        [Number(companyId)]
      );
      if (companyRes.rows.length === 0) {
        throw new Error(`Company with ID ${companyId} not found in database.`);
      }
      targetCompanies = companyRes.rows;
    } else if (companyName && companyName !== 'all') {
      const companyRes = await client.query(
        `SELECT id, company_name, company_code FROM companies 
         WHERE company_name ILIKE $1 OR company_code = $2 
         ORDER BY id ASC`,
        [`%${companyName}%`, companyName]
      );
      if (companyRes.rows.length === 0) {
        throw new Error(`Company "${companyName}" not found in database.`);
      }
      targetCompanies = companyRes.rows;
    } else {
      const allCompaniesRes = await client.query(
        `SELECT id, company_name, company_code FROM companies ORDER BY id ASC`
      );
      targetCompanies = allCompaniesRes.rows;
    }

    if (targetCompanies.length === 0) {
      throw new Error('No existing companies found in database to seed categories for.');
    }

    console.log(
      `⏳ Starting Categories & Subcategories Seeding across ${targetCompanies.length} existing company/companies (Physical Images: ${imagesCopied})...`
    );

    const upsertCategoryQuery = `
      INSERT INTO categories (
        company_id,
        category_code,
        category_name,
        description,
        image_url,
        image_key,
        display_order,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (company_id, LOWER(category_code))
      DO UPDATE SET
        category_name = EXCLUDED.category_name,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        image_key = EXCLUDED.image_key,
        display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, company_id, category_code, category_name, image_url, image_key, display_order, is_active;
    `;

    const upsertSubcategoryQuery = `
      INSERT INTO subcategories (
        company_id,
        category_id,
        subcategory_code,
        subcategory_name,
        description,
        display_order,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (company_id, LOWER(subcategory_code))
      DO UPDATE SET
        category_id = EXCLUDED.category_id,
        subcategory_name = EXCLUDED.subcategory_name,
        description = EXCLUDED.description,
        display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, company_id, category_id, subcategory_code, subcategory_name, display_order, is_active;
    `;

    let totalCategoriesSeeded = 0;
    let totalSubcategoriesSeeded = 0;
    let totalImagesSeeded = 0;
    const companyResults = [];

    // Loop through every existing company in the database
    for (const company of targetCompanies) {
      const cId = Number(company.id);
      const cName = company.company_name;
      const cCode = company.company_code || `CMP-${cId}`;

      console.log(`\n🏢 [COMPANY ID ${cId}] ${cName} (${cCode})`);

      let companyCategoriesCount = 0;
      let companySubcategoriesCount = 0;
      const processedCategories = [];

      for (const catData of REALISTIC_CATEGORIES) {
        const catRes = await client.query(upsertCategoryQuery, [
          cId,
          catData.category_code,
          catData.category_name,
          catData.description || `${catData.category_name} category`,
          catData.image_url || null,
          catData.image_key || null,
          catData.display_order ?? 0,
          catData.is_active !== undefined ? catData.is_active : true,
        ]);

        const category = catRes.rows[0];
        companyCategoriesCount++;
        totalCategoriesSeeded++;
        if (category.image_url) {
          totalImagesSeeded++;
        }

        const processedSubcategories = [];

        for (const subData of catData.subcategories || []) {
          const subRes = await client.query(upsertSubcategoryQuery, [
            cId,
            category.id,
            subData.subcategory_code,
            subData.subcategory_name,
            subData.description || `${subData.subcategory_name} in ${catData.category_name}`,
            subData.display_order ?? 0,
            subData.is_active !== undefined ? subData.is_active : true,
          ]);

          const subcategory = subRes.rows[0];
          companySubcategoriesCount++;
          totalSubcategoriesSeeded++;
          processedSubcategories.push(subcategory);
        }

        console.log(
          `  ✓ Category [ID ${category.id}] [${category.category_code}] "${category.category_name}" ${
            category.image_url ? `📸 [IMG: ${path.basename(category.image_url)}]` : ''
          } (${processedSubcategories.length} subcategories)`
        );

        processedCategories.push({
          ...category,
          subcategories: processedSubcategories,
        });
      }

      companyResults.push({
        companyId: cId,
        companyName: cName,
        companyCode: cCode,
        categoriesCount: companyCategoriesCount,
        subcategoriesCount: companySubcategoriesCount,
        categories: processedCategories,
      });

      console.log(
        `  ✅ Company [ID ${cId}] "${cName}" complete: ${companyCategoriesCount} categories, ${companySubcategoriesCount} subcategories seeded.`
      );
    }

    await client.query('COMMIT');

    console.log(
      `\n🎉 [SEEDER:CATEGORIES] Seeding Completed! (${totalCategoriesSeeded} categories, ${totalSubcategoriesSeeded} subcategories, ${totalImagesSeeded} category images seeded across ${targetCompanies.length} company/companies)`
    );

    return {
      totalCompanies: targetCompanies.length,
      totalCategoriesSeeded,
      totalSubcategoriesSeeded,
      totalImagesSeeded,
      companies: companyResults,

      // Compatibility fields for single-company callers
      companyId: targetCompanies[0]?.id ? Number(targetCompanies[0].id) : null,
      categoriesCount: totalCategoriesSeeded,
      subcategoriesCount: totalSubcategoriesSeeded,
      categories: companyResults[0]?.categories || [],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding categories and subcategories:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Enable standalone CLI execution
if (process.argv[1] && process.argv[1].endsWith('category.seeder.js')) {
  import('dotenv').then((dotenv) => {
    dotenv.config();
    import('../connection.js').then(async ({ connectDatabase }) => {
      let pool;
      try {
        pool = await connectDatabase();
        await seedCategories({ pool });
        console.log('\n✅ [SEEDER:CATEGORIES] Standalone category seeding complete.');
        await pool.end();
        process.exit(0);
      } catch (err) {
        console.error('❌ [SEEDER:CATEGORIES] Error:', err);
        if (pool) await pool.end().catch(() => {});
        process.exit(1);
      }
    });
  });
}

export default {
  REALISTIC_CATEGORIES,
  ensureCategoryImagesOnDisk,
  seedCategories,
  seedSubcategories: seedCategories,
};
