// src/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.delete('/', orderController.deleteAllOrders);
router.get('/:orderID', orderController.getOrderById);
router.put('/:orderID', orderController.updateOrder);
router.delete('/:orderID', orderController.deleteOrderById);
router.patch('/:orderID', orderController.patchOrder);

module.exports = router;