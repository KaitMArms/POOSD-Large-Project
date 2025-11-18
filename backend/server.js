const app = require('./app');

const { connectionsReady } = require('./db');

const port = process.env.PORT || 8080;

connectionsReady.then(() => {
    app.listen(port, () => {
        console.log(`API listening on port ${port}`);
        console.log('Database connections are ready.');
    });
}).catch(err => {
    console.error(err);
    process.exit(1); 
});