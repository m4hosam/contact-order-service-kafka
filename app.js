const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(bodyParser.json());
app.use('/api/v1', orderRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
