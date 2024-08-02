// src/app.js
const express = require('express');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1/order', orderRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});