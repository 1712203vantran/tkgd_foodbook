const mongoose = require('mongoose');
const Dish = mongoose.model('Dish');
const Ingredient = mongoose.model('Ingredient');
const DishIngredient = mongoose.model('DishIngredient');
const DishNutrition = mongoose.model('DishNutrition');
const DishStep = mongoose.model('DishStep');
const DishTypeDetail = mongoose.model('DishTypeDetail');
const CuisineDetail = mongoose.model('CuisineDetail');
const DietDetail = mongoose.model('DietDetail');
const UserFavoriteDish = mongoose.model('UserFavoriteDish');
const Comment = mongoose.model('Comment');
const AzureBlob = require("../models/azure_blob");
const constant = require('../Utils/constant');


module.exports = {
    getDishes(query, option) {
        option = option || {};
        // Default get accepted dishes
        query.status = (query.status != undefined && query.status != null) ? query.status : constant.dishRecipeStatus.accepted;
        let findPromise = Dish.find(query)
            .select({});
        if (option.perPage) {
            findPromise = findPromise.limit(option.perPage);
            if (option.page) {
                findPromise = findPromise.skip(option.perPage * (option.page - 1));
            }
        }
        if (option.sort) {
            findPromise = findPromise.sort(option.sort);
        }
        return findPromise
            .populate('creator')
            .populate('favoriteNumber')
            .populate('dishTypes')
            .populate('cuisines')
            .populate('diets')
            .exec();
    },
    getDish(dishID) {
        return Dish.findOne({ dishID: dishID })
            .populate('creator')
            .populate('dishTypes')
            .populate('cuisines')
            .populate('diets')
            .populate('favoriteNumber')
            .populate({
                path: "ingredients",
                populate: "ingredient"
            })
            .populate({
                path: "nutritions",
                populate: "nutrition"
            })
            .populate('steps')
            .populate({
                path: "comments",
                populate: "user",
            })
            .populate('reviewNumber')
            .exec();
    },
    getDishAndUpdateView(dishID) {
        return new Promise(async(resolve, reject) => {
            const dish = await Dish.findOne({ dishID: dishID })
                .populate('creator')
                .populate('dishTypes')
                .populate('cuisines')
                .populate('diets')
                .populate('favoriteNumber')
                .populate({
                    path: "ingredients",
                    populate: "ingredient"
                })
                .populate({
                    path: "nutritions",
                    populate: "nutrition"
                })
                .populate('steps')
                .populate({
                    path: "comments",
                    populate: "user"
                })
                .populate('reviewNumber')
                .exec();
            dish.totalView = parseInt(dish.totalView) + 1;
            await dish.save();
            resolve(dish);
        })
    },
    getDishesCensor(query, option) {
        option = option || {};
        // Default get accepted dishes
        query.status = (query.status != undefined && query.status != null) ? query.status : constant.dishRecipeStatus.accepted;
        let findPromise = Dish.find(query)
            .select({});
        if (option.perPage) {
            findPromise = findPromise.limit(option.perPage);
            if (option.page) {
                findPromise = findPromise.skip(option.perPage * (option.page - 1));
            }
        }
        if (option.sort) {
            findPromise = findPromise.sort(option.sort);
        }
        return findPromise
            .populate('creator')
            .populate('dishTypes')
            .populate('cuisines')
            .populate('diets')
            .populate({
                path: "ingredients",
                populate: "ingredient"
            })
            .populate({
                path: "nutritions",
                populate: "nutrition"
            })
            .populate('steps')
            .exec();
    },
    getCount(query) {
        return Dish.count(query).exec();
    },
    getFilterDishes(query, option, populateOption) {
        option = option || {};
        // Default get accepted dishes
        query.status = (query.status != undefined && query.status != null) ? query.status : constant.dishRecipeStatus.accepted;

        const pipeLine = [{
            $match: query
        }, ];

        // Search ingredients
        if (populateOption.ingredientName) {
            pipeLine.push(...[{
                    $lookup: {
                        from: "DishIngredients",
                        localField: "dishID",
                        foreignField: "dishID",
                        as: "dishIngredients"
                    }
                },
                {
                    $lookup: {
                        from: "Ingredients",
                        localField: "dishIngredients.ingredientID",
                        foreignField: "ingredientID",
                        as: "dishIngredients"
                    }
                },
                {
                    $match: {
                        "dishIngredients.name": {
                            $regex: populateOption.ingredientName,
                            $options: "i"
                        }
                    },
                }
            ]);
        }

        // Search nutritions
        if (populateOption.nutritionName) {
            pipeLine.push(...[{
                    $lookup: {
                        from: "DishNutritions",
                        localField: "dishID",
                        foreignField: "dishID",
                        as: "dishNutritions"
                    }
                },
                {
                    $lookup: {
                        from: "Nutritions",
                        localField: "dishNutritions.nutritionID",
                        foreignField: "nutritionID",
                        as: "dishNutritions"
                    }
                },
                {
                    $match: {
                        "dishNutritions.name": {
                            $regex: populateOption.nutritionName,
                            $options: "i"
                        }
                    },
                }
            ]);
        }

        pipeLine.push(...[{
            $lookup: {
                from: "DishTypeDetails",
                localField: "dishID",
                foreignField: "dishID",
                as: "dishTypes"
            }
        }, ]);

        // Filter dish types
        if (populateOption.dishTypes) {
            pipeLine.push({
                $match: { "dishTypes.dishTypeID": { $in: populateOption.dishTypes } },
            });
        }

        pipeLine.push(...[{
            $lookup: {
                from: "CuisineDetails",
                localField: "dishID",
                foreignField: "dishID",
                as: "cuisines"
            }
        }, ]);
        // Filter cuisines
        if (populateOption.cuisines) {
            pipeLine.push({
                $match: { "cuisines.cuisineID": { $in: populateOption.cuisines } },
            });
        }

        pipeLine.push(...[{
            $lookup: {
                from: "DietDetails",
                localField: "dishID",
                foreignField: "dishID",
                as: "diets"
            }
        }, ]);
        // Filter diets
        if (populateOption.diets) {
            if (populateOption.diets.length > 0 && populateOption.diets[0] == constant.notBelongAny) {
                pipeLine.push({
                    $match: { $or: [{ "diets": { $size: 0 } }, { "diets.dietID": { $in: populateOption.diets } }] },
                });
            } else {
                pipeLine.push({
                    $match: { "diets.dietID": { $in: populateOption.diets } },
                });
            }

        }

        pipeLine.push(...[{
                $lookup: {
                    from: "Users",
                    localField: "createdBy",
                    foreignField: "userID",
                    as: "creator"
                }
            },
            {
                $lookup: {
                    from: "UserFavoriteDishes",
                    localField: "dishID",
                    foreignField: "dishID",
                    as: "favorites"
                }
            }
        ]);


        if (option.page && option.perPage) {
            pipeLine.push(...[

            ]);
        }

        pipeLine.push(...[
            // Count 
            {
                $facet: {
                    count: [{ $count: "count" }],
                    dishes: [
                        // Sort
                        {
                            $sort: (option.sort) ? option.sort : { createdDate: -1 }
                        },
                        //Skip
                        {
                            $skip: (option.page && option.perPage) ? (option.perPage * (option.page - 1)) : 0
                        },
                        // Limit  
                        {
                            $limit: option.perPage
                        }
                    ]
                }
            }
        ])

        return Dish.aggregate(pipeLine).exec()
    },
    getRelatedDishes(query, option, populateOption) {
        option = option || {};
        // Default get accepted dishes
        query.status = (query.status != undefined && query.status != null) ? query.status : constant.dishRecipeStatus.accepted;

        const pipeLine = [{
            $match: query
        }, ];


        pipeLine.push(...[{
                $lookup: {
                    from: "DishTypeDetails",
                    localField: "dishID",
                    foreignField: "dishID",
                    as: "dishTypes"
                }
            },
            {
                $lookup: {
                    from: "CuisineDetails",
                    localField: "dishID",
                    foreignField: "dishID",
                    as: "cuisines"
                }
            },
            {
                $lookup: {
                    from: "DietDetails",
                    localField: "dishID",
                    foreignField: "dishID",
                    as: "diets"
                }
            },
        ]);

        // Filter
        if (populateOption.dishTypes && populateOption.cuisines && populateOption.diets) {
            pipeLine.push({
                $match: {
                    $or: [
                        { "dishTypes.dishTypeID": { $in: populateOption.dishTypes } },
                        { "cuisines.cuisineID": { $in: populateOption.cuisines } },
                        { "diets.dietID": { $in: populateOption.diets } }
                    ]
                }
            });
        }

        pipeLine.push(...[{
                $lookup: {
                    from: "Users",
                    localField: "createdBy",
                    foreignField: "userID",
                    as: "creator"
                }
            },
            {
                $lookup: {
                    from: "UserFavoriteDishes",
                    localField: "dishID",
                    foreignField: "dishID",
                    as: "favorites"
                }
            }
        ]);


        if (option.page && option.perPage) {
            pipeLine.push(...[

            ]);
        }

        pipeLine.push(...[
            // Count 
            {
                $facet: {
                    count: [{ $count: "count" }],
                    dishes: [
                        // Sort
                        {
                            $sort: (option.sort) ? option.sort : { createdDate: -1 }
                        },
                        //Skip
                        {
                            $skip: (option.page && option.perPage) ? (option.perPage * (option.page - 1)) : 0
                        },
                        // Limit  
                        {
                            $limit: option.perPage
                        }
                    ]
                }
            }
        ])

        return Dish.aggregate(pipeLine).exec()
    },
    addDish(createdBy, props) {
        const dish = new Dish({
            name: props.name || constant.emptyStr,
            image: props.image || constant.emptyStr,
            servings: props.servings || 0,
            readyTime: props.readyTime || 0,
            healthScore: props.healthScore || 0,
            price: props.price || 0,
            difficulty: props.difficulty || 0,
            description: props.description || constant.emptyStr,
            video: props.video || null,
            status: props.status || constant.dishRecipeStatus.waiting,
            rating: props.rating || 0,
            totalView: 0,
            totalReview: 0,
            createdBy: createdBy || 0,
            createdDate: Date.now(),
            censoredBy: null,
            censoreDate: null,
        })
        return dish.save();
    },
    addDishIngredient(dishID, ingredientID, props) {
        props = props || {};
        const dishIngredient = new DishIngredient({
            dishID: dishID,
            ingredientID: ingredientID,
            amount: props.amount || 0,
            unit: props.unit,
            isExtended: props.isExtended || false
        })
        return dishIngredient.save();
    },
    addDishNutrition(dishID, nutritionID, props) {
        props = props || {};
        const dishNutrition = new DishNutrition({
            dishID: dishID,
            nutritionID: nutritionID,
            amount: props.amount || 0,
        })
        return dishNutrition.save();
    },
    addDishStep(dishID, props) {
        props = props || {};
        const dishStep = new DishStep({
            dishID: dishID,
            number: props.number || 0,
            description: props.description || constant.emptyStr,
            equipments: props.equipments || constant.emptyStr,
            image: props.image || constant.emptyStr
        })
        return dishStep.save();
    },
    addDishTypeDetail(dishID, dishTypeID) {
        return new DishTypeDetail({
            dishID: dishID,
            dishTypeID: dishTypeID
        }).save();
    },
    addCuisineDetail(dishID, cuisineID) {
        return new CuisineDetail({
            dishID: dishID,
            cuisineID: cuisineID
        }).save();
    },
    addDietDetail(dishID, dietID) {
        return new DietDetail({
            dishID: dishID,
            dietID: dietID
        }).save();
    },
    isDishUserFavorite(dishID, userID) {
        return new Promise(async(resolve, reject) => {
            const dishUserFav = await UserFavoriteDish.find({
                dishID: dishID,
                userID: userID
            }).exec();
            if (dishUserFav.length > 0)
                resolve(true);
            else
                resolve(false);
        })
    },
    // Upload images
    async uploadDishImage(dishID, image) {
        const extension = image.originalname.slice(image.originalname.lastIndexOf('.'));
        return await AzureBlob.uploadDishImage(constant.createDishImageName(dishID, extension), image);
    },
    setDishImage(dishID, imageName) {
        return Dish.findOneAndUpdate({ dishID: dishID }, { image: imageName }).exec();
    },
    // Upload dish step images
    async uploadDishStepImage(dishID, number, imageNum, image) {
        const extension = image.originalname.slice(image.originalname.lastIndexOf('.'));
        return await AzureBlob.uploadDishStepImage(constant.createDishStepImageName(dishID, number, imageNum, extension), image);
    },
    setDishStepImage(dishID, number, imageName) {
        return DishStep.findOneAndUpdate({ dishID: dishID, number: number }, { image: imageName }).exec();
    },
    // Censor recipe
    async setDishesStatus(dishIDs, userID, status, option) {
        option = option || {};
        await Dish.updateMany({ dishID: { $in: dishIDs } }, {
            status: status,
            censoredBy: userID,
            censoredDate: Date.now()
        });
        // Accept dish
        if (status == constant.dishRecipeStatus.rejected) {
            return Promise.resolve();
        } else if (status == constant.dishRecipeStatus.accepted) {
            const promises = [];
            dishIDs.forEach((id, index) => {
                promises.push(new Promise(async(resolve, reject) => {
                    try {
                        let dishIngres = await DishIngredient.find({ dishID: id })
                            .select({ ingredientID: 1 }).exec()
                        dishIngres = dishIngres.map((ingre, index2) => ingre.ingredientID);
                        await Ingredient.updateMany({ ingredientID: { $in: dishIngres }, isActive: false }, { isActive: true });
                        resolve(true);
                    } catch (err) {
                        resolve(false);
                    }
                }));
            });
            await Promise.all(promises);
            return Promise.resolve();
        }
    },
    updateDishReview(dishID, rating) { // cập nhật lại rating và totalReview cho món ăn
        return new Promise(async(resolve, reject) => {
            const dish = await Dish.findOne({ dishID: dishID })
                .exec();
            rating = parseFloat(rating);
            dish.rating = (dish.rating * dish.totalReview + rating) / (+dish.totalReview + +1);
            dish.totalReview = parseInt(dish.totalReview) + 1;
            await dish.save();
            resolve(dish);
        })
    },
    getDishFavoriteNumber(dishID) {
        return Dish.findOne({ dishID: dishID })
            .populate('favoriteNumber')
            .exec();
    },
    async resetDatabase() {
        await Dish.deleteMany({ dishID: { $nin: [1, 2, 3] } });
        await Ingredient.deleteMany({ isActive: false });
        await DishIngredient.deleteMany({ dishID: { $nin: [1, 2, 3] } });
        await DishNutrition.deleteMany({ dishID: { $nin: [1, 2, 3] } });
        await DishStep.deleteMany({ dishID: { $nin: [1, 2, 3] } });
        await DishTypeDetail.deleteMany({ dishID: { $nin: [1, 2, 3] } });
        await CuisineDetail.deleteMany({ dishID: { $nin: [1, 2, 3] } });
        await DietDetail.deleteMany({ dishID: { $nin: [1, 2, 3] } });
    }
};