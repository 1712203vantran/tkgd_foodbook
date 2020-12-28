const mongoose = require('mongoose');
const Review = mongoose.model('Review');
const constant = require('../Utils/constant');


module.exports = {
    getUserReview(userID, dishID) {
        let findPromise = Review.findOne({ dishID: dishID, userID: userID })
            .select({});
        return findPromise
            .exec();
    },
    // getCountComment(query) {
    //     return Comment.count(query).exec();
    // },
    // Add comment
    async addReview(dishID, userID, rating, content) {
        return new Review({
            dishID: dishID,
            userID: userID,
            rating: rating,
            content: content,
            createdDate: Date.now()
        }).save();
    }
};