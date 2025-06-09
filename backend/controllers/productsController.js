const Product = require('../models/product');

exports.listProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;

    if (!name || !price || !stock) {
      return res.status(400).json({ error: 'Product name, price, and stock are required.' });
    }

    // Basic validation for price and stock to be numbers
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number.' });
    }
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number.' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image_url,
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    next(err);
  }
}; 