const mongoose = require('mongoose');
const constant = require('../Utils/constant');
const Cuisine = mongoose.model('Cuisine');

module.exports = {
    getAllCuisines(){
        return Cuisine.find({})
            .exec();
    }
};
