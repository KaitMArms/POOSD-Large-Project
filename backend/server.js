const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());

const url = 'mongodb://localhost:27017/Users';
mongoose.connect(url)
	.then(() => console.log("MongoDB connected succesfully"))
	.catch(err => console.log("MongoDB connection error: ", err));

app.use((req, res, next) =>
{
    app.get("/api/ping", (req, res, next) => {
        res.status(200).json({ message: "Hello World" });
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.listen(5000); // start Node + Express server on port 5000
