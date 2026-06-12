// seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';
import CMS from './src/models/CMS.js';
import Enquiry from './src/models/Enquiry.js';
import Order from './src/models/Order.js';
import Settings from './src/models/Settings.js';
import { UserRoles } from '@open-agri/shared';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/open-agri';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    try {
      await Product.collection.dropIndex('sku_1');
      console.log('Dropped legacy sku_1 index.');
    } catch (e) {
      // Ignore if index does not exist
    }
    await CMS.deleteMany({});
    try {
      await CMS.collection.dropIndex('page_1');
      console.log('Dropped legacy page_1 index.');
    } catch (e) {
      // Ignore if index does not exist
    }
    await Enquiry.deleteMany({});
    await Order.deleteMany({});
    await Settings.deleteMany({});
    console.log('Collections cleared.');

    // 1. Create Admin User
    console.log('Seeding Admin User...');
    const adminUser = await User.create({
      name: 'Admin Farmer',
      email: 'admin@openagri.com',
      password: 'password123', // Will be hashed automatically by pre-save hook
      role: UserRoles.ADMIN,
      phone: '9876543210',
      address: {
        line1: '123 Agrotech Lane',
        line2: 'Sector 5',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        country: 'India'
      }
    });
    console.log('Admin user seeded: admin@openagri.com / password123');

    // Create a regular customer for orders/enquiries
    const customerUser = await User.create({
      name: 'Ramesh Patel',
      email: 'ramesh@patelfarms.com',
      password: 'password123',
      role: UserRoles.CUSTOMER,
      phone: '9812345678',
      address: {
        line1: 'Farmhouse 4B',
        line2: 'Ganga Canal Road',
        city: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
        country: 'India'
      }
    });

    // 2. Create Categories
    console.log('Seeding Categories...');
    const categoriesData = [
      {
        name: 'Seeds',
        slug: 'seeds',
        description: 'Certified, high-yield vegetable, flower, and crop seeds.',
        image: { url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=800' },
        displayOrder: 1
      },
      {
        name: 'Fertilizers & Pesticides',
        slug: 'fertilizers-pesticides',
        description: 'Chemical and organic soil nutrients and crop protection solutions.',
        image: { url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=800' },
        displayOrder: 2
      },
      {
        name: 'Farm Tools',
        slug: 'farm-tools',
        description: 'Hand tools, automated equipment, and irrigation kits.',
        image: { url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800' },
        displayOrder: 3
      },
      {
        name: 'Fresh Vegetables',
        slug: 'fresh-vegetables',
        description: 'Crisp, organic vegetables sourced daily from local fields.',
        image: { url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800' },
        displayOrder: 4
      },
      {
        name: 'Seasonal Fruits',
        slug: 'seasonal-fruits',
        description: 'Delicious, hand-picked seasonal fruits at peak sweetness.',
        image: { url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=800' },
        displayOrder: 5
      },
      {
        name: 'Organic Grains',
        slug: 'organic-grains',
        description: 'High-quality pulses, rice, wheat, and millets.',
        image: { url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800' },
        displayOrder: 6
      },
      {
        name: 'Dairy & Eggs',
        slug: 'dairy-eggs',
        description: 'Pure, bilona-churned ghee, fresh paneer, and organic farm eggs.',
        image: { url: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?q=80&w=800' },
        displayOrder: 7
      },
      {
        name: 'Herbs & Spices',
        slug: 'herbs-spices',
        description: 'Freshly cut herbs and organic whole or powdered spices.',
        image: { url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800' },
        displayOrder: 8
      }
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`${categories.length} categories seeded.`);

    const catSeeds = categories.find(c => c.slug === 'seeds')._id;
    const catFert = categories.find(c => c.slug === 'fertilizers-pesticides')._id;
    const catTools = categories.find(c => c.slug === 'farm-tools')._id;
    const catVeg = categories.find(c => c.slug === 'fresh-vegetables')._id;
    const catFruit = categories.find(c => c.slug === 'seasonal-fruits')._id;
    const catGrains = categories.find(c => c.slug === 'organic-grains')._id;
    const catDairy = categories.find(c => c.slug === 'dairy-eggs')._id;
    const catHerbs = categories.find(c => c.slug === 'herbs-spices')._id;

    // 3. Create Products (37 items across 8 categories)
    console.log('Seeding Products...');
    const productsData = [
      // Seeds (4 items)
      {
        name: 'F1 Hybrid Tomato Seeds',
        category: catSeeds,
        images: [{ url: '/uploads/hybrid_tomato_seeds.png', isPrimary: true, altText: 'Hybrid Tomato Seeds' }],
        description: 'Premium disease-resistant high-yield hybrid tomato seeds. Ideal for greenhouse and open-field cultivation.',
        specifications: { purity: '99%', germinationRate: '92%', packageSize: '1000 seeds' },
        retailPrice: 15,
        discountPrice: 12,
        stock: 500,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true,
        minimumOrderQuantity: 10,
        unit: 'packs',
        wholesalePricing: [{ minQuantity: 10, pricePerUnit: 12 }, { minQuantity: 50, pricePerUnit: 10 }]
      },
      {
        name: 'Sweet Corn F1 Seeds',
        category: catSeeds,
        images: [{ url: '/uploads/sweet_corn_seeds.png', isPrimary: true, altText: 'Sweet Corn Seeds' }],
        description: 'Very sweet yellow kernel variety with excellent seedling vigor and high disease tolerance.',
        specifications: { sugarContent: 'High', maturityPeriod: '75-80 days', weight: '500g' },
        retailPrice: 24,
        discountPrice: 19,
        stock: 300,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Premium Chilli F1 Seeds',
        category: catSeeds,
        images: [{ url: '/uploads/premium_chilli_seeds.png', isPrimary: true, altText: 'Premium Chilli F1 Seeds' }],
        description: 'High pungency hybrid chilli seeds. Highly resistant to leaf curl virus and root wilt diseases.',
        specifications: { purity: '98%', germinationRate: '90%', packageSize: '500 seeds' },
        retailPrice: 20,
        discountPrice: 16,
        stock: 400,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Organic Sunflower Seeds',
        category: catSeeds,
        images: [{ url: '/uploads/sunflower_seeds.png', isPrimary: true, altText: 'Organic Sunflower Seeds' }],
        description: 'Raw oil-rich organic sunflower seeds suitable for sowing or oil extraction processes.',
        specifications: { oilContent: '42%', purity: '99%', packageWeight: '1kg' },
        retailPrice: 45,
        discountPrice: 36,
        stock: 600,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },

      // Fertilizers & Pesticides (5 items)
      {
        name: 'Water-Soluble NPK 19-19-19',
        category: catFert,
        images: [{ url: '/uploads/npk_fertilizer.png', isPrimary: true, altText: 'NPK Fertilizer Bag' }],
        description: 'Balanced fertilizer providing equal nitrogen, phosphorus, and potassium ratios for vegetative growth stages.',
        specifications: { nitrogen: '19%', phosphate: '19%', potash: '19%', solubility: '100%' },
        retailPrice: 42,
        stock: 120,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true
      },
      {
        name: 'Cold-Pressed Neem Oil Pesticide',
        category: catFert,
        images: [{ url: '/uploads/neem_oil.png', isPrimary: true, altText: 'Neem Oil Bottle' }],
        description: '100% natural organic neem oil cold-pressed to retain azadirachtin compound. Controls aphids, whiteflies, and mites.',
        specifications: { type: 'Concentrate', dilutionRatio: '5ml per Liter', volume: '1 Liter' },
        retailPrice: 18,
        stock: 450,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Granular Slow-Release Urea Bags',
        category: catFert,
        images: [{ url: '/uploads/urea_fertilizer.png', isPrimary: true, altText: 'Urea Pellets' }],
        description: '46% Nitrogen slow-release granular fertilizer designed to minimize nitrogen washing and evaporation.',
        specifications: { chemicalFormula: 'CO(NH2)2', nitrogen: '46%', packageWeight: '50kg' },
        retailPrice: 55,
        stock: 1000,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false,
        minimumOrderQuantity: 20,
        unit: 'bags',
        wholesalePricing: [{ minQuantity: 20, pricePerUnit: 48 }, { minQuantity: 100, pricePerUnit: 42 }]
      },
      {
        name: 'Organic Vermicompost Manure',
        category: catFert,
        images: [{ url: '/uploads/vermicompost.png', isPrimary: true, altText: 'Organic Vermicompost Manure' }],
        description: 'Highly rich organic compost produced using earthworms. Aerates soil and boosts crop water retention.',
        specifications: { composition: '100% Organic', packaging: '25kg bag', certifications: 'NPOP Certified' },
        retailPrice: 15,
        stock: 800,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Bio-Organic Phosphate Fertilizer',
        category: catFert,
        images: [{ url: '/uploads/phosphate_fertilizer.png', isPrimary: true, altText: 'Phosphate Fertilizer' }],
        description: 'Provides soluble phosphate nutrients to roots using soil-friendly micro-organisms and rock phosphates.',
        specifications: { phosphateContent: '16%', solubility: '95%', packaging: '50kg bag' },
        retailPrice: 35,
        stock: 600,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },

      // Farm Tools (5 items)
      {
        name: 'Hand Cultivator Garden Rake',
        category: catTools,
        images: [{ url: '/uploads/hand_cultivator.png', isPrimary: true, altText: 'Hand Cultivator' }],
        description: 'Rust-resistant carbon steel hand cultivator with an ergonomic wooden handle for weeding and aerating soil.',
        specifications: { material: 'Carbon Steel', handle: 'Ashwood', length: '12 inches' },
        retailPrice: 12,
        stock: 150,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Ergonomic D-Handle Shovel',
        category: catTools,
        images: [{ url: '/uploads/d_handle_shovel.png', isPrimary: true, altText: 'Farming Shovel' }],
        description: 'Heavy-duty steel shovel blade with a lightweight fiberglass shaft and comfortable non-slip D-grip handle.',
        specifications: { bladeType: 'Round point', shaftMaterial: 'Fiberglass', weight: '1.8 kg' },
        retailPrice: 28,
        stock: 90,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true
      },
      {
        name: 'Heavy-Duty Bypass Pruning Shears',
        category: catTools,
        images: [{ url: '/uploads/pruning_shears.png', isPrimary: true, altText: 'Pruning Shears' }],
        description: 'Ultra-sharp SK5 steel blades for smooth branch pruning. Safely cuts branches up to 20mm thick.',
        specifications: { bladeMaterial: 'SK5 Hardened Steel', cuttingCapacity: '20mm', length: '8.5 inches' },
        retailPrice: 22,
        stock: 200,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Automatic Drip Irrigation Kit',
        category: catTools,
        images: [{ url: '/uploads/drip_irrigation.png', isPrimary: true, altText: 'Drip Irrigation Kit' }],
        description: 'Complete water-saving micro-irrigation layout. Includes 50m pipe, drippers, connectors, and filters.',
        specifications: { coverageArea: 'Up to 500 sq ft', tubeLength: '50 Meters', dripperFlowRate: '4L/hour' },
        retailPrice: 1200,
        stock: 50,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Stainless Steel Garden Trowel',
        category: catTools,
        images: [{ url: '/uploads/garden_trowel.png', isPrimary: true, altText: 'Garden Trowel' }],
        description: 'Polished stainless steel trowel with depth markings. Ideal for transplanting seedlings.',
        specifications: { material: 'Stainless Steel', handle: 'Rubber gripized wood', length: '13 inches' },
        retailPrice: 8,
        stock: 300,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },

      // Fresh Vegetables (5 items)
      {
        name: 'Heritage Tomatoes',
        category: catVeg,
        images: [{ url: '/uploads/heritage_tomatoes.png', isPrimary: true, altText: 'Heritage Tomatoes' }],
        description: 'Sun-ripened heirloom variety, hand-picked daily at peak sweetness. Directly from Pune fields.',
        specifications: { origin: 'Pune, Maharashtra', variety: 'Heirloom', organic: 'Yes' },
        retailPrice: 89,
        stock: 400,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true,
        minimumOrderQuantity: 10,
        unit: 'kg',
        wholesalePricing: [{ minQuantity: 10, pricePerUnit: 75 }, { minQuantity: 50, pricePerUnit: 65 }]
      },
      {
        name: 'Red Onion Bulk Pack',
        category: catVeg,
        images: [{ url: '/uploads/red_onions.png', isPrimary: true, altText: 'Red Onions' }],
        description: 'Export-grade red onion, sorted and washed. Sourced directly from Nashik growers.',
        specifications: { origin: 'Nashik, Maharashtra', packageSize: '10kg bag', quality: 'Grade A' },
        retailPrice: 28,
        stock: 2000,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true,
        minimumOrderQuantity: 5,
        unit: 'kg',
        wholesalePricing: [{ minQuantity: 5, pricePerUnit: 22 }, { minQuantity: 20, pricePerUnit: 18 }]
      },
      {
        name: 'Organic Green Broccoli',
        category: catVeg,
        images: [{ url: '/uploads/green_broccoli.png', isPrimary: true, altText: 'Green Broccoli' }],
        description: 'Fresh organic broccoli florets. Extremely crisp, harvested from organic farms under shade-nets.',
        specifications: { origin: 'Mahabaleshwar, Maharashtra', certification: 'APEDA Certified', packaging: 'Crated' },
        retailPrice: 120,
        stock: 350,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Fresh Baby Spinach Bunch',
        category: catVeg,
        images: [{ url: '/uploads/baby_spinach.png', isPrimary: true, altText: 'Baby Spinach' }],
        description: 'Tender baby spinach bunch washed with ozonated water. Packed fresh with root systems intact.',
        specifications: { origin: 'Pune, Maharashtra', weight: '250g per bunch', shelfLife: '3 days' },
        retailPrice: 40,
        stock: 150,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Fresh Orange Carrots',
        category: catVeg,
        images: [{ url: '/uploads/orange_carrots.png', isPrimary: true, altText: 'Fresh Carrots' }],
        description: 'Sweet, crisp orange carrots. Ideal for salads, juices, or traditional cooking styles.',
        specifications: { origin: 'Ooty, Tamil Nadu', size: '12-18cm length', organicStatus: 'In-conversion organic' },
        retailPrice: 45,
        stock: 600,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },

      // Seasonal Fruits (4 items)
      {
        name: 'Alphonso Mangoes',
        category: catFruit,
        images: [{ url: '/uploads/alphonso_mangoes.png', isPrimary: true, altText: 'Alphonso Mangoes' }],
        description: 'Certified GI-tagged Alphonso mangoes from Devgad. Rich aroma, golden pulp, and zero fiber.',
        specifications: { origin: 'Devgad, Maharashtra', size: 'Medium', certification: 'GI Tagged' },
        retailPrice: 420,
        stock: 300,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true,
        minimumOrderQuantity: 2,
        unit: 'dozen',
        wholesalePricing: [{ minQuantity: 2, pricePerUnit: 380 }, { minQuantity: 10, pricePerUnit: 350 }]
      },
      {
        name: 'Fresh Sweet Lemon (Mosambi)',
        category: catFruit,
        images: [{ url: '/uploads/sweet_lemon.png', isPrimary: true, altText: 'Mosambi Sweet Lemon' }],
        description: 'Juicy, sweet mosambi citrus fruits sourced directly from Nanded farms. High juice extraction yield.',
        specifications: { origin: 'Nanded, Maharashtra', size: 'Large', skinThickness: 'Thin' },
        retailPrice: 65,
        stock: 500,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Organic Ripe Papaya',
        category: catFruit,
        images: [{ url: '/uploads/organic_papaya.png', isPrimary: true, altText: 'Ripe Papaya' }],
        description: 'Sweet, orange-fleshed organic papaya, tree-ripened and harvested with caution to prevent bruising.',
        specifications: { variety: 'Red Lady', averageWeight: '1.2kg per fruit', sugarContent: '12% Brix' },
        retailPrice: 50,
        stock: 200,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Fresh Red Apples (Shimla)',
        category: catFruit,
        images: [{ url: '/uploads/red_apples.png', isPrimary: true, altText: 'Shimla Red Apples' }],
        description: 'Crisp and sweet red royal delicious apples harvested from high-altitude orchards in Shimla.',
        specifications: { origin: 'Shimla, Himachal Pradesh', grade: 'Royal A', storageCondition: 'Chilled' },
        retailPrice: 160,
        stock: 450,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },

      // Organic Grains (4 items)
      {
        name: 'Basmati Rice',
        category: catGrains,
        images: [{ url: '/uploads/basmati_rice.png', isPrimary: true, altText: 'Basmati Rice' }],
        description: 'Extra-long slender grain basmati rice, aged 18 months for excellent cooking elongation and aroma.',
        specifications: { origin: 'Karnal, Haryana', age: '18 Months', grainLength: '8.4mm' },
        retailPrice: 145,
        stock: 1500,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true,
        minimumOrderQuantity: 5,
        unit: 'kg',
        wholesalePricing: [{ minQuantity: 5, pricePerUnit: 125 }, { minQuantity: 25, pricePerUnit: 115 }]
      },
      {
        name: 'Organic Wheat Seeds (Kalyansona)',
        category: catGrains,
        images: [{ url: '/uploads/wheat_seeds.png', isPrimary: true, altText: 'Organic Wheat Seeds' }],
        description: 'High protein traditional wheat seeds cultivated without chemical enhancers.',
        specifications: { protein: '13.5%', origin: 'Madhya Pradesh', packageWeight: '25kg' },
        retailPrice: 38,
        stock: 80,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true,
        minimumOrderQuantity: 5,
        unit: 'bags',
        wholesalePricing: [{ minQuantity: 5, pricePerUnit: 32 }, { minQuantity: 20, pricePerUnit: 28 }]
      },
      {
        name: 'Premium Organic Quinoa',
        category: catGrains,
        images: [{ url: '/uploads/organic_quinoa.png', isPrimary: true, altText: 'Organic Quinoa' }],
        description: '100% organic white quinoa grains. Gluten-free grain alternative high in dietary fibers and all 9 amino acids.',
        specifications: { origin: 'Rajasthan, India', purity: '99.8%', packaging: 'Resealable pouch' },
        retailPrice: 199,
        stock: 250,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Whole Grain Brown Lentils',
        category: catGrains,
        images: [{ url: '/uploads/brown_lentils.png', isPrimary: true, altText: 'Brown Lentils' }],
        description: 'Traditional organic brown whole lentils (Sabut Masoor). Unpolished and high in plant-based proteins.',
        specifications: { origin: 'Uttar Pradesh', shelfLife: '12 months', polishStatus: 'Unpolished' },
        retailPrice: 110,
        stock: 500,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },

      // Dairy & Eggs (4 items)
      {
        name: 'A2 Desi Ghee',
        category: catDairy,
        images: [{ url: '/uploads/desi_ghee.png', isPrimary: true, altText: 'Desi Ghee' }],
        description: 'Bilona-churned from A2 milk of indigenous Gir cows. Pure, aromatic, and granular texture.',
        specifications: { origin: 'Pune, Maharashtra', method: 'Bilona Traditional', type: 'A2 Cow Milk' },
        retailPrice: 780,
        stock: 250,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true,
        minimumOrderQuantity: 2,
        unit: '500ml',
        wholesalePricing: [{ minQuantity: 2, pricePerUnit: 720 }, { minQuantity: 10, pricePerUnit: 650 }]
      },
      {
        name: 'Organic Free-Range Eggs',
        category: catDairy,
        images: [{ url: '/uploads/free_range_eggs.png', isPrimary: true, altText: 'Free Range Eggs' }],
        description: 'Brown table eggs sourced from pastured hens fed organic grain feeds. Highly nutritious.',
        specifications: { type: 'Free-range brown', count: '12 eggs per carton', weightClass: 'Large' },
        retailPrice: 95,
        stock: 300,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Fresh Organic Paneer',
        category: catDairy,
        images: [{ url: '/uploads/organic_paneer.png', isPrimary: true, altText: 'Organic Paneer' }],
        description: 'Fresh cottage cheese churned from organic whole cow milk. Extremely soft with no added starches.',
        specifications: { texture: 'Soft', fatContent: '22%', packaging: 'Vacuum packed' },
        retailPrice: 180,
        stock: 150,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Pure Cow Milk Bottle (A2)',
        category: catDairy,
        images: [{ url: '/uploads/cow_milk.png', isPrimary: true, altText: 'Cow Milk Bottle' }],
        description: 'Fresh pasteurized A2 cow milk delivered in sanitized glass bottles. Directly sourced from Gir cow dairies.',
        specifications: { processing: 'Pasteurized', milkType: 'A2 Gir Cow Milk', packaging: '1L Glass Bottle' },
        retailPrice: 80,
        stock: 200,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },

      // Herbs & Spices (6 items)
      {
        name: 'Moringa Leaves',
        category: catHerbs,
        images: [{ url: '/uploads/moringa_leaves.png', isPrimary: true, altText: 'Moringa Leaves' }],
        description: 'Freshly harvested nutrient-rich drumstick/moringa leaves. High in iron, calcium, and antioxidants.',
        specifications: { origin: 'Coimbatore, Tamil Nadu', state: 'Fresh Bunch', quality: 'Organic' },
        retailPrice: 35,
        stock: 120,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: true,
        minimumOrderQuantity: 5,
        unit: 'bunch',
        wholesalePricing: [{ minQuantity: 5, pricePerUnit: 30 }, { minQuantity: 20, pricePerUnit: 25 }]
      },
      {
        name: 'Organic Raw Wildflower Honey',
        category: catHerbs,
        images: [{ url: '/uploads/wildflower_honey.png', isPrimary: true, altText: 'Raw Organic Honey' }],
        description: 'Unpasteurized and unfiltered raw honey harvested from wild forest flora. 100% pure with no added sugars.',
        specifications: { purity: '100% Raw', weight: '500g', certifications: 'FSSAI, USDA Organic' },
        retailPrice: 9,
        stock: 350,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false,
        minimumOrderQuantity: 1,
        unit: '500g',
        wholesalePricing: [{ minQuantity: 10, pricePerUnit: 8 }, { minQuantity: 50, pricePerUnit: 7 }]
      },
      {
        name: 'Cold-Pressed Mustard Oil',
        category: catHerbs,
        images: [{ url: '/uploads/mustard_oil.png', isPrimary: true, altText: 'Mustard Oil Bottle' }],
        description: 'Wood-pressed (Kachi Ghani) pure mustard seed oil. Rich in natural monounsaturated fats.',
        specifications: { extractionMethod: 'Wood pressed', volume: '1 Liter', shelfLife: '12 months' },
        retailPrice: 320,
        stock: 400,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false,
        minimumOrderQuantity: 1,
        unit: '1L',
        wholesalePricing: [{ minQuantity: 10, pricePerUnit: 290 }, { minQuantity: 50, pricePerUnit: 270 }]
      },
      {
        name: 'Pure Stevia Extract Powder',
        category: catHerbs,
        images: [{ url: '/uploads/stevia_powder.png', isPrimary: true, altText: 'Stevia Powder' }],
        description: 'Zero-calorie natural sweetener extracted from stevia rebaudiana leaves. Sugar substitute suitable for keto.',
        specifications: { ingredients: '100% Stevia Extract', weight: '100g', calorieCount: '0 kcal' },
        retailPrice: 14,
        stock: 150,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Green Cardamom (Elaichi)',
        category: catHerbs,
        images: [{ url: '/uploads/green_cardamom.png', isPrimary: true, altText: 'Green Cardamom Spices' }],
        description: 'Premium bold green cardamom pods harvested from Western Ghats. Aromatic grade.',
        specifications: { size: '8mm bold', origin: 'Idukki, Kerala', grade: 'Grade Premium' },
        retailPrice: 950,
        stock: 100,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      },
      {
        name: 'Organic Turmeric Powder',
        category: catHerbs,
        images: [{ url: '/uploads/turmeric_powder.png', isPrimary: true, altText: 'Turmeric Powder' }],
        description: 'Pure organic turmeric powder containing over 4.5% curcumin. Sourced from Salem growers.',
        specifications: { curcumin: '4.7%', origin: 'Salem, Tamil Nadu', packing: '500g pouch' },
        retailPrice: 180,
        stock: 250,
        b2bVisible: true,
        b2cVisible: true,
        status: 'active',
        featured: false
      }
    ];

    const products = await Product.create(productsData);
    console.log(`${products.length} products seeded.`);

    // 4. Create CMS Homepage data
    console.log('Seeding CMS Homepage details...');
    await CMS.create({
      pageType: 'homepage',
      title: 'Agricultural supplies marketplace',
      metaTitle: 'OpenAgri | Seed, Fertilizers & Farming Equipment',
      metaDescription: 'Secure agricultural supplies and organic produce. OpenAgri bridges farmers, B2B wholesale buyers, and retail consumers.',
      heroImage: {
        url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200',
        altText: 'Fields of crops'
      },
      banners: [
        {
          title: 'Monsoon seed discount',
          subtitle: 'Get 20% off all hybrid crop seeds this season.',
          image: { url: '/uploads/hybrid_tomato_seeds.png' },
          link: '/catalog?category=seeds',
          isActive: true
        },
        {
          title: 'Wholesale fertilizer distribution',
          subtitle: 'Exclusive volume pricing for cooperatives.',
          image: { url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=800' },
          link: '/catalog?category=fertilizers',
          isActive: true
        }
      ],
      sections: [
        {
          title: 'Sustainably farmed',
          subtitle: 'Directly sourced from validated farms.',
          content: 'We inspect chemical ratios, soil parameters, and crop storage to ensure only premium supplies enter the market.',
          isVisible: true,
          order: 1
        }
      ],
      testimonials: [
        {
          authorName: 'Suresh Rao',
          authorRole: 'Chairman, Maharashtra Farmers Cooperative',
          rating: 5,
          content: 'Seeding orders directly through OpenAgri saved our coop 15% in middleman commissions.',
          isVisible: true
        }
      ],
      isPublished: true
    });
    console.log('CMS Homepage seeded.');

    await CMS.create({
      pageType: 'about',
      title: 'About Us',
      metaTitle: 'About Us | OpenAgri Marketplace',
      metaDescription: 'OpenAgri bridges farmers, distributors, and consumers with a transparent agricultural marketplace.',
      content: 'OpenAgri was founded with a mission to bring transparency, fair pricing, and direct access to quality agricultural inputs for every farmer in India. We connect seed producers, fertilizer manufacturers, and equipment suppliers directly with buyers — both retail and wholesale.',
      isPublished: true
    });

    await CMS.create({
      pageType: 'contact',
      title: 'Contact Us',
      metaTitle: 'Contact Us | Get in Touch with OpenAgri',
      metaDescription: 'Get in touch with OpenAgri for customer support, B2B wholesale enquiries, or vendor partnerships.',
      content: 'We are here to help you. If you have any inquiries regarding retail orders, bulk sourcing, or seed/fertilizer distribution partnerships, please fill out the form below or contact our headquarters directly.\n\nAddress: 401 Agri Tower, Shivajinagar, Pune, Maharashtra - 411005\nPhone: +91-20-84394022\nEmail: contact@openagri.com',
      isPublished: true
    });

    await CMS.create({
      pageType: 'privacy',
      title: 'Privacy Policy',
      metaTitle: 'Privacy Policy | OpenAgri',
      metaDescription: 'Read the Privacy Policy of OpenAgri to understand how we protect and manage your personal details.',
      content: 'We collect only the information necessary to process your orders and enquiries. Your data is never sold to third parties. We use industry-standard encryption to protect your transaction details and credentials.',
      isPublished: true
    });

    await CMS.create({
      pageType: 'terms',
      title: 'Terms & Conditions',
      metaTitle: 'Terms & Conditions | OpenAgri',
      metaDescription: 'Review the Terms & Conditions governing your use of the OpenAgri agricultural marketplace.',
      content: 'By using OpenAgri, you agree to purchase products only for lawful agricultural purposes. All catalog sales are subject to availability. Reselling wholesale supplies obtained through B2B channels requires appropriate local licenses.',
      isPublished: true
    });

    await CMS.create({
      pageType: 'shipping',
      title: 'Shipping Policy',
      metaTitle: 'Shipping & Delivery Policy | OpenAgri',
      metaDescription: 'Details on shipping costs, delivery times, and logistics for retail and bulk orders.',
      content: 'Retail orders are processed within 24 hours. Orders above the free shipping threshold ship free of cost; otherwise, a flat shipping fee is charged. Standard delivery takes 3–7 business days. Bulk B2B orders are dispatched via partner freight networks and have custom delivery timelines.',
      isPublished: true
    });

    await CMS.create({
      pageType: 'returns',
      title: 'Return & Refund Policy',
      metaTitle: 'Returns & Refunds | OpenAgri',
      metaDescription: 'Learn about our policy on product returns, replacements, and refund timelines.',
      content: 'Perishable agricultural products, opened seed packets, and customized tool kits are non-returnable. Sealed, unopened items can be returned within 7 days of delivery for a full refund or replacement. Refunds are credited back to the original payment source within 5–7 business days.',
      isPublished: true
    });

    await CMS.create({
      pageType: 'faq',
      title: 'Frequently Asked Questions (FAQ)',
      metaTitle: 'FAQs | OpenAgri Support',
      metaDescription: 'Find answers to common questions about shopping, wholesale quotes, products, and shipping.',
      content: '### 1. How do I switch to B2B Wholesale mode?\nYou can use the mode toggle in the navbar to switch between Retail (B2C) and Wholesale (B2B) modes. Wholesale pricing requires logging in with a B2B role account (Farmer, Wholesaler, or Distributor).\n\n### 2. What is the minimum order value for retail orders?\nThe minimum order value is set dynamically by website administrators. If your cart total is below the threshold, checkout will be disabled.\n\n### 3. How do I track my shipment?\nOnce your order is processed and shipped, tracking number and carrier details will be updated by administrators. You can view these details in your orders dashboard.',
      isPublished: true
    });

    await CMS.create({
      pageType: 'policy',
      title: 'Policies Summary',
      metaTitle: 'Policies | OpenAgri',
      metaDescription: 'Read our privacy policy, terms of service, shipping and return policies.',
      content: 'Summary of company policies regarding customer privacy, terms of usage, shipping charges, and returns of agricultural items.',
      isPublished: true
    });

    // 5. Create Sample Enquiry
    console.log('Seeding enquiries...');
    const tomatoSeedProduct = products.find(p => p.name === 'F1 Hybrid Tomato Seeds');
    await Enquiry.create({
      type: 'bulk',
      product: tomatoSeedProduct._id,
      companyName: 'Patel Distribution Ltd',
      contactPerson: 'Ramesh Patel',
      phone: '9812345678',
      email: 'ramesh@patelfarms.com',
      quantity: 50,
      message: 'Looking to purchase 50 packs of tomato seeds. Please share bulk freight shipping terms to Karnal.',
      status: 'pending'
    });
    await Enquiry.create({
      type: 'product',
      product: products.find(p => p.name === 'Cold-Pressed Neem Oil Pesticide')._id,
      contactPerson: 'Suresh Kumar',
      phone: '9876501234',
      email: 'suresh@greenfields.in',
      quantity: 20,
      message: 'Please confirm if this is certified organic and suitable for mango orchards.',
      status: 'reviewed'
    });

    await Enquiry.create({
      type: 'general',
      contactPerson: 'Priya Mehta',
      phone: '9823456701',
      email: 'priya@agriretail.com',
      message: 'We are a retail chain looking to partner with OpenAgri for direct farm-to-store supply. Please share your wholesale catalogue.',
      status: 'pending'
    });

    console.log('Enquiries seeded.');

    // 6. Create Sample Order
    console.log('Seeding Sample Order...');
    const honeyProduct = products.find(p => p.name === 'Organic Raw Wildflower Honey');
    const fertilizerProduct = products.find(p => p.name === 'Water-Soluble NPK 19-19-19');

    await Order.create({
      customer: customerUser._id,
      items: [
        {
          product: honeyProduct._id,
          name: honeyProduct.name,
          image: honeyProduct.images[0].url,
          quantity: 2,
          price: honeyProduct.retailPrice
        },
        {
          product: fertilizerProduct._id,
          name: fertilizerProduct.name,
          image: fertilizerProduct.images[0].url,
          quantity: 1,
          price: fertilizerProduct.retailPrice
        }
      ],
      subtotal: (honeyProduct.retailPrice * 2) + fertilizerProduct.retailPrice,
      discount: 2,
      shippingCost: 10,
      totalAmount: (honeyProduct.retailPrice * 2) + fertilizerProduct.retailPrice - 2 + 10,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'cod',
      shippingAddress: {
        fullName: 'Ramesh Patel',
        phone: '9812345678',
        line1: 'Farmhouse 4B',
        line2: 'Ganga Canal Road',
        city: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
        country: 'India'
      }
    });
    const cornProduct = products.find(p => p.name === 'Sweet Corn F1 Seeds');
    const shovelProduct = products.find(p => p.name === 'Ergonomic D-Handle Shovel');

    await Order.create({
      customer: customerUser._id,
      items: [{ product: cornProduct._id, name: cornProduct.name, image: cornProduct.images[0].url, quantity: 3, price: cornProduct.retailPrice }],
      shippingAddress: { fullName: 'Ramesh Patel', phone: '9812345678', line1: 'Farmhouse 4B', city: 'Karnal', state: 'Haryana', pincode: '132001' },
      paymentMethod: 'cod',
      subtotal: cornProduct.retailPrice * 3,
      shippingCost: 49,
      totalAmount: (cornProduct.retailPrice * 3) + 49,
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    await Order.create({
      customer: customerUser._id,
      items: [{ product: shovelProduct._id, name: shovelProduct.name, image: shovelProduct.images[0].url, quantity: 1, price: shovelProduct.retailPrice }],
      shippingAddress: { fullName: 'Ramesh Patel', phone: '9812345678', line1: 'Farmhouse 4B', city: 'Karnal', state: 'Haryana', pincode: '132001' },
      paymentMethod: 'upi',
      subtotal: shovelProduct.retailPrice,
      shippingCost: 0,
      totalAmount: shovelProduct.retailPrice,
      status: 'delivered',
      paymentStatus: 'paid'
    });

    console.log('Orders seeded.');

    // 7. Create Settings Singleton
    console.log('Seeding Settings singleton...');
    await Settings.create({
      siteName: 'OpenAgri Marketplace',
      defaultMode: 'b2c',
      contactEmail: 'contact@openagri.com',
      supportEmail: 'support@openagri.com',
      phone: '+91-20-84394022',
      address: {
        line1: '401 Agri Tower',
        line2: 'Shivajinagar',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411005',
        country: 'India'
      },
      socialLinks: {
        facebook: 'https://facebook.com/openagri',
        whatsapp: 'https://wa.me/919876543210'
      },
      enquirySettings: {
        enableGeneralEnquiry: true,
        enableBulkRFQ: true,
        alertEmail: 'admin@openagri.com'
      },
      retailOrderSettings: {
        minimumOrderValue: 0,
        shippingCharge: 49,
        freeShippingThreshold: 499
      },
      features: {
        enableB2B: true,
        enableOrders: true,
        enableEnquiries: true,
        maintenanceMode: false
      }
    });
    console.log('Settings seeded.');

    console.log('All agricultural mock data seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
