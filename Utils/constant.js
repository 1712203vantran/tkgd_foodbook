const appName = "Foodbook";

// Messages
const addDishSuccess = "Công thức của bạn đã được gửi thành công. Xin hay đợi quản trị viên kiểm duyệt";
const uploadIngredientImageFail = "Upload ảnh thất bại";
const uploadDishImageFail = "Upload ảnh thất bại";
const uploadDishStepImageFail = "Upload ảnh thất bại";
const acceptDishSuccess = "Chấp nhận công thức thành công";
const acceptDishFail = "Chấp nhận công thức thất bại";
const rejectDishSuccess = "Từ chối công thức thành công";
const rejectDishFail = "Từ chối công thức thất bại";
const addCommentSuccess = "Thêm bình luận thành công";
const addCommentFail = "Thêm bình luận thất bại";
const addReviewSuccess = "Thêm đánh giá thành công";
const addReviewFail = "Thêm đánh giá thất bại";
const addFavoriteSuccess = "Đã yêu thích món ăn";
const removeFavoriteSuccess = "Đã bỏ yêu thích món ăn";
const dishIsInWaiting = "Công thức đang chờ được quản trị viên kiểm duyệt !!!";
const noAuthorityError = "Bạn không có quyền truy cập vào trang này";
// Constant variables
const dishTypes = ["Món chính", "Món phụ", "Tráng miệng", "Món khai vị", "Salad", "Bánh", "Ăn sáng", "Soup", "Thức uống", "Nước sốt", "Snack", "Ăn trưa"];
const cuisines = ["Món Mỹ", "Món Trung", "Món Pháp", "Món Ý", "Món Nhật", "Món Mexico", "Món Thái", "Món Việt", "Món Âu", "Món Tây", "Món Đông"];
const diets = ["Không Gluent", "Không chứa sữa", "Ketogenic", "Vegetarian", "Lacto Vegetarian", "Ovo Vegetarian", "Vegan", "Pescetarian", "Paleo", "Primal", "Whole30"];
const ingredientUnits = [
    { key: "Trọng lượng", value: ["gram", "mg", "kg"] },
    { key: "Dung lượng", value: ["ml", "l"] },
    { key: "Khác", value: ["thìa", "muỗng cà phê", "muỗng canh", "chén", "tô", "trái", "quả", "củ", "con", "ổ", "lon", "cây"] }
];
const imageStorageLink = "https://stunningrecipe.blob.core.windows.net/";
const userPath = "user/";
const dishPath = "dish/";
const ingredientPath = "ingredient/";
const dishStepPath = "dishstep/";
const SALT_ROUNDS = 10;
const userType = {
    admin: 0,
    user: 1
}
const dishRecipeStatus = {
    waiting: 0,
    accepted: 1,
    rejected: 2
}
const searchTypeOptionTitle = {
    dishName: "Món ăn",
    ingredientName: "Nguyên liệu",
    nutritionName: "Dinh dưỡng"
}
const defaultAdminAvatar = "/images/StunningRecipe.png";
const defaultUserAvatar = "/images/avatar.png";
const notBelongAny = -1;
const homePerPage = 4;
const dishesPerPage = 8;
const censorDishesPerPage = 5;
const paginationMax = 5;
const maxRelatedDishes = 6;
const currency = "VND";
const autoCompleteMaxResult = 10;
const millisecondOfDay = 24 * 60 * 60 * 1000;
const millisecondOfWeek = millisecondOfDay * 7;

// Str
const emptyStr = "";
const commaSpace = ", ";
const imageUrlSeperator = ", ";
const filterValSeperator = ", ";
const dateSeparator = "/";

function getUserType(typeStr) {
    return Object.keys(type).find(key => type[key] === typeStr);
}

function splitToChunk(arr, size) {
    let temp = [];
    for (let i = 0; i < arr.length; i += size) {
        temp.push(arr.slice(i, i + size));
    }
    return temp;
}

function createDishImageName(dishID, extension) {
    return `dish_${dishID}${extension}`;
}

function createUserImageName(userID, extension) {
    return `avatar_${userID}${extension}`;
}

function createIngredientImageName(ingredientID, extension) {
    return `ingredient_${ingredientID}${extension}`;
}

function createDishStepImageName(dishID, number, imageNum, extension) {
    return `dish_${dishID}_step_${number}_image_${imageNum}${extension}`;
}

module.exports = {
    appName,
    // Messages
    addDishSuccess,
    uploadDishStepImageFail,
    uploadIngredientImageFail,
    uploadDishImageFail,
    uploadDishStepImageFail,
    acceptDishSuccess,
    acceptDishFail,
    rejectDishSuccess,
    rejectDishFail,
    addCommentSuccess,
    addCommentFail,
    addReviewSuccess,
    addReviewFail,
    addFavoriteSuccess,
    removeFavoriteSuccess,
    dishIsInWaiting,
    noAuthorityError,
    // Constant variables
    dishTypes,
    cuisines,
    diets,
    ingredientUnits,
    imageStorageLink,
    userPath,
    dishPath,
    ingredientPath,
    dishStepPath,
    SALT_ROUNDS,
    userType,
    dishRecipeStatus,
    searchTypeOptionTitle,
    defaultAdminAvatar,
    defaultUserAvatar,
    notBelongAny,
    homePerPage,
    dishesPerPage,
    censorDishesPerPage,
    paginationMax,
    maxRelatedDishes,
    currency,
    autoCompleteMaxResult,
    millisecondOfDay,
    millisecondOfWeek,
    // Str
    emptyStr,
    commaSpace,
    imageUrlSeperator,
    filterValSeperator,
    dateSeparator,
    getUserType,
    splitToChunk,
    createDishImageName,
    createUserImageName,
    createIngredientImageName,
    createDishStepImageName
};