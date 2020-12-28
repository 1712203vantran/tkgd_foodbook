const mongoose = require("mongoose");
require("mongoose-long")(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const AutoIncrement = require("mongoose-sequence")(mongoose);
const constantForSchema = require('../Utils/constantForSchema');

// User
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    gender: String,
    birthDate: Date,
    address: String,
    phone: String,
    avatar: String,
    totalReviewSent: { type: Number, min: 0, default: 0 },
    isActive: Boolean,
    createdDate: Date,
    userType: { type: Number, min: 0, default: 1 },
}, { collection: "Users" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual("favoriteDishes", {
    ref: "UserFavoriteDish",
    localField: "userID",
    foreignField: "userID",
    justOne: false,
});

userSchema.virtual("allergyIngres", {
    ref: "UserAllergyIngredient",
    localField: "userID",
    foreignField: "userID",
    justOne: false,
});

userSchema.index({ coords: "2dsphere" });
userSchema.plugin(AutoIncrement, { inc_field: "userID" });
mongoose.model("User", userSchema);

//Dish
const dishSchema = new mongoose.Schema({
    name: String,
    image: String,
    servings: { type: Number, min: 0, default: 0 },
    readyTime: { type: Number, min: 0, default: 0 },
    healthScore: { type: Number, min: 0, default: 0 },
    price: { type: SchemaTypes.Long, min: 0, default: 0 },
    difficulty: { type: Number, min: 0, default: 0 },
    description: String,
    video: String,
    status: { type: Number, min: 0, default: 0 },
    rating: { type: Number, min: 0, default: 0 },
    totalView: { type: SchemaTypes.Long, min: 0, default: 0 },
    totalReview: { type: SchemaTypes.Long, min: 0, default: 0 },
    createdBy: { type: SchemaTypes.Long, min: 0, default: 0 },
    createdDate: Date,
    censoredBy: { type: SchemaTypes.Long, min: 0, default: 0 },
    censoredDate: Date,
}, { collection: "Dishes" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

dishSchema.virtual("creator", {
    ref: "User",
    localField: "createdBy",
    foreignField: "userID",
    justOne: true,
});

dishSchema.virtual("censorer", {
    ref: "User",
    localField: "censoredBy",
    foreignField: "userID",
    justOne: true,
});

dishSchema.virtual("ingredients", {
    ref: "DishIngredient",
    localField: "dishID",
    foreignField: "dishID",
    justOne: false,
});

dishSchema.virtual("nutritions", {
    ref: "DishNutrition",
    localField: "dishID",
    foreignField: "dishID",
    justOne: false,
});

dishSchema.virtual("steps", {
    ref: "DishStep",
    localField: "dishID",
    foreignField: "dishID",
    justOne: false,
    options: { sort: { number: 1 }}
});

dishSchema.virtual("dishTypes", {
    ref: "DishTypeDetail",
    localField: "dishID",
    foreignField: "dishID",
    justOne: false,
});

dishSchema.virtual("cuisines", {
    ref: "CuisineDetail",
    localField: "dishID",
    foreignField: "dishID",
    justOne: false,
});

dishSchema.virtual("diets", {
    ref: "DietDetail",
    localField: "dishID",
    foreignField: "dishID",
    justOne: false,
});

dishSchema.virtual("comments", {
    ref: "Comment",
    localField: "dishID",
    foreignField: "dishID",
    justOne: false,
    options: { sort: { createdDate: -1 }, limit: constantForSchema.commentPerLoad}
});

dishSchema.virtual("favoriteNumber", {
    ref: "UserFavoriteDish",
    localField: "dishID",
    foreignField: "dishID",
    count: true
});

dishSchema.virtual("reviewNumber", {
    ref: "Review",
    localField: "dishID",
    foreignField: "dishID",
    count: true
});

dishSchema.index({ coords: "2dsphere" });
dishSchema.plugin(AutoIncrement, { inc_field: "dishID" });
mongoose.model("Dish", dishSchema);

// Ingredient
const ingredientSchema = new mongoose.Schema({
    name: String,
    image: String,
    userID: { type: SchemaTypes.Long, min: 0, default: 0 },
    isActive: Boolean,
    createdDate: Date
}, { collection: "Ingredients" });

ingredientSchema.index({ coords: "2dsphere" });
ingredientSchema.plugin(AutoIncrement, { inc_field: "ingredientID" });
mongoose.model("Ingredient", ingredientSchema);

// Nutrition
const nutritionSchema = new mongoose.Schema({
    name: String,
    unitShort: String,
    unitLong: String,
}, { collection: "Nutritions" });

nutritionSchema.index({ coords: "2dsphere" });
nutritionSchema.plugin(AutoIncrement, { inc_field: "nutritionID" });
mongoose.model("Nutrition", nutritionSchema);

// Review
const reviewSchema = new mongoose.Schema({
    rating: { type: Number, min: 0, default: 0 },
    content: String,
    createdDate: Date,
    dishID: { type: SchemaTypes.Long, min: 0, default: 0 },
    userID: { type: SchemaTypes.Long, min: 0, default: 0 },
}, { collection: "Reviews" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

reviewSchema.virtual("dish", {
    ref: "Dish",
    localField: "dishID",
    foreignField: "dishID",
    justOne: true,
});

reviewSchema.virtual("user", {
    ref: "User",
    localField: "userID",
    foreignField: "userID",
    justOne: true,
});

reviewSchema.index({ coords: "2dsphere" });
reviewSchema.plugin(AutoIncrement, { inc_field: "reviewID" });
mongoose.model("Review", reviewSchema);

// Comment
const commentSchema = new mongoose.Schema({
    content: String,
    createdDate: Date,
    dishID: { type: SchemaTypes.Long, min: 0, default: 0 },
    userID: { type: SchemaTypes.Long, min: 0, default: 0 },
}, { collection: "Comments" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

commentSchema.virtual("dish", {
    ref: "Dish",
    localField: "dishID",
    foreignField: "dishID",
    justOne: true,
});

commentSchema.virtual("user", {
    ref: "User",
    localField: "userID",
    foreignField: "userID",
    justOne: true,
});

commentSchema.index({ coords: "2dsphere" });
commentSchema.plugin(AutoIncrement, { inc_field: "commentID" });
mongoose.model("Comment", commentSchema);

// DishType
const dishTypeSchema = new mongoose.Schema({
    name: String,
}, { collection: "DishTypes" });

dishTypeSchema.index({ coords: "2dsphere" });
dishTypeSchema.plugin(AutoIncrement, { inc_field: "dishTypeID" });
mongoose.model("DishType", dishTypeSchema);

// Cuisine
const cuisineSchema = new mongoose.Schema({
    name: String,
}, { collection: "Cuisines" });

cuisineSchema.index({ coords: "2dsphere" });
cuisineSchema.plugin(AutoIncrement, { inc_field: "cuisineID" });
mongoose.model("Cuisine", cuisineSchema);

// Diet
const dietSchema = new mongoose.Schema({
    name: String,
}, { collection: "Diets" });

dietSchema.index({ coords: "2dsphere" });
dietSchema.plugin(AutoIncrement, { inc_field: "dietID" });
mongoose.model("Diet", dietSchema);

// Parameter
const parameterSchema = new mongoose.Schema({
    name: String,
    type: String,
    value: String,
    status: Boolean
}, { collection: "Parameters" });

parameterSchema.index({ coords: "2dsphere" });
parameterSchema.plugin(AutoIncrement, { inc_field: "paramID" });
mongoose.model("Parameter", parameterSchema);

// n-n schema
// DishIngredient
const dishIngredientSchema = new mongoose.Schema({
    dishID: { type: SchemaTypes.Long, min: 0, default: 0 },
    ingredientID: { type: SchemaTypes.Long, min: 0, default: 0 },
    amount: { type: Number, min: 0, default: 0 },
    unit: String,
    isExtended: Boolean,
}, { collection: "DishIngredients" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

dishIngredientSchema.virtual("dish", {
    ref: "Dish",
    localField: "dishID",
    foreignField: "dishID",
    justOne: true,
});

dishIngredientSchema.virtual("ingredient", {
    ref: "Ingredient",
    localField: "ingredientID",
    foreignField: "ingredientID",
    justOne: true,
});

dishIngredientSchema.index({ coords: "2dsphere" });
mongoose.model("DishIngredient", dishIngredientSchema);

// DishStep
const dishStepSchema = new mongoose.Schema({
    dishID: { type: SchemaTypes.Long, min: 0, default: 0 },
    number: { type: Number, min: 0, default: 0 },
    description: String,
    equipments: String,
    image: String,
}, { collection: "DishSteps" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

dishStepSchema.virtual("dish", {
    ref: "Dish",
    localField: "dishID",
    foreignField: "dishID",
    justOne: true,
});

dishStepSchema.index({ coords: "2dsphere" });
mongoose.model("DishStep", dishStepSchema);

// DishNutrition
const dishNutritionSchema = new mongoose.Schema({
    dishID: { type: SchemaTypes.Long, min: 0, default: 0 },
    nutritionID: { type: SchemaTypes.Long, min: 0, default: 0 },
    amount: { type: Number, min: 0, default: 0 },
}, { collection: "DishNutritions" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

dishNutritionSchema.virtual("dish", {
    ref: "Dish",
    localField: "dishID",
    foreignField: "dishID",
    justOne: true,
});

dishNutritionSchema.virtual("nutrition", {
    ref: "Nutrition",
    localField: "nutritionID",
    foreignField: "nutritionID",
    justOne: true,
});

dishNutritionSchema.index({ coords: "2dsphere" });
mongoose.model("DishNutrition", dishNutritionSchema);

// UserFavoriteDish
const userFavoriteDishSchema = new mongoose.Schema({
    userID: { type: SchemaTypes.Long, min: 0, default: 0 },
    dishID: { type: SchemaTypes.Long, min: 0, default: 0 },
    createdDate: Date,
}, { collection: "UserFavoriteDishes" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

userFavoriteDishSchema.virtual("user", {
    ref: "User",
    localField: "userID",
    foreignField: "userID",
    justOne: true,
});

userFavoriteDishSchema.virtual("dish", {
    ref: "Dish",
    localField: "dishID",
    foreignField: "dishID",
    justOne: true,
});

userFavoriteDishSchema.index({ coords: "2dsphere" });
mongoose.model("UserFavoriteDish", userFavoriteDishSchema);

// UserAllergyIngredient
const userAllergyIngreSchema = new mongoose.Schema({
    userID: { type: SchemaTypes.Long, min: 0, default: 0 },
    ingredientID: { type: SchemaTypes.Long, min: 0, default: 0 },
    createdDate: Date,
}, { collection: "UserAllergyIngredients" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

userAllergyIngreSchema.virtual("user", {
    ref: "User",
    localField: "userID",
    foreignField: "userID",
    justOne: true,
});

userAllergyIngreSchema.virtual("ingredient", {
    ref: "Ingredient",
    localField: "ingredientID",
    foreignField: "ingredientID",
    justOne: true,
});

userAllergyIngreSchema.index({ coords: "2dsphere" });
mongoose.model("UserAllergyIngredient", userAllergyIngreSchema);

// DishTypeDetail
const dishTypeDetailSchema = new mongoose.Schema({
    dishTypeID: { type: SchemaTypes.Long, min: 0, default: 0 },
    dishID: { type: SchemaTypes.Long, min: 0, default: 0 },
}, { collection: "DishTypeDetails" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

dishTypeDetailSchema.virtual("dishType", {
    ref: "DishType",
    localField: "dishTypeID",
    foreignField: "dishTypeID",
    justOne: true,
});

dishTypeDetailSchema.virtual("dish", {
    ref: "Dish",
    localField: "dishID",
    foreignField: "dishID",
    justOne: true,
});

dishTypeDetailSchema.index({ coords: "2dsphere" });
mongoose.model("DishTypeDetail", dishTypeDetailSchema);

// CuisineDetail
const cuisineDetailSchema = new mongoose.Schema({
    cuisineID: { type: SchemaTypes.Long, min: 0, default: 0 },
    dishID: { type: SchemaTypes.Long, min: 0, default: 0 },
}, { collection: "CuisineDetails" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

cuisineDetailSchema.virtual("cuisine", {
    ref: "Cuisine",
    localField: "cuisineID",
    foreignField: "cuisineID",
    justOne: true,
});

cuisineDetailSchema.virtual("dish", {
    ref: "Dish",
    localField: "dishID",
    foreignField: "dishID",
    justOne: true,
});

cuisineDetailSchema.index({ coords: "2dsphere" });
mongoose.model("CuisineDetail", cuisineDetailSchema);

// DietDetail
const dietDetailSchema = new mongoose.Schema({
    dietID: { type: SchemaTypes.Long, min: 0, default: 0 },
    dishID: { type: SchemaTypes.Long, min: 0, default: 0 },
}, { collection: "DietDetails" }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

dietDetailSchema.virtual("diet", {
    ref: "Diet",
    localField: "dietID",
    foreignField: "dietID",
    justOne: true,
});

dietDetailSchema.virtual("dish", {
    ref: "Dish",
    localField: "dishID",
    foreignField: "dishID",
    justOne: true,
});

dietDetailSchema.index({ coords: "2dsphere" });
mongoose.model("DietDetail", dietDetailSchema);