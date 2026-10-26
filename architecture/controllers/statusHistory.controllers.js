const { fetchStatusHistory } = require('../models');

const getStatusHistory = (req, res, next) => {
    fetchStatusHistory(req.query)
        .then((history) => res.status(200).send({ history }))
        .catch(next);
};

module.exports = { getStatusHistory };
