const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

// Person Schema
const PersonSchema = new Schema({
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    extensionFields: {
        type: Schema.Types.Mixed,
    },
    firstName: {
        type: String,
        required: true,
    },
    houseNumber: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
        unique: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    streetAddress: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
});

// OrderItem Schema
const OrderItemSchema = new Schema({
    itemID: {
        type: String,
        required: true,
    },
    productID: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    itemPrice: {
        type: Number,
        required: true,
    },
});

// Order Schema
const OrderSchema = new Schema({
    orderID: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    orderDate: {
        type: String,
        required: true,
    },
    soldTo: {
        type: Schema.Types.ObjectId,
        ref: 'Person',
        required: true,
    },
    billTo: {
        type: Schema.Types.ObjectId,
        ref: 'Person',
        required: true,
    },
    shipTo: {
        type: Schema.Types.ObjectId,
        ref: 'Person',
        required: true,
    },
    orderValue: {
        type: Number,
        required: true,
    },
    taxValue: {
        type: Number,
        required: true,
    },
    currencyCode: {
        type: String,
        required: true,
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'OrderItem',
    }],
});



const Person = mongoose.model('Person', PersonSchema, 'person');
const OrderItem = mongoose.model('OrderItem', OrderItemSchema);
const Order = mongoose.model('Order', OrderSchema);

module.exports = {
    Person,
    OrderItem,
    Order,
};
