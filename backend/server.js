const express = require('express');
const cors = require('cors');

<<<<<<< Updated upstream
=======
const authRoutes = require('./routes/auth.routes');
const addgamesRouter = require('./apiFiles/addgames');

>>>>>>> Stashed changes
const app = express();
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());

<<<<<<< Updated upstream
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
=======
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', addgamesRouter);

// Health check
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

// Global error handler (optional)
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error.' });
>>>>>>> Stashed changes
});

app.listen(42069); // start Node + Express server on port 5000