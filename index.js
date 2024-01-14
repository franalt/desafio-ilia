require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();
const port = process.env.PORT || 80;

const connectToMongoDB = async () => {
    if (process.env.DATABASE_URI) {
        return mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    } else {
        const mongoServer = new MongoMemoryServer();
        await mongoServer.start();
        const mongoUri = await mongoServer.getUri();
        return mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
};

connectToMongoDB()
    .then(() => {
        console.log(`Connected to MongoDB in ${process.env.NODE_ENV} mode`);
        if (require.main === module) {
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            });
        }
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err.message);
    });

app.use(express.json());
app.use(bodyParser.json());

app.use("/", routes);

module.exports = app;
