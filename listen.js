const app = require('./app.js');
const PORT = 9091;

app.listen(PORT, '127.0.0.1', () => console.log(`Listening on port: ${PORT}...`));