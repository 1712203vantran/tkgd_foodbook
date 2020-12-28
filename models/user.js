const mongoose = require('mongoose');
const User = mongoose.model('User');
const Dish = mongoose.model('Dish');
const UserFavoriteDish = mongoose.model('UserFavoriteDish');
const bcrypt = require('bcryptjs');
const constant = require('../Utils/constant');
const azureBlob = require('./azure_blob');

module.exports = {
    findUsername(username) {
        return User.findOne({ username: username }).exec();
    },
    findEmail(email) {
        return User.findOne({ email: email }).exec();
    },
    addUser(firstName, lastName, username, email, phone, password) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, constant.SALT_ROUNDS, (err, hash) => {
                today = new Date();
                const newUser = new User({
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    email: email,
                    phone: phone,
                    password: hash,
                    gender: "",
                    birthDate: today,
                    address: "",
                    avatar: "avatar_default.png",
                    createdDate: today,
                    isActive: true
                });
                try {
                    newUser.save(function(err) {
                        if (err) {
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    });
                } catch (err) {
                    console.log('error at signUp' + err);
                }
            })
        })
    },
    getUser(userID) {
        return User.findOne({ userID: userID }).exec();
    },
    setPassword(userID, pwdNew) {
        hash = bcrypt.hashSync(pwdNew, constant.SALT_ROUND);
        return User.findOneAndUpdate({ userID: userID }, {
            password: hash
        }).exec();
    },
    setUserInfo(userID, info) {
        return User.findOneAndUpdate({ userID: userID }, {
            firstName: info.firstName || "",
            lastName: info.lastName || "",
            gender: info.gender || "",
            email: info.email || "",
            birthDate: info.birthDate || "",
            phone: info.phone || "",
            address: info.address || ""
        }).exec();
    },
    async uploadUserImageModel(userID, image) {
        const extension = image.originalname.slice(image.originalname.lastIndexOf('.'));
        return await azureBlob.uploadImage(userID, image, extension);
    },
    setUserUrlImage(userID, urlImage) {
        User.findOneAndUpdate({ userID: userID }, { avatar: urlImage }).exec();
    },
    getUserFavoriteDishes(userID, dishIDs) {
        return UserFavoriteDish.find({
                userID: userID,
                dishID: { $in: dishIDs }
            })
            .select({ dishID: 1 })
            .exec();
    },
    userFavoriteDish(userID, dishID) {
        return UserFavoriteDish.findOne({
                userID: userID,
                dishID: dishID
            })
            .exec();
    },
    addFavoriteDish(userID, dishID) {
        return new UserFavoriteDish({
            dishID: dishID,
            userID: userID,
            createdDate: Date.now()
        }).save();
    },
    removeFavoriteDish(userID, dishID) {
        return UserFavoriteDish.deleteOne({
            dishID: dishID,
            userID: userID
        }).exec();
    },
    getFavoriteDish(query, option) {
        option = option || {};
        let findPromise = UserFavoriteDish.find(query)
            .select({});
        // if (option.perPage) {
        //     findPromise = findPromise.limit(option.perPage);
        //     if (option.page) {
        //         findPromise = findPromise.skip(option.perPage * (option.page - 1));
        //     }
        // }
        if (option.sort) {
            findPromise = findPromise.sort(option.sort);
        }
        return findPromise
            .populate({
                path: 'dish',
                populate: [{ path: 'creator' }, { path: 'favoriteNumber' }, { path: 'dishTypes' }, { path: 'cuisines' }, { path: 'diets' }, ]
            })
            .exec();
    },
    updateReviewSent(userID) { // cập nhật lại totalReviewSent của user
        return new Promise(async(resolve, reject) => {
            const user = await User.findOne({ userID: userID })
                .exec();
            user.totalReviewSent = parseInt(user.totalReviewSent) + 1;
            await user.save();
            resolve(user);
        })
    },
};