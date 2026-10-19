const {
    fetchStatusHistory
} = require('../models');

const getStatusHistory = (req, res, next) => {
    fetchStatusHistory()
        .then((history) => {
            res.status(200).send({ history })
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = {
    getStatusHistory
};