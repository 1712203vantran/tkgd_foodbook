const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = mongoose.model('User');
const constant = require('../Utils/constant');

passport.use(new LocalStrategy({ passReqToCallback: true },
    function(req, username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Tên đăng nhập không tồn tại.' });
            }
            if (!user.isActive) {
                return done(null, false, { message: 'Tài khoản đã bị khóa.' });
            }
            bcrypt.compare(password, user.password, (err, result) => {
                if (result !== true) {
                    return done(null, false, { message: 'Mật khẩu không đúng.' });
                } else {
                    return done(null, user);
                }
            })

        });
    }
));


passport.serializeUser((user, done) => {
    done(null, user.userID)
})

passport.deserializeUser(function(id, done) {
    User.findOne({ userID: id }, function(err, user) {
        done(err, user);
    });
});