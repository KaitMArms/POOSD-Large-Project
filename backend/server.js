const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());

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

app.listen(42069); // start Node + Express server on port 5000