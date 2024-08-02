// src/controllers/orderController.js
const orderModel = require('../models/orderModel');
const { z } = require('zod');

const OrderItemSchema = z.object({
    itemID: z.string(),
    productID: z.string(),
    quantity: z.number().positive(),
    itemPrice: z.number().positive(),
});

const OrderInputSchema = z.object({
    orderDate: z.string().refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    }, {
        message: "Invalid date format. Expected a valid date string.",
    }),
    soldToID: z.string(),
    billToID: z.string(),
    shipToID: z.string(),
    orderValue: z.number().positive(),
    taxValue: z.number().nonnegative(),
    currencyCode: z.string().length(3),
    items: z.array(OrderItemSchema),
});

const OrderPatchSchema = OrderInputSchema.partial();

exports.getOrders = async (req, res) => {
    try {
        const orders = await orderModel.getOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        // Validate input data
        const validatedData = OrderInputSchema.parse(req.body);
        // Convert the orderDate string to a Date object
        validatedData.orderDate = new Date(validatedData.orderDate);
        const order = await orderModel.createOrder(validatedData);
        res.status(201).json(order);
    } catch (error) {
        if (error.message.includes('Validation error')) {
            res.status(400).json({ error: error.message });
        } else if (error.message.includes('Failed to fetch person info')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to create order', details: error.message });
        }
    }
};

exports.deleteAllOrders = async (req, res) => {
    try {
        await orderModel.deleteAllOrders();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await orderModel.getOrderById(req.params.orderID);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const validatedData = OrderInputSchema.parse(req.body);
        validatedData.orderDate = new Date(validatedData.orderDate);
        const order = await orderModel.updateOrder(req.params.orderID, validatedData);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteOrderById = async (req, res) => {
    try {
        const deleted = await orderModel.deleteOrderById(req.params.orderID);
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.patchOrder = async (req, res) => {
    try {
        const validatedData = OrderPatchSchema.parse(req.body);
        if (validatedData.orderDate) {
            validatedData.orderDate = new Date(validatedData.orderDate);
        }
        const order = await orderModel.patchOrder(req.params.orderID, validatedData);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};