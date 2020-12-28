(async function() {
    const Parameter = require('./models/params');
    const DishType = require('./models/dishType');
    const Cuisine = require('./models/cuisine');
    const Diet = require('./models/diet');
    const constant = require('./Utils/constant');

    // Constant variables
    const parameters = await Parameter.getAllParameter();
    constant.appName = parameters[0].value;

    const dishTypes = await DishType.getAllDishTypes();
    constant.dishTypes = dishTypes.map((dishType, index) => dishType.name);

    const cuisines = await Cuisine.getAllCuisines();
    constant.cuisines = cuisines.map((cuisine, index) => cuisine.name);

    const diets = await Diet.getAllDiets();
    constant.diets = diets.map((diet, index) => diet.name);

    constant.ingredientUnits = [
        {key: "Trọng lượng", value: parameters[1].value.split(constant.commaSpace)},
        {key: "Dung lượng", value: parameters[2].value.split(constant.commaSpace)},
        {key: "Khác", value: parameters[3].value.split(constant.commaSpace)}
    ];

    constant.SALT_ROUNDS = parseInt(parameters[4].value);
    constant.userType = {
        admin: parseInt(parameters[5].value),
        user: parseInt(parameters[6].value)
    }
    constant.dishRecipeStatus = {
        waiting: parseInt(parameters[7].value),
        accepted: parseInt(parameters[8].value),
        rejected: parseInt(parameters[9].value)
    }
    constant.notBelongAny = parseInt(parameters[10].value)

    console.log("Set default variables completed");
})();