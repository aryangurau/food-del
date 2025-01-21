import foodModel from "../models/foodModel.js";
import fs from "fs";

//add food item

const addFood = async (req, res) => {
  let image_filename = `${req?.file?.filename}`;

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });
  try {
    await food.save();
    res.json({ success: true, message: "food Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
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
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req?.body?.id);
    fs.unlink(`uploads/${food.image}`, () => {});

    await foodModel.findByIdAndDelete(req?.body?.id);
    res.json({ success: true, message: "Food removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Search food items
const searchFood = async (req, res) => {
  const { query, category } = req.query;
  try {
    let searchCriteria = {};
    if (query) searchCriteria.name = { $regex: query, $options: "i" };
    if (category) searchCriteria.category = category;

    const foods = await foodModel.find(searchCriteria);
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



// const searchFood = async (req, res) => {
//   try {
//     const { query, category } = req.query;
//     let searchCriteria = {};
//     if (query) searchCriteria.name = { $regex: query, $options: "i" };
//     if (category) searchCriteria.category = category;

//     const foods = await foodModel.find(searchCriteria);
//     console.log("Search Results:", foods);
//     res.json({ success: true, data: foods });
//   } catch (error) {
//     console.error(error.message); // Log detailed error
//     res.status(500).json({
//       success: false,
//       message: "Server error. Please try again later.",
//     });
//   }
// };






export { addFood, listFood, removeFood, searchFood };
