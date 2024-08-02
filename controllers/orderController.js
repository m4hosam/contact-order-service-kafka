const { Order, Person, OrderItem } = require('../models/orderModel');

// Get Order List
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('soldTo billTo shipTo items');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { orderDate, soldToID, billToID, shipToID, orderValue, taxValue, currencyCode, items } = req.body;
        // console.log(req.body);
        const orderItems = await OrderItem.insertMany(items);
        // const orderID = 
        const soldTo = await Person.findById(soldToID);
        const billTo = await Person.findById(billToID);
        const shipTo = await Person.findById(shipToID);
        const newOrder = new Order({
            orderDate,
            soldTo,
            billTo,
            shipTo,
            orderValue,
            taxValue,
            currencyCode,
            items: orderItems.map(item => item._id),
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete all Orders
exports.deleteAllOrders = async (req, res) => {
    try {
        await Order.deleteMany();
        res.status(200).json({ message: 'All orders deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read Order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderID).populate('soldTo billTo shipTo items');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Order
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.orderID, req.body, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Order by ID
exports.deleteOrderById = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.orderID);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Patch Order by ID
exports.patchOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.orderID, req.body, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
