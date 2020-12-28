const Dish = require("../models/dish");
const User = require("../models/user");
const Ingredient = require("../models/ingredient");
const Comment = require("../models/comment");
const Review = require("../models/review");
const AzureBlob = require("../models/azure_blob");
const constant = require("../Utils/constant");
const ConversionUtils = require("../Utils/ConversionUtils");
const { dishTypes } = require("../Utils/constant");
const constantForSchema = require("../Utils/constantForSchema");

/* Dish Detail */
const dishDetail = async(req, res) => {
        const dishID = parseInt(req.params.dishID);
        const dish = await Dish.getDishAndUpdateView(dishID);
        // Check if dish is approved
        if (dish.status != constant.dishRecipeStatus.accepted) {
            res.render("inHandling", {
                title: constant.appName,
                message: constant.dishIsInWaiting
            })
        }

        // get user's review that existed
        if (req.user) {
            dish.userReviewed = await Review.getUserReview(req.user.userID, dishID);
        } else {
            dish.userReviewed = false;
        }

        const countComment = await Comment.getCountComment({ dishID: dishID });
        dish.imageUrl = constant.imageStorageLink + constant.dishPath + dish.image;
        // User favorite
        if (req.user) {
            dish.isUserFavorite = await Dish.isDishUserFavorite(dishID, req.user.userID);
        } else {
            dish.isUserFavorite = false;
        }
        dish.nutritionsStr = dish.nutritions.map((item, idx) => item.nutrition.name).join(constant.commaSpace);
        dish.ingredients = constant.splitToChunk(dish.ingredients, 2);
        dish.steps.forEach((step, idx) => {
            step.equipment = step.equipment || constant.emptyStr;
            step.images = step.image.split(constant.imageUrlSeperator);
        })

        // Dish Types
        const dishTypeIDs = [];
        const dishTypeNames = [];
        dish.dishTypes.forEach((item, idx) => {
            dishTypeIDs.push(item.dishTypeID);
            dishTypeNames.push(constant.dishTypes[item.dishTypeID - 1]);
        })
        dish.dishTypesStr = dishTypeNames.join(constant.commaSpace);

        // Cuisines
        const cuisineIDs = [];
        const cuisineNames = [];
        dish.cuisines.forEach((item, idx) => {
            cuisineIDs.push(item.cuisineID);
            cuisineNames.push(constant.cuisines[item.cuisineID - 1]);
        })
        dish.cuisinesStr = cuisineNames.join(constant.commaSpace);

        // Diets
        const dietIDs = [];
        const dietNames = [];
        dish.diets.forEach((item, idx) => {
            dietIDs.push(item.dietID);
            dietNames.push(constant.diets[item.dietID - 1]);
        })

        dish.dietsStr = dietNames.join(constant.commaSpace);

        // Related dishes
        let relatedDishes = await Dish.getRelatedDishes({
            dishID: { $ne: dishID }
        }, {
            perPage: constant.maxRelatedDishes
        }, {
            dishTypes: dishTypeIDs,
            cuisines: cuisineIDs,
            diets: dietIDs
        });
        relatedDishes = (relatedDishes.length > 0) ? (constant.splitToChunk(relatedDishes[0].dishes, 2)) : [];
        res.render('dish_detail', {
            title: dish.name,
            dish: dish,
            relatedDishes,
            userType: constant.userType,
            hasMoreComments: (countComment > constantForSchema.commentPerLoad) ? true : false
        });
    }
    /* Dishes */
const dishes = async(req, res) => {
    const customDishTypes = constant.dishTypes.map((item, idx) => {
        return { name: item, index: (idx) };
    });
    const customCuisines = constant.cuisines.map((item, idx) => {
        return { name: item, index: idx };
    });
    const customDiets = constant.diets.map((item, idx) => {
        return { name: item, index: idx };
    });

    const getOption = {
        sort: { createdDate: -1 },
        perPage: constant.dishesPerPage,
        page: parseInt(req.query.page) || 1
    }
    const originalUrl = req.originalUrl;
    req.session.originalUrl = originalUrl;

    // Filter Dish Types
    if (req.query.dishTypes) {
        localStorage.setItem('dishTypes', req.query.dishTypes || req.params.dishTypes);
    } else if (req.params.dishTypes) {
        localStorage.setItem('dishTypes', req.params.dishTypes);
    } else {
        localStorage.setItem('dishTypes', constant.emptyStr);
    }

    // Filter Cuisines
    if (req.query.cuisines) {
        localStorage.setItem('cuisines', req.query.cuisines || req.params.cuisines);
    } else if (req.params.cuisines) {
        localStorage.setItem('cuisines', req.params.cuisines);
    } else {
        localStorage.setItem('cuisines', constant.emptyStr);
    }

    // Filter Cuisines
    if (req.query.diets) {
        localStorage.setItem('diets', req.query.diets || req.params.diets);
    } else if (req.params.diets) {
        localStorage.setItem('diets', req.params.diets);
    } else {
        localStorage.setItem('diets', constant.emptyStr);
    }

    const localDishTypes = localStorage.getItem('dishTypes');
    const localCuisines = localStorage.getItem('cuisines');
    const localDiets = localStorage.getItem('diets');

    const populateOption = {};

    let queryUrl = constant.emptyStr;
    // Dish Types
    if (localDishTypes && localDishTypes !== constant.emptyStr) {
        populateOption.dishTypes = JSON.parse(localDishTypes);
        // Active filter
        populateOption.dishTypes.forEach((dishType) => {
                customDishTypes[dishType - 1].isActive = true;
            })
            // Add to query url
        queryUrl += `dishTypes=${localDishTypes}&`;
    }
    // Cuisines
    if (localCuisines && localCuisines !== constant.emptyStr) {
        populateOption.cuisines = JSON.parse(localCuisines);
        // Active filter
        populateOption.cuisines.forEach((cuisine) => {
                customCuisines[cuisine - 1].isActive = true;
            })
            // Add to query url
        queryUrl += `cuisines=${localCuisines}&`;
    }
    // Diets
    if (localDiets && localDiets !== constant.emptyStr) {
        populateOption.diets = JSON.parse(localDiets);
        // Active filter
        populateOption.diets.forEach((diet) => {
                if (diet > 0) {
                    customDiets[diet - 1].isActive = true;
                }
            })
            // Add to query url
        queryUrl += `diets=${localDiets}&`;
    }

    const result = await Dish.getFilterDishes({}, getOption, populateOption);
    const dishes = result[0].dishes;
    const count = (result[0].count.length > 0) ? result[0].count[0].count : 0;

    // User favorite Dishes
    const favoriteHashMap = {};
    if (req.user) {
        const userFavoriteDishes = await User.getUserFavoriteDishes(req.user.userID, dishes.map((dish, index) => dish.dishID));
        userFavoriteDishes.forEach((favDish, index) => {
            favoriteHashMap[favDish.dishID] = 1
        });
    }

    dishes.forEach((dish) => {
        dish.imageUrl = () => constant.imageStorageLink + constant.dishPath + dish.image;
        // Is User favorite dishe
        if (req.user) {
            dish.isUserFavorite = favoriteHashMap[dish.dishID] != undefined;
        }

        dish.dishTypesStr = dish.dishTypes.map((item, idx) => constant.dishTypes[item.dishTypeID - 1]).join(constant.commaSpace);
        dish.cuisinesStr = dish.cuisines.map((item, idx) => constant.cuisines[item.cuisineID - 1]).join(constant.commaSpace);
        dish.dietsStr = dish.diets.map((item, idx) => constant.diets[item.dietID - 1]).join(constant.commaSpace);

        dish.creator = dish.creator[0];
        dish.favoriteNumber = dish.favorites.length;
    });

    res.render('dishes', {
        title: constant.appName,
        dishes: constant.splitToChunk(dishes, 4),
        userType: constant.userType,
        dishTypes: constant.splitToChunk(customDishTypes, 6),
        cuisines: customCuisines,
        diets: customDiets,
        pagination: { page: getOption.page, pageCount: Math.ceil(count / getOption.perPage) },
        count: count,
        queryUrl: "/dishes?" + queryUrl
    });
}

/* Search Dishes */
const search = async(req, res) => {
    const customDishTypes = constant.dishTypes.map((item, idx) => {
        return { name: item, index: (idx) };
    });
    const customCuisines = constant.cuisines.map((item, idx) => {
        return { name: item, index: idx };
    });
    const customDiets = constant.diets.map((item, idx) => {
        return { name: item, index: idx };
    });

    // Options
    const queryOption = {};
    const getOption = {
        sort: { createdDate: -1 },
        perPage: constant.dishesPerPage,
        page: parseInt(req.query.page) || 1
    }
    const populateOption = {};

    const originalUrl = req.originalUrl;
    req.session.originalUrl = originalUrl;

    localStorage.setItem('dishName', constant.emptyStr);
    localStorage.setItem('ingredientName', constant.emptyStr);
    localStorage.setItem('nutritionName', constant.emptyStr);
    // Dish Name
    if (req.query.dishName) {
        localStorage.setItem('dishName', req.query.dishName || req.params.dishName);
    } else if (req.params.diets) {
        localStorage.setItem('dishName', req.params.dishName);
    } else {

        // Ingredient name
        if (req.query.ingredientName) {
            localStorage.setItem('ingredientName', req.query.ingredientName || req.params.ingredientName);
        } else if (req.params.ingredientName) {
            localStorage.setItem('ingredientName', req.params.ingredientName);
        } else {

            // Nutrition name
            if (req.query.nutritionName) {
                localStorage.setItem('nutritionName', req.query.nutritionName || req.params.nutritionName);
            } else if (req.params.nutritionName) {
                localStorage.setItem('nutritionName', req.params.nutritionName);
            }
        }
    }

    // Filter Dish Types
    if (req.query.dishTypes) {
        localStorage.setItem('dishTypes', req.query.dishTypes || req.params.dishTypes);
    } else if (req.params.dishTypes) {
        localStorage.setItem('dishTypes', req.params.dishTypes);
    } else {
        localStorage.setItem('dishTypes', constant.emptyStr);
    }

    // Filter Cuisines
    if (req.query.cuisines) {
        localStorage.setItem('cuisines', req.query.cuisines || req.params.cuisines);
    } else if (req.params.cuisines) {
        localStorage.setItem('cuisines', req.params.cuisines);
    } else {
        localStorage.setItem('cuisines', constant.emptyStr);
    }

    // Filter Cuisines
    if (req.query.diets) {
        localStorage.setItem('diets', req.query.diets || req.params.diets);
    } else if (req.params.diets) {
        localStorage.setItem('diets', req.params.diets);
    } else {
        localStorage.setItem('diets', constant.emptyStr);
    }

    let queryUrl = constant.emptyStr;

    // Search keyword
    let searchKeyword = constant.emptyStr;
    let searchType = constant.emptyStr;
    let searchTypeTitle = constant.emptyStr;
    const localDishName = localStorage.getItem('dishName');
    const localIngredientName = localStorage.getItem('ingredientName');
    const localNutritionName = localStorage.getItem('nutritionName');

    // Dish Name
    if (localDishName && localDishName !== constant.emptyStr) {
        queryOption.name = {
            $regex: localDishName.trim(),
            $options: "i"
        };
        // Active filter
        searchKeyword = localDishName;
        searchType = "dishName";
        searchTypeTitle = constant.searchTypeOptionTitle[searchType];
        // Add to query url
        queryUrl += `dishName=${localDishName}&`;
    }

    // Ingredient Name
    if (localIngredientName && localIngredientName !== constant.emptyStr) {
        populateOption.ingredientName = localIngredientName.trim();
        searchKeyword = localIngredientName;
        searchType = "ingredientName";
        searchTypeTitle = constant.searchTypeOptionTitle[searchType];
        // Add to query url
        queryUrl += `ingredientName=${localIngredientName}&`;
    }

    // Nutrition Name
    if (localNutritionName && localNutritionName !== constant.emptyStr) {
        populateOption.nutritionName = localNutritionName.trim();
        searchKeyword = localNutritionName;
        searchType = "nutritionName";
        searchTypeTitle = constant.searchTypeOptionTitle[searchType];
        // Add to query url
        queryUrl += `nutritionName=${localNutritionName}&`;
    }

    // Filter values
    const localDishTypes = localStorage.getItem('dishTypes');
    const localCuisines = localStorage.getItem('cuisines');
    const localDiets = localStorage.getItem('diets');

    // Dish Types
    if (localDishTypes && localDishTypes !== constant.emptyStr) {
        populateOption.dishTypes = JSON.parse(localDishTypes);
        // Active filter
        populateOption.dishTypes.forEach((dishType) => {
                customDishTypes[dishType - 1].isActive = true;
            })
            // Add to query url
        queryUrl += `dishTypes=${localDishTypes}&`;
    }
    // Cuisines
    if (localCuisines && localCuisines !== constant.emptyStr) {
        populateOption.cuisines = JSON.parse(localCuisines);
        // Active filter
        populateOption.cuisines.forEach((cuisine) => {
                customCuisines[cuisine - 1].isActive = true;
            })
            // Add to query url
        queryUrl += `cuisines=${localCuisines}&`;
    }
    // Diets
    if (localDiets && localDiets !== constant.emptyStr) {
        populateOption.diets = JSON.parse(localDiets);
        // Active filter
        populateOption.diets.forEach((diet) => {
                if (diet > 0) {
                    customDiets[diet - 1].isActive = true;
                }
            })
            // Add to query url
        queryUrl += `diets=${localDiets}&`;
    }

    const result = await Dish.getFilterDishes(queryOption, getOption, populateOption);
    const dishes = result[0].dishes;
    const count = (result[0].count.length > 0) ? result[0].count[0].count : 0;

    // User favorite Dishes
    const favoriteHashMap = {};
    if (req.user) {
        const userFavoriteDishes = await User.getUserFavoriteDishes(req.user.userID, dishes.map((dish, index) => dish.dishID));
        userFavoriteDishes.forEach((favDish, index) => {
            favoriteHashMap[favDish.dishID] = 1
        });
    }

    dishes.forEach((dish) => {
        dish.imageUrl = () => constant.imageStorageLink + constant.dishPath + dish.image;
        // Is User favorite dishe
        if (req.user) {
            dish.isUserFavorite = favoriteHashMap[dish.dishID] != undefined;
        }

        dish.dishTypesStr = dish.dishTypes.map((item, idx) => constant.dishTypes[item.dishTypeID - 1]).join(constant.commaSpace);
        dish.cuisinesStr = dish.cuisines.map((item, idx) => constant.cuisines[item.cuisineID - 1]).join(constant.commaSpace);
        dish.dietsStr = dish.diets.map((item, idx) => constant.diets[item.dietID - 1]).join(constant.commaSpace);

        dish.creator = dish.creator[0];
        dish.favoriteNumber = dish.favorites.length;
    });

    res.render('search', {
        title: constant.appName,
        dishes: constant.splitToChunk(dishes, 4),
        userType: constant.userType,
        dishTypes: constant.splitToChunk(customDishTypes, 3),
        cuisines: constant.splitToChunk(customCuisines, 3),
        diets: constant.splitToChunk(customDiets, 3),
        pagination: { page: getOption.page, pageCount: Math.ceil(count / getOption.perPage) },
        count: count,
        queryUrl: "/search?" + queryUrl,
        searchKeyword: searchKeyword,
        searchType: searchType,
        searchTypeTitle: searchTypeTitle
    });
}

/* Advanced Search Dishes */
const advancedSearch = async(req, res) => {
    const customDishTypes = constant.dishTypes.map((item, idx) => {
        return { name: item, index: (idx) };
    });
    const customCuisines = constant.cuisines.map((item, idx) => {
        return { name: item, index: idx };
    });
    const customDiets = constant.diets.map((item, idx) => {
        return { name: item, index: idx };
    });

    res.render('advanced_search', {
        title: constant.appName,
        dishTypes: customDishTypes,
        cuisines: customCuisines,
        diets: customDiets,
    });
}

/* Post Recipe */
const postRecipePage = async(req, res) => {
    //const www = await Dish.resetDatabase();
    const customDishTypes = constant.dishTypes.map((item, idx) => {
        return { name: item, index: (idx + 1) };
    });
    const customCuisines = constant.cuisines.map((item, idx) => {
        return { name: item, index: (idx + 1) };
    });
    const customDiets = constant.diets.map((item, idx) => {
        return { name: item, index: (idx + 1) };
    });
    res.render('post_recipe', {
        title: constant.appName,
        dishTypes: constant.splitToChunk(customDishTypes, 6),
        cuisines: constant.splitToChunk(customCuisines, 6),
        diets: constant.splitToChunk(customDiets, 4),
        ingredientUnits: constant.ingredientUnits
    });
}

const postRecipe = async(req, res) => {
    const props = req.body;
    const files = req.files;
    const user = req.user;
    // Add new ingredients
    const ingredients = JSON.parse(props.ingredients);
    const extIngredients = JSON.parse(props.extIngredients);
    const ingrePromises = [];
    // Main ingredients
    ingredients.forEach((ingredient, index) => {
            if (!ingredient.isNew)
                return;
            ingrePromises.push(new Promise(async(resolve, reject) => {
                const newIngredient = await Ingredient.addIngredients(user.userID, {
                    name: ingredient.ingredientID,
                });
                ingredient.ingredientID = newIngredient.ingredientID;
                if (ingredient.hasNewImage && files.newIngreImages.length > 0) {
                    try {
                        const fileName = await Ingredient.uploadIngredientImage(newIngredient.ingredientID, files.newIngreImages.shift());
                        await Ingredient.setIngredientImage(newIngredient.ingredientID, fileName);
                    } catch (err) {
                        console.log(err);
                        reject({
                            success: false,
                            message: constant.uploadImageFail
                        });
                    }
                }
                resolve(newIngredient);
            }))
        })
        // Extended ingredients
    extIngredients.forEach((ingredient, index) => {
        if (!ingredient.isNew)
            return;
        ingrePromises.push(new Promise(async(resolve, reject) => {
            const newIngredient = await Ingredient.addIngredients(user.userID, {
                name: ingredient.ingredientID,
            });
            ingredient.ingredientID = newIngredient.ingredientID;
            if (ingredient.hasNewImage && files.newExtIngreImages.length > 0) {
                try {
                    const fileName = await Ingredient.uploadIngredientImage(newIngredient.ingredientID, files.newExtIngreImages.shift());
                    await Ingredient.setIngredientImage(newIngredient.ingredientID, fileName);
                } catch (err) {
                    console.log(err);
                    res.json({
                        success: false,
                        message: constant.uploadIngredientImageFail
                    });
                }
            }
            resolve(newIngredient);
        }))
    })
    const ingreResponses = await Promise.all(ingrePromises);

    // Add Dishes
    const newDish = await Dish.addDish(user.userID, {
        name: props.name.trim(),
        servings: parseInt(props.servings),
        readyTime: parseInt(props.readyTime),
        healthScore: parseInt(props.healthScore),
        price: parseInt(props.price),
        difficulty: parseInt(props.difficulty),
        description: props.description.trim(),
        video: props.video.trim(),
    })
    try {
        const dishFileName = await Dish.uploadDishImage(newDish.dishID, files.image[0]);
        await Dish.setDishImage(newDish.dishID, dishFileName);
    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: constant.uploadDishImageFail
        });
    }

    const dishPromises = [];
    // Ingredients
    ingredients.forEach((ingredient, index) => {
        dishPromises.push(new Promise(async(resolve, reject) => {
            const dishIngre = await Dish.addDishIngredient(newDish.dishID, ingredient.ingredientID, {
                amount: ingredient.amount,
                unit: ingredient.unit,
                isExtended: false
            });
            resolve(dishIngre);
        }))
    })

    // Extended Ingredients
    extIngredients.forEach((ingredient, index) => {
        dishPromises.push(new Promise(async(resolve, reject) => {
            const dishIngre = await Dish.addDishIngredient(newDish.dishID, ingredient.ingredientID, {
                amount: ingredient.amount,
                unit: ingredient.unit,
                isExtended: true
            });
            resolve(dishIngre);
        }))
    })

    // Dish Types
    const dishTypes = JSON.parse(props.dishTypes);
    dishTypes.forEach((dishType, index) => {
        dishPromises.push(new Promise(async(resolve, reject) => {
            const dishTypeDetail = await Dish.addDishTypeDetail(newDish.dishID, dishType);
            resolve(dishTypeDetail);
        }))
    })

    // Cuisines
    const cuisines = JSON.parse(props.cuisines);
    cuisines.forEach((cuisine, index) => {
        dishPromises.push(new Promise(async(resolve, reject) => {
            const cuisineDetail = await Dish.addCuisineDetail(newDish.dishID, cuisine);
            resolve(cuisineDetail);
        }))
    })

    // Diets
    const diets = JSON.parse(props.diets);
    diets.forEach((diet, index) => {
        dishPromises.push(new Promise(async(resolve, reject) => {
            const dietDetail = await Dish.addDietDetail(newDish.dishID, diet);
            resolve(dietDetail);
        }))
    })

    // Nutritions
    const nutritions = JSON.parse(props.nutritions);
    nutritions.forEach((nutrition, index) => {
        dishPromises.push(new Promise(async(resolve, reject) => {
            const dishNutrition = await Dish.addDishNutrition(newDish.dishID, nutrition, {});
            resolve(dishNutrition);
        }))
    })

    // Steps
    const steps = JSON.parse(props.steps);
    const stepImagesBoundary = props.stepImagesBoundary;
    const stepNum = steps.length;
    steps.forEach((step, index) => {
        dishPromises.push(new Promise(async(resolve, reject) => {
            const dishStep = await Dish.addDishStep(newDish.dishID, {
                number: step.number,
                description: step.description.trim(),
                equipments: step.equipments.trim(),
            });
            try {
                // If step doesn't have any images
                if (!step.hasImages) {
                    resolve(dishStep);
                } else {
                    let stepIthImagePromises = [];
                    // If not last step
                    if (index < stepNum - 1) {
                        files.stepImages.slice(parseInt(stepImagesBoundary[index]), parseInt(stepImagesBoundary[index + 1])).forEach((stepImage, index2) => {
                            stepIthImagePromises.push(new Promise(async(resolve2, reject2) => {
                                const fileName = await Dish.uploadDishStepImage(newDish.dishID, step.number, index2 + 1, stepImage);
                                resolve2(fileName);
                            }));
                        })
                    } else {
                        files.stepImages.slice(parseInt(stepImagesBoundary[index])).forEach((stepImage, index2) => {
                            stepIthImagePromises.push(new Promise(async(resolve2, reject2) => {
                                const fileName = await Dish.uploadDishStepImage(newDish.dishID, step.number, index2 + 1, stepImage);
                                resolve2(fileName);
                            }));
                        })
                    }
                    const stepIthImages = await Promise.all(stepIthImagePromises);
                    await Dish.setDishStepImage(newDish.dishID, step.number, stepIthImages.join(constant.imageUrlSeperator));
                }

            } catch (err) {
                console.log(err);
                res.json({
                    success: false,
                    message: constant.uploadImageFail
                });
            }
            resolve(dishStep);
        }))
    });
    const stepResponses = await Promise.all(dishPromises);
    res.json({
        success: true,
        message: constant.addDishSuccess,
        returnUrl: "/profile/" + user.userID
    })
}

/* Censor recipe */
const censorRecipePage = async(req, res) => {
    // Authorized User
    if (req.user.userType != constant.userType.admin) {
        res.render("noAuthorityError.hbs", {
            title: constant.appName,
            message: constant.noAuthorityError
        })
    }
    const censorQuery = {
        status: constant.dishRecipeStatus.waiting
    };
    const censorOption = {
        perPage: constant.censorDishesPerPage,
        sort: { createdDate: 1 }
    };
    const count = await Dish.getCount(censorQuery);
    const pageCount = Math.ceil(count / censorOption.perPage);
    const queryPage = parseInt(req.query.page) || 1;
    censorOption.page = (queryPage <= pageCount) ? queryPage : pageCount

    const dishes = await Dish.getDishesCensor(censorQuery, censorOption)


    dishes.forEach((dish) => {
        dish.imageUrl = () => constant.imageStorageLink + constant.dishPath + dish.image;
        dish.dishTypesStr = dish.dishTypes.map((item, idx) => constant.dishTypes[item.dishTypeID - 1]).join(constant.commaSpace);
        dish.cuisinesStr = dish.cuisines.map((item, idx) => constant.cuisines[item.cuisineID - 1]).join(constant.commaSpace);
        dish.dietsStr = dish.diets.map((item, idx) => constant.diets[item.dietID - 1]).join(constant.commaSpace);
        dish.nutritionsStr = dish.nutritions.map((item, idx) => item.nutrition.name).join(constant.commaSpace);

        // Seperate main and extended ingredients
        /*dish.extIngredients = [];
        dish.ingredients.forEach((ingredient, index) => {
            // If ingredient is extended
            if (ingredient.isExtended){
                dish.extIngredients.push(dish.ingredients.splice(index, 1)[0]);
            }
        })*/

        dish.steps.forEach((step, idx) => {
            step.equipment = step.equipment || constant.emptyStr;
            step.images = step.image.split(constant.imageUrlSeperator);
        })
    });
    res.render('censor', {
        title: constant.appName,
        dishes: dishes,
        pagination: { page: censorOption.page, pageCount: pageCount },
        count: count
    })
}

/* Censor recipe */
const censorRecipe = async(req, res) => {
    const dishIDs = req.body.dishIDs.map((id, index) => parseInt(id));
    const status = parseInt(req.body.status);
    try {
        const result = await Dish.setDishesStatus(dishIDs, req.user.userID, status);
        res.json({
            success: true,
            message: (status == constant.dishRecipeStatus.accepted) ? constant.acceptDishSuccess : constant.rejectDishSuccess
        });
    } catch (err) {
        res.json({
            success: false,
            message: (status == constant.dishRecipeStatus.accepted) ? constant.acceptDishFail : constant.rejectDishFail
        });
    }
}

/* Get Comment */
const getComments = async(req, res) => {
    const dishID = parseInt(req.query.dishID);
    const page = parseInt(req.query.page);
    const comments = await Comment.getComments({
        dishID: dishID
    }, {
        page: page,
        perPage: constantForSchema.commentPerLoad,
        sort: { createdDate: -1 }
    })
    const commentCount = await Comment.getCountComment({ dishID: dishID });
    let commentLis = constant.emptyStr;
    comments.forEach((comment, index) => {
        const user = comment.user;
        const avatarStorageLink = constant.imageStorageLink + constant.userPath;
        const userAvatarUrl = (user.userType == constant.userType.admin) ? constant.defaultAdminAvatar : (user.avatar) ? avatarStorageLink + user.avatar : constant.defaultUserAvatar;
        commentLis += `<li class="media">
                                <a href="#" class="pull-left">
                                    <img src="${userAvatarUrl}" alt="" class="img-circle"/>
                                </a>
                                <div class="media-body ml-3">
                                    <span class="text-muted pull-right">
                                        <small class="text-muted">${ConversionUtils.parseDateTime(comment.createdDate, constant.dateSeparator)}</small>
                                    </span>
                                    <strong class="text-success"> ${user.firstName} ${user.lastName}</strong>
                                    <p>
                                        ${comment.content}
                                    </p>
                                </div>
                            </li>`;
    })
    res.json({
        success: true,
        message: constant.emptyStr,
        commentLis: commentLis,
        nextPage: (commentCount > page * constantForSchema.commentPerLoad) ? page + 1 : -1
    })
}

/* Add Comment */
const addComment = async(req, res) => {
    const dishID = parseInt(req.body.dishID);
    const content = req.body.content.trim();
    const user = req.user;
    const newComment = await Comment.addComment(dishID, req.user.userID, content);
    const avatarStorageLink = constant.imageStorageLink + constant.userPath;
    const userAvatarUrl = (user.userType == constant.userType.admin) ? constant.defaultAdminAvatar : (user.avatar) ? avatarStorageLink + user.avatar : constant.defaultUserAvatar;
    const newCommentLi = `<li class="media">
                            <a href="#" class="pull-left">
                                <img src="${userAvatarUrl}" alt="" class="img-circle"/>
                            </a>
                            <div class="media-body ml-3">
                                <span class="text-muted pull-right">
                                    <small class="text-muted">${ConversionUtils.parseDateTime(new Date()/*newComment.createdDate*/, constant.dateSeparator)}</small>
                                </span>
                                <strong class="text-success"> ${user.firstName} ${user.lastName}</strong>
                                <p>
                                    ${content}
                                </p>
                            </div>
                        </li>`;
    res.json({
        success: true,
        message: constant.addCommentSuccess,
        newCommentLi: newCommentLi
    })
}

/* Add Review */
const addReview = async(req, res) => {
    const dishID = parseInt(req.body.dishID);
    const rating = (req.body.rating)? parseFloat(req.body.rating) : 0;
    const content = req.body.content.trim();
    const user = req.user;

    // kiểm tra nếu user đã review rồi thì ko được review lại
    const userReviewed = await Review.getUserReview(req.user.userID, dishID);
    if (userReviewed) {
        var message = " - bạn đã đánh giá món ăn này rồi"
        res.json({
            error: true,
            message: constant.addReviewFail + message,
        })
    } else {

        // tạo Review mới
        const newReview = await Review.addReview(dishID, user.userID, rating, content);

        // cập nhật lại rating và totalReview cho Dish
        const updateDishReview = await Dish.updateDishReview(dishID, rating);

        // +1 totalReviewSent của user nữa
        const updateReviewSent = await User.updateReviewSent(user.userID);

        // thay đổi giao diện của phần review
        const reviewed = `<div>Bạn đã đánh giá ${rating} sao cho món ăn này với nội dung: ${content}</div>`;

        res.json({
            success: true,
            message: constant.addReviewSuccess,
            reviewed: reviewed
        })

    }
}

module.exports = {
    dishDetail,
    dishes,
    search,
    advancedSearch,
    postRecipePage,
    postRecipe,
    censorRecipePage,
    censorRecipe,
    getComments,
    addComment,
    addReview
};