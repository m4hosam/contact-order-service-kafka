// src/kafka/kafkaConsumer.js
const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');
const { getPersonInfo } = require('../models/getPersonFromContact');

const prisma = new PrismaClient();
const kafka = new Kafka({
    clientId: 'order-service-consumer',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'order-service-group' });

async function connectConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topics: ['personevents-changed', 'personevents-deleted'], fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());
            if (topic === 'personevents-changed') {
                await handlePersonChangedEvent(event);
            } else if (topic === 'personevents-deleted') {
                await handlePersonDeletedEvent(event);
            }
        },
    });
}

async function handlePersonChangedEvent(event) {
    const personId = event.data.personid;
    console.log(event.data);
    // Get person Info from the contact service
    const personInfo = await getPersonInfo(personId);
    console.log(personInfo);

    try {
        // Update the person data in your database
        const isPerson = await prisma.person.findUnique({
            where: { id: personId },
        });
        if (isPerson) {
            // Update the person data in your database
            await prisma.person.update({
                where: { id: personId },
                data: {
                    city: personInfo.city,
                    country: personInfo.country,
                    extensionFields: personInfo.extensionFields,
                    firstName: personInfo.firstName,
                    lastName: personInfo.lastName,
                    houseNumber: personInfo.houseNumber,
                    streetAddress: personInfo.streetAddress,
                    zip: personInfo.zip
                },
            });
            console.log(`Updated person with ID ${personId}`);
        } else {
            console.log(`Person with ID ${personId} does not exist`);
        }

    } catch (error) {
        console.error(`Error updating person with ID ${personId}:`, error);
    }
}

async function handlePersonDeletedEvent(event) {
    const personId = event.data.personid;
    console.log(`Handling person deletion for ID ${personId}`);

    try {
        // Check if the person exists in your database
        const isPerson = await prisma.person.findUnique({
            where: { id: personId },
        });
        if (isPerson) {
            // Find all orders associated with this person
            const orders = await prisma.order.findMany({
                where: {
                    OR: [
                        { soldToID: personId },
                        { billToID: personId },
                        { shipToID: personId }
                    ]
                }
            });

            // Extract all order IDs
            const orderIds = orders.map(order => order.id);

            // Delete order items associated with these orders
            await prisma.orderItem.deleteMany({
                where: { orderId: { in: orderIds } }
            });
            console.log(`Deleted order items for person with ID ${personId}`);

            // Delete the orders
            await prisma.order.deleteMany({
                where: {
                    id: { in: orderIds }
                }
            });
            console.log(`Deleted orders for person with ID ${personId}`);

            // Optionally, delete the person from your database if needed
            // await prisma.person.delete({
            //     where: { id: personId },
            // });
            // console.log(`Deleted person with ID ${personId}`);
        } else {
            console.log(`Person with ID ${personId} does not exist`);
        }

    } catch (error) {
        console.error(`Error deleting orders for person with ID ${personId}:`, error);
    }
}

module.exports = {
    connectConsumer,
};