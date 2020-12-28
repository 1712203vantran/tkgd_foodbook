const mongoose = require('mongoose');
const constant = require('../Utils/constant');
const DishType = mongoose.model('DishType');

module.exports = {
    getAllDishTypes(){
        return DishType.find({})
            .exec();
    }
};
