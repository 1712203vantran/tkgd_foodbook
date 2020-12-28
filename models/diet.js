const mongoose = require('mongoose');
const constant = require('../Utils/constant');
const Diet = mongoose.model('Diet');

module.exports = {
    getAllDiets(){
        return Diet.find({})
            .exec();
    }
};
