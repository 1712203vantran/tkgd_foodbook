const Nutrition = require("../models/nutrition");
const Ingredient = require("../models/ingredient");
const constant = require("../Utils/constant");

/* Autocomplete nutritions */
const autocompleteNutritions = async (req, res) => {
    const nameReg = req.query.nameReg || constant.emptyStr;
    const nutritions = await Nutrition.getNutritions({
        name: { $regex: nameReg, $options: 'i' }
    }, {
        sort: {name: 1},
        perPage: constant.autoCompleteMaxResult
    });
    const select2Format = nutritions.map((item, index) => {
        return {
            "id": item.nutritionID,
            "text": item.name
        }
    })
    return res.json({
        "results": select2Format
    });
}

/* Autocomplete ingredients */
const autocompleteIngredients = async (req, res) => {
    const nameReg = req.query.nameReg || constant.emptyStr;
    const ingredients = await Ingredient.getIngredients({
        name: { $regex: nameReg, $options: 'i' }
    }, {
        sort: {name: 1},
        perPage: constant.autoCompleteMaxResult
    });
    const select2Format = ingredients.map((item, index) => {
        return {
            "id": item.ingredientID,
            "text": item.name
        }
    })
    return res.json({
        "results": select2Format
    });
}

module.exports = {
    autocompleteNutritions,
    autocompleteIngredients
};