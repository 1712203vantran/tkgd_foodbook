const mongoose = require('mongoose');
const Nutrition = mongoose.model('Nutrition');
const constant = require('../Utils/constant');


module.exports = {
  getNutritions(query, option){
    option = option || {};
    let findPromise = Nutrition.find(query)
                              .select({});
    if (option.perPage){
      findPromise = findPromise.limit(option.perPage);
      if (option.page){
        findPromise = findPromise.skip(option.perPage * (option.page - 1));
      }
    }
    if (option.sort){
      findPromise = findPromise.sort(option.sort);
    }
    return findPromise
          .exec();
  }
};
