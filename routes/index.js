const express = require("express");
const router = express.Router();
const mainController = require('../controllers/main');
const dishController = require('../controllers/dish');
const userController = require('../controllers/user');
const autocompleteController = require('../controllers/autocomplete');
const requireLogin = require("./../middlewares/auth.mdw");
var path = require('path');
const fs = require("fs");


const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const upload = multer({ storage: inMemoryStorage });
//const uploadManyFiles = multer({storage: storage}).array("many-files", 17);
const handleError = (err, res) => {
    res
        .status(500)
        .contentType("text/plain")
        .end("Oops! Something went wrong!");
};
// passport
const passport = require('passport');
require('./passport.js');



/* GET Home page. */
router.get('/', mainController.home);

/* Login */
router.get('/login', userController.loginView);
router.post('/login', userController.login);

/* Sign up */
router.get('/signup', userController.signupView);
router.post('/signup', userController.signup);

/*logout*/
router.get('/logout', userController.logout);

/* Dishes */
router.get('/dishes', dishController.dishes);

/* Dish detail */
router.get('/dish/:dishID', dishController.dishDetail);

/* Search */
router.get('/search', dishController.search);

/* Advanced search */
router.get('/advanced_search', dishController.advancedSearch);

/* Post recipe */
router.get('/post_recipe', requireLogin, dishController.postRecipePage);
router.post('/postRecipe', requireLogin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'newIngreImages' },
    { name: 'newExtIngreImages' },
    { name: 'stepImages' }
]), dishController.postRecipe);

/* Censor recipe */
router.get('/censorRecipe', requireLogin, dishController.censorRecipePage);
router.post('/censorRecipe', requireLogin, dishController.censorRecipe);

/* Profile */
router.get("/profile", requireLogin, async(req, res) => {
    return res.redirect(`/profile/${req.user.userID}`);
});
router.get('/profile/:id', userController.profile);

/* Your own Information */
router.get('/yourInfo', requireLogin, userController.yourInfo);

/* Edit Your own Information */
router.get('/editInfo', requireLogin, userController.editInfoView);
router.post('/editInfo', requireLogin, userController.editInfo);

router.post('/uploadUserImage', upload.single('file'), userController.uploadUserImageCtrl); // 'file' là thuộc tính name của input ảnh

/* Change password */
router.get('/changePwd', requireLogin, userController.changePwdView);
router.post('/changePwd', requireLogin, userController.changePwd);

/* Do Favorite */
router.post('/doFavorite', requireLogin, userController.doFavorite);
/* Add Review */
router.post('/addReview', requireLogin, dishController.addReview);

/* Get Comments */
router.get('/getComments', dishController.getComments);
/* Add Comment */
router.post('/addComment', requireLogin, dishController.addComment);

router.get("/contact", mainController.contact);

router.get("/about", mainController.about);

router.get("/privacy", mainController.privacy);

router.get("/terms", mainController.terms);

router.get("/help", mainController.help);

router.get("/faqs", mainController.faqs);

router.get("/error", (req, res) => {
    res.render('error', {
        title: 'Lỗi'
    });
});

// Autocomplete API
router.get("/autocompleteNutritions", autocompleteController.autocompleteNutritions);
router.get("/autocompleteIngredients", autocompleteController.autocompleteIngredients);

module.exports = router;