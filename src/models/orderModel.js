// src/models/orderModel.js
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

const CONTACT_SERVICE_URL = 'http://localhost:8080/api/v1/person';




async function getPersonInfo(personId) {
    try {
        const response = await axios.get(`${CONTACT_SERVICE_URL}/${personId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching person info for ID ${personId}:`, error.message);
        throw new Error(`Failed to fetch person info for ID ${personId}`);
    }
}

exports.getOrders = async () => {
    return prisma.order.findMany({
        include: {
            items: true,
            soldTo: true,
            billTo: true,
            shipTo: true,
            soldToID: false,
            billToID: false,
            shipToID: false,
        },
    });
};

exports.createOrder = async (orderData) => {
    const { soldToID, billToID, shipToID } = orderData;

    try {
        // Fetch person information from the contact service
        const [soldTo, billTo, shipTo] = await Promise.all([
            getPersonInfo(soldToID),
            getPersonInfo(billToID),
            getPersonInfo(shipToID)
        ]);
        // Create the order with related person information
        const order = await prisma.order.create({
            data: {
                orderDate: orderData.orderDate,
                orderValue: orderData.orderValue,
                taxValue: orderData.taxValue,
                currencyCode: orderData.currencyCode,
                items: {
                    create: orderData.items,
                },
                soldTo: {
                    connectOrCreate: {
                        where: { id: soldToID },
                        create: {
                            id: soldToID,
                            ...soldTo,
                        },
                    },
                },
                billTo: {
                    connectOrCreate: {
                        where: { id: billToID },
                        create: {
                            id: billToID,
                            ...billTo,
                        },
                    },
                },
                shipTo: {
                    connectOrCreate: {
                        where: { id: shipToID },
                        create: {
                            id: shipToID,
                            ...shipTo,
                        },
                    },
                },
            },
            include: {
                soldTo: true,
                billTo: true,
                shipTo: true,
                items: true,
                soldToID: false,
                billToID: false,
                shipToID: false,
            },
        });

        return order;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

exports.deleteAllOrders = async () => {
    await prisma.orderItem.deleteMany();
    return prisma.order.deleteMany();
};

exports.getOrderById = async (orderId) => {
    return prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: true,
            soldTo: true,
            billTo: true,
            shipTo: true,
            soldToID: false,
            billToID: false,
            shipToID: false,
        },
    });
};

exports.updateOrder = async (orderId, orderData) => {
    const { soldToID, billToID, shipToID } = orderData;

    // Fetch person information from the contact service
    const [soldTo, billTo, shipTo] = await Promise.all([
        getPersonInfo(soldToID),
        getPersonInfo(billToID),
        getPersonInfo(shipToID)
    ]);
    return prisma.order.update({
        where: { id: orderId },
        data: {
            orderDate: orderData.orderDate,
            orderValue: orderData.orderValue,
            taxValue: orderData.taxValue,
            currencyCode: orderData.currencyCode,
            items: {
                deleteMany: {},
                create: orderData.items,
            },
            soldTo: {
                connectOrCreate: {
                    where: { id: soldToID },
                    create: {
                        id: soldToID,
                        ...soldTo,
                    },
                },
            },
            billTo: {
                connectOrCreate: {
                    where: { id: billToID },
                    create: {
                        id: billToID,
                        ...billTo,
                    },
                },
            },
            shipTo: {
                connectOrCreate: {
                    where: { id: shipToID },
                    create: {
                        id: shipToID,
                        ...shipTo,
                    },
                },
            },
        },
        include: {
            items: true,
            soldTo: true,
            billTo: true,
            shipTo: true,
        },
    });
};

exports.deleteOrderById = async (orderId) => {
    await prisma.orderItem.deleteMany({ where: { orderId } });
    return prisma.order.delete({ where: { id: orderId } });
};

exports.patchOrder = async (orderId, updateData) => {
    if (updateData.items) {
        updateData.items = {
            deleteMany: {},
            create: updateData.items,
        };
    }

    // Handle person updates if IDs are provided
    for (const field of ['soldTo', 'billTo', 'shipTo']) {
        const idField = `${field}ID`;
        if (updateData[idField]) {
            const personInfo = await getPersonInfo(updateData[idField]);
            updateData[field] = {
                connectOrCreate: {
                    where: { id: updateData[idField] },
                    create: {
                        id: updateData[idField],
                        ...personInfo,
                    },
                },
            };
            delete updateData[idField];
        }
    }
    const patchedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
            items: true,
            soldTo: true,
            billTo: true,
            shipTo: true,
        },
    });

    return patchedOrder;
};