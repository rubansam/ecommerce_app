const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const productsController = require('../controllers/productsController');

router.get('/', productsController.listProducts);
router.post('/',productsController.createProduct);

module.exports = router; 