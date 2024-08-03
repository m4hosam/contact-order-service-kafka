const express = require('express');
const orderRoutes = require('./routes/orderRoutes');
const { connectProducer, disconnectProducer } = require('./kafka/kafkaProducer');
const { connectConsumer } = require('./kafka/kafkaConsumer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1/order', orderRoutes);

async function startServer() {
    await connectProducer();
    await connectConsumer();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

startServer().catch(console.error);

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server')
    await disconnectProducer();
    process.exit(0);
});