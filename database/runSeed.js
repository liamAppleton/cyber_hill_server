const devData = require('./seed_data');
const seed = require('./seed');
const db = require('./db');

const runSeed = () => {
    return seed(devData).then(() => db.end())
};

runSeed();