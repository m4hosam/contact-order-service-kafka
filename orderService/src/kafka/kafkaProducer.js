const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const producer = kafka.producer();

async function connectProducer() {
    await producer.connect();
}

async function disconnectProducer() {
    await producer.disconnect();
}

async function sendEvent(type, order) {
    let topic;
    switch (type) {
        case 'order.created':
            topic = 'orderevents-created';
            break;
        case 'order.updated':
            topic = 'orderevents-changed';
            break;
        case 'order.deleted':
            topic = 'orderevents-deleted';
            break;
        default:
            throw new Error(`Unknown event type: ${type}`);
    }

    const event = {
        specversion: '1.0',
        id: uuidv4(),
        source: order.sourceURL,
        type: type,
        time: new Date().toISOString(),
        datacontenttype: 'application/json',
        data: {
            orderId: order.id,
            itemIds: order.items.map(item => item.id)
        }
    };

    await producer.send({
        topic: topic,
        messages: [{ value: JSON.stringify(event) }],
    });
}

module.exports = {
    connectProducer,
    disconnectProducer,
    sendEvent
};
