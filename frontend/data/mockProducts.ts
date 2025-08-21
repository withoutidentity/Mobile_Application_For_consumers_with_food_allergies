import { Product } from '@/types';

const mockProducts: Product[] = [
  {
    id: 'prod001',
    name: 'Chocolate Chip Cookies',
    brand: 'Sweet Treats',
    barcode: '1234567890123',
    ingredients: [
      'Wheat flour', 
      'Sugar', 
      'Butter', 
      'Chocolate chips (cocoa mass, sugar, cocoa butter, soy lecithin)', 
      'Eggs', 
      'Baking soda', 
      'Salt',
      'Natural flavoring'
    ],
    allergenWarnings: ['wheat', 'milk', 'eggs', 'soy'],
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=500'
  },
  {
    id: 'prod002',
    name: 'Roasted Peanuts',
    brand: 'Nutty Delights',
    barcode: '2345678901234',
    ingredients: [
      'Peanuts', 
      'Vegetable oil (peanut)', 
      'Salt'
    ],
    allergenWarnings: ['peanuts'],
    image: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?q=80&w=500'
  },
  {
    id: 'prod003',
    name: 'Vanilla Ice Cream',
    brand: 'Creamy Delights',
    barcode: '3456789012345',
    ingredients: [
      'Cream', 
      'Milk', 
      'Sugar', 
      'Egg yolks', 
      'Vanilla extract'
    ],
    allergenWarnings: ['milk', 'eggs'],
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=500'
  },
  {
    id: 'prod004',
    name: 'Whole Wheat Bread',
    brand: 'Healthy Bakers',
    barcode: '4567890123456',
    ingredients: [
      'Whole wheat flour', 
      'Water', 
      'Yeast', 
      'Salt', 
      'Vegetable oil', 
      'Sugar'
    ],
    allergenWarnings: ['wheat', 'gluten'],
    image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=500'
  },
  {
    id: 'prod005',
    name: 'Shrimp Flavored Chips',
    brand: 'Ocean Snacks',
    barcode: '5678901234567',
    ingredients: [
      'Tapioca starch', 
      'Vegetable oil', 
      'Shrimp powder', 
      'Salt', 
      'Sugar', 
      'Monosodium glutamate', 
      'Artificial colors'
    ],
    allergenWarnings: ['shellfish'],
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=500'
  },
  {
    id: 'prod006',
    name: 'Almond Granola',
    brand: 'Nature\'s Best',
    barcode: '6789012345678',
    ingredients: [
      'Rolled oats', 
      'Almonds', 
      'Honey', 
      'Coconut oil', 
      'Dried cranberries', 
      'Sunflower seeds'
    ],
    allergenWarnings: ['tree_nuts'],
    image: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?q=80&w=500'
  },
  {
    id: 'prod007',
    name: 'Soy Milk',
    brand: 'Plant Power',
    barcode: '7890123456789',
    ingredients: [
      'Filtered water', 
      'Soybeans', 
      'Cane sugar', 
      'Sea salt', 
      'Carrageenan', 
      'Natural flavor', 
      'Vitamin A, D2, B12'
    ],
    allergenWarnings: ['soy'],
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=500'
  },
  {
    id: 'prod008',
    name: 'Tuna Sandwich',
    brand: 'Quick Bites',
    barcode: '8901234567890',
    ingredients: [
      'Bread (wheat flour, water, yeast, salt)', 
      'Tuna', 
      'Mayonnaise (eggs, oil, vinegar)', 
      'Lettuce', 
      'Tomato', 
      'Salt', 
      'Pepper'
    ],
    allergenWarnings: ['wheat', 'fish', 'eggs', 'gluten'],
    image: 'https://images.unsplash.com/photo-1626458554904-c2c89085cd45?q=80&w=500'
  },
  {
    id: 'prod009',
    name: 'Sesame Crackers',
    brand: 'Crispy Bites',
    barcode: '9012345678901',
    ingredients: [
      'Wheat flour', 
      'Vegetable oil', 
      'Sesame seeds', 
      'Salt', 
      'Yeast', 
      'Sugar'
    ],
    allergenWarnings: ['wheat', 'sesame', 'gluten'],
    image: 'https://images.unsplash.com/photo-1590507621108-433608c97823?q=80&w=500'
  },
  {
    id: 'prod010',
    name: 'White Wine',
    brand: 'Vineyard Select',
    barcode: '0123456789012',
    ingredients: [
      'Grapes', 
      'Sulfites'
    ],
    allergenWarnings: ['sulfites'],
    image: 'https://images.unsplash.com/photo-1566452348683-79a7ba21f581?q=80&w=500'
  }
];

export default mockProducts;