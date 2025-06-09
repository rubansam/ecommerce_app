const Product = require('../models/product');

exports.listProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json({ products });
  } catch (err) {
    next(err);
  }
}; 