const mongoose = require("mongoose");
const env = require("dotenv");

const MONGO_USERNAME = 'BearsJS';
const MONGO_PASSWORD = 'BearsJS';
const MONGO_CLUSTER_NAME = 'product2.v5kejnx';
const MONGO_DB_NAME = 'producto3';

const mongoDbUrl = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER_NAME}.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`;

env.config();
mongoose.connect(mongoDbUrl)
        .then(() => console.log('Aplicación conectada a MongoDB'))
        .catch((err) => console.log(err));

const database = mongoose.connection;

module.exports = database;