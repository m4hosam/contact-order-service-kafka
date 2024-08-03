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
    await consumer.subscribe({ topic: 'personevents-changed', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());
            await handlePersonChangedEvent(event);
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

module.exports = {
    connectConsumer,
};