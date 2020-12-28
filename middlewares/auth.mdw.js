module.exports = (req, res, next) => {
    if (!req.user)
        return res.redirect(`/login?retUrl=${req.originalUrl}`);
    return next();
}