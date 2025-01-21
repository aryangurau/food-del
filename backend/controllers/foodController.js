import foodModel from "../models/foodModel.js";
import fs from "fs";

//add food item
const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      image: req.file.filename
    });

    const savedFood = await food.save();
    console.log("Food saved successfully:", savedFood);
    res.json({ success: true, message: "Food Added", data: savedFood });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ success: false, message: "Error adding food item" });
  }
};

// all food list
const listFood = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await foodModel.countDocuments({});
    const totalPages = Math.ceil(totalItems / limit);

    const foods = await foodModel.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    console.log("Foods fetched:", foods.length);
    
    res.json({ 
      success: true, 
      data: foods,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error listing food:", error);
    res.status(500).json({ success: false, message: "Error listing food items" });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    // Delete the image file
    fs.unlink(`uploads/${food.image}`, (err) => {
      if (err) console.error("Error deleting image:", err);
    });

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food removed" });
  } catch (error) {
    console.error("Error removing food:", error);
    res.status(500).json({ success: false, message: "Error removing food item" });
  }
};

// Search food items
const searchFood = async (req, res) => {
  try {
    const { query, category } = req.query;
    let searchCriteria = {};
    
    if (query) {
      searchCriteria.name = { $regex: query, $options: "i" };
    }
    if (category) {
      searchCriteria.category = category;
    }

    const foods = await foodModel.find(searchCriteria);
    console.log("Search results:", foods.length);
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Error searching food:", error);
    res.status(500).json({ success: false, message: "Error searching food items" });
  }
};

export { addFood, listFood, removeFood, searchFood };
