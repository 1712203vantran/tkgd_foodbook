const mongoose = require('mongoose');
const Ingredient = mongoose.model('Ingredient');
const AzureBlob = require("../models/azure_blob");
const constant = require('../Utils/constant');


module.exports = {
  getIngredients(query, option){
    option = option || {};
    query.isActive = (query.isActive != undefined && query.isActive != null)? query.isActive : true;
    let findPromise = Ingredient.find(query)
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
  },
  addIngredients(userID, props){
    props = props || {};
    const ingredient = new Ingredient({
      name: props.name || constant.emptyStr,
      image: constant.emptyStr,
      userID: userID,
      isActive: false,
      createdDate: Date.now()
    })
    return ingredient.save();
  },
  async uploadIngredientImage(ingredientID, image){
    const extension = image.originalname.slice(image.originalname.lastIndexOf('.'));
    return await AzureBlob.uploadIngredientImage(constant.createIngredientImageName(ingredientID, extension), image);
  },
  setIngredientImage(ingredientID, imageName){
    return Ingredient.findOneAndUpdate({ingredientID: ingredientID}, {image: imageName}).exec();
  },
};
