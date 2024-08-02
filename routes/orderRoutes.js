const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/order', orderController.getOrders);
router.post('/order', orderController.createOrder);
router.delete('/order', orderController.deleteAllOrders);
router.get('/order/:orderID', orderController.getOrderById);
router.put('/order/:orderID', orderController.updateOrder);
router.delete('/order/:orderID', orderController.deleteOrderById);
router.patch('/order/:orderID', orderController.patchOrder);

module.exports = router;
