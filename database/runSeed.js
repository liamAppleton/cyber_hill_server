const devData = require('./seed_data');
const emptyData = require('./empty_data')
const seed = require('./seed');
const db = require('./db');

const setupDev = false;

const runSeed = () => {
    return seed(setupDev ? devData : emptyData).then(() => db.end())
};

runSeed();