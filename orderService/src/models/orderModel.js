// src/models/orderModel.js
const { PrismaClient } = require('@prisma/client');
const { getPersonInfo } = require('./getPersonFromContact');

const prisma = new PrismaClient();


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

    const updatedOrder = prisma.order.update({
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


    return updatedOrder;
};

exports.deleteOrderById = async (orderId) => {
    // Retrieve the order and its items before deletion
    const orderToDelete = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });
    if (!orderToDelete) {
        throw new Error(`Order with id ${orderId} not found`);
    }
    // Delete the order and its items
    await prisma.orderItem.deleteMany({ where: { orderId } });
    const deletedOrder = await prisma.order.delete({ where: { id: orderId } });
    if (!deletedOrder) {
        throw new Error(`Failed to delete order with id ${orderId}`);
    }

    return orderToDelete;
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