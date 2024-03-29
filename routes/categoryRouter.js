const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const Product = require("../models/product");

// GET ALL
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET ONE
router.get("/:id", getCategory, (req, res) => {
  res.send(res.category);
});

//POST ONE
router.post("/", getCategory, async (req, res) => {
  const category = new Category({
    name: req.body.name,
  });

  try {
    const newCategory = await category.save();
    res.status(200).json(newCategory);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// UPDATE ONE
router.patch("/:id", getCategory, async (req, res) => {
  if (req.body.name && req.body.name !== "") {
    res.category.name = req.body.name;
  }
  try {
    const updatedCategory = await res.category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// DELETE ONE
router.delete("/:id", getCategory, async (req, res) => {
  try {
    Product.find({ category: res.category.name }, (error, products) => {
      try {
        products.forEach(async (product) => {
          product.category = "Без категории";
          await product.save();
        });
        if (error) {
          throw new Error(error.message); //TODO: I'm not sure if it will work
        }
      } catch (error) {
        res.status(500).json({
          message: error.message,
        });
      }
    });
    if (res.category.name === "Без категории") {
      res.status(403).json({
        message: "Вы не можете удалить эту категорию!",
      });
    } else {
      await res.category.remove();
      res.status(200).json({
        message: "Категория удалена!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// FIXME: FIX Duplicate names in PATCH

async function getCategory(req, res, next) {
  let category;
  try {
    if (req.method === "POST") {
      category = await Category.find({ name: req.body.name });
      if (category.length) {
        return res.status(409).json({
          message: "Такая категория уже существует!",
        });
      }
    } else {
      category = await Category.findById(req.params.id);
    }
    if (!category) {
      return res.status(404).json({
        message: "Не могу найти категорию!",
      });
    }
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
  res.category = category;
  next();
}

module.exports = router;
