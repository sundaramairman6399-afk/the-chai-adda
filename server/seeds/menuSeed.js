
/**
 * Seeds the database with The Chai Adda's real menu data.
 * Run with:  node seeds/menuSeed.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");

const categoryData = [
  { name: "Pizza",       displayOrder: 1, description: "Freshly baked pizzas" },
  { name: "Burger",      displayOrder: 2, description: "Juicy vegetarian burgers" },
  { name: "Sandwich",    displayOrder: 3, description: "Freshly prepared sandwiches" },
  { name: "Petties",     displayOrder: 4, description: "Crispy snack petties" },
  { name: "Chinese",     displayOrder: 5, description: "Indo-Chinese specialties" },
  { name: "South Indian",displayOrder: 6, description: "South Indian favourites" },
  { name: "Nasta",       displayOrder: 7, description: "Indian breakfast items" },
  { name: "Bites",       displayOrder: 8, description: "Quick bites and snacks" },
];

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const getProductData = (cats) => {
  const catMap = Object.fromEntries(cats.map((c) => [c.name, c._id]));

  return [
    // PIZZA (variants: Small, Medium, Large)
    { name: "Margarita Pizza",    category: catMap["Pizza"],  price: 160, variants: [{label:"Small",price:160},{label:"Medium",price:240},{label:"Large",price:310}], description: "Classic margarita pizza.", isVegetarian: true, displayOrder: 1 },
    { name: "Tomato Pizza",       category: catMap["Pizza"],  price: 170, variants: [{label:"Small",price:170},{label:"Medium",price:260},{label:"Large",price:350}], description: "Pizza topped with fresh tomatoes.", isVegetarian: true, displayOrder: 2 },
    { name: "Multiveg Pizza",     category: catMap["Pizza"],  price: 180, variants: [{label:"Small",price:180},{label:"Medium",price:290},{label:"Large",price:370}], description: "Pizza with mixed vegetables.", isVegetarian: true, displayOrder: 3 },
    { name: "Special Heart Pizza",category: catMap["Pizza"],  price: 310, variants: [{label:"Medium",price:310},{label:"Large",price:380}], description: "Our special heart-shaped pizza.", isVegetarian: true, displayOrder: 4, tags: ["special"] },
    { name: "Cheese Paneer Pizza",category: catMap["Pizza"],  price: 310, variants: [{label:"Medium",price:310},{label:"Large",price:390}], description: "Cheese and paneer pizza.", isVegetarian: true, displayOrder: 5 },

    // BURGER
    { name: "Veg Burger",          category: catMap["Burger"], price: 90,  description: "Classic vegetable burger.", isVegetarian: true, displayOrder: 1 },
    { name: "Veg Paneer Burger",   category: catMap["Burger"], price: 110, description: "Vegetable burger with paneer.", isVegetarian: true, displayOrder: 2 },
    { name: "Cheese Burger",       category: catMap["Burger"], price: 115, description: "Burger loaded with cheese.", isVegetarian: true, displayOrder: 3 },
    { name: "Cheese Paneer Burger",category: catMap["Burger"], price: 120, description: "Paneer and cheese burger.", isVegetarian: true, displayOrder: 4 },

    // SANDWICH
    { name: "Veg Sandwich",          category: catMap["Sandwich"], price: 100, description: "Fresh vegetable sandwich.", isVegetarian: true, displayOrder: 1 },
    { name: "Veg Paneer Sandwich",   category: catMap["Sandwich"], price: 110, description: "Vegetable and paneer sandwich.", isVegetarian: true, displayOrder: 2 },
    { name: "Veg Cheese Sandwich",   category: catMap["Sandwich"], price: 120, description: "Vegetable sandwich with cheese.", isVegetarian: true, displayOrder: 3 },
    { name: "Cheese Paneer Sandwich",category: catMap["Sandwich"], price: 130, description: "Paneer sandwich with cheese.", isVegetarian: true, displayOrder: 4 },
    { name: "Pizza Sandwich",        category: catMap["Sandwich"], price: 180, description: "Pizza-style sandwich.", isVegetarian: true, displayOrder: 5, tags: ["popular"] },

    // PETTIES
    { name: "Aloo Peties",  category: catMap["Petties"], price: 70, description: "Potato-filled crispy snack.", isVegetarian: true, displayOrder: 1 },
    { name: "Paneer Peties",category: catMap["Petties"], price: 80, description: "Paneer-filled snack.", isVegetarian: true, displayOrder: 2 },
    { name: "Cheese Peties",category: catMap["Petties"], price: 90, description: "Cheese-filled snack.", isVegetarian: true, displayOrder: 3 },

    // CHINESE
    { name: "Chowmeen",              category: catMap["Chinese"], price: 110, description: "Classic Chinese noodles.", isVegetarian: true, displayOrder: 1 },
    { name: "Paneer Chowmeen",       category: catMap["Chinese"], price: 150, description: "Noodles with paneer.", isVegetarian: true, displayOrder: 2 },
    { name: "Hakka Noodle",          category: catMap["Chinese"], price: 130, description: "Hakka-style noodles.", isVegetarian: true, displayOrder: 3 },
    { name: "Spicy Schezwan Noodle", category: catMap["Chinese"], price: 130, description: "Spicy Schezwan noodles.", isVegetarian: true, displayOrder: 4 },
    { name: "Chilli Potato",         category: catMap["Chinese"], price: 160, description: "Crispy potato in chilli sauce.", isVegetarian: true, displayOrder: 5 },
    { name: "Honey Chilli Potato",   category: catMap["Chinese"], price: 160, description: "Crispy potato with honey chilli sauce.", isVegetarian: true, displayOrder: 6 },
    { name: "Chilli Paneer",         category: catMap["Chinese"], price: 190, description: "Paneer tossed in chilli sauce.", isVegetarian: true, displayOrder: 7 },

    // SOUTH INDIAN
    { name: "Masala Dosa",  category: catMap["South Indian"], price: 120, description: "Dosa with potato masala.", isVegetarian: true, displayOrder: 1 },
    { name: "Paneer Dosa",  category: catMap["South Indian"], price: 130, description: "Dosa filled with paneer.", isVegetarian: true, displayOrder: 2 },
    { name: "Chinese Dosa", category: catMap["South Indian"], price: 140, description: "Dosa with Chinese-style filling.", isVegetarian: true, displayOrder: 3 },
    { name: "Veg Uttapam",  category: catMap["South Indian"], price: 130, description: "Uttapam topped with vegetables.", isVegetarian: true, displayOrder: 4 },
    { name: "Paneer Uttapam",category: catMap["South Indian"],price: 140, description: "Uttapam topped with paneer.", isVegetarian: true, displayOrder: 5 },

    // NASTA
    { name: "Aloo Paratha",         category: catMap["Nasta"], price: 90,  description: "Potato-stuffed paratha.", isVegetarian: true, displayOrder: 1 },
    { name: "Paneer Paratha",       category: catMap["Nasta"], price: 100, description: "Paneer-stuffed paratha.", isVegetarian: true, displayOrder: 2 },
    { name: "Mix Veg Paratha",      category: catMap["Nasta"], price: 110, description: "Paratha stuffed with mixed vegetables.", isVegetarian: true, displayOrder: 3 },
    { name: "Special Cheese Paratha",category: catMap["Nasta"],price: 140, description: "Special paratha with cheese.", isVegetarian: true, displayOrder: 4, tags: ["special"] },

    // BITES
    { name: "Pav Bhaji",       category: catMap["Bites"], price: 120, description: "Mumbai-style pav bhaji.", isVegetarian: true, displayOrder: 1 },
    { name: "French Fries",    category: catMap["Bites"], price: 100, description: "Crispy golden French fries.", isVegetarian: true, displayOrder: 2 },
    { name: "Cheese Pav Bhaji",category: catMap["Bites"], price: 120, description: "Pav bhaji topped with cheese.", isVegetarian: true, displayOrder: 3 },
    { name: "Plain Maggi",     category: catMap["Bites"], price: 105, description: "Classic Maggi noodles.", isVegetarian: true, displayOrder: 4 },
    { name: "Butter Maggi",    category: catMap["Bites"], price: 115, description: "Maggi prepared with butter.", isVegetarian: true, displayOrder: 5 },
    { name: "Cheese Maggi",    category: catMap["Bites"], price: 130, description: "Maggi topped with cheese.", isVegetarian: true, displayOrder: 6 },
  ];
};

const seed = async () => {
  try {
    await connectDB();
    console.log("🌱 Starting menu seed...\n");

    // Upsert categories by name. Existing unrelated records are never deleted.
    const cats = [];
    for (const category of categoryData) {
      const slug = slugify(category.name);
      const savedCategory = await Category.findOneAndUpdate(
        { name: category.name },
        { $set: { ...category, slug, isActive: true } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
      cats.push(savedCategory);
    }
    console.log(`✅ Upserted ${cats.length} categories`);

    // Upsert products by name, preserving their category references and avoiding duplicates.
    const productData = getProductData(cats);
    for (const product of productData) {
      const slug = slugify(product.name);
      await Product.findOneAndUpdate(
        { name: product.name },
        { $set: { ...product, slug, isAvailable: true } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`✅ Upserted ${productData.length} products`);

    console.log("\n🍵 Menu seed complete! Existing unrelated records were left untouched.\n");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
