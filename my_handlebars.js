const hbs = require('hbs');
const constant = require('./Utils/constant');

hbs.registerHelper("inc", function(value, options) {
    return parseInt(value) + 1;
});
hbs.registerHelper("dec", function(value, options) {
    return parseInt(value) - 1;
});
hbs.registerHelper("myAppend", function(str, suffix) {
    return String(str) + String(suffix);
});
hbs.registerHelper("getUserType", function(type) {
    return constant.getUserType(type);
});
hbs.registerHelper("parseDate", function(dateString, seperator) {
    seperator = seperator || '-';
    const date = new Date(dateString);
    return [("0" + date.getDate()).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join(seperator);
});
hbs.registerHelper("parseDateInput", function(dateString, seperator) {
    seperator = seperator || '-';
    const date = new Date(dateString);
    return [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + date.getDate()).slice(-2)].join(seperator);
});
hbs.registerHelper("parseDateTime", function(dateString, seperator) {
    seperator = seperator || '-';
    const date = new Date(dateString);
    return [("0" + date.getDate()).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join(seperator) + ' ' + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2)].join(':');
});
hbs.registerHelper("numberWithCommas", function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});
hbs.registerHelper("numberizeBoolean", function(bool) {
    return (bool) ? 1 : 0;
});
hbs.registerHelper("getStatusBlockBtnClass", function(status) {
    if (status)
        return "btn-danger";
    else
        return "btn-success";
});
hbs.registerHelper("generatePagination", function(route, page, count) {
    let pageStr = "";
    const pageMax = constant.paginationMax;
    let i = (page > pageMax) ? page - (pageMax - 1) : 1;
    if (i !== 1)
        pageStr += `<li class="page-item disabled"><a class="page-link" href="">...</a></li>`;
    for (; i <= page + pageMax - 1 && i <= count; i++) {
        if (i === page)
            pageStr += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`;
        else
            pageStr += `<li class="page-item"><a class="page-link" href="/${route}?page=${i}">${i}</a></li>`;
        if (i === page + pageMax - 1 && i < count)
            pageStr += `<li class="page-item disabled"><a class="page-link" href="">...</a></li>`;
    }
    return pageStr;
});
hbs.registerHelper("formatPrice", function(price, isAppendCurrency = true) {
    if (isAppendCurrency)
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + constant.currency;
    else
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});
hbs.registerHelper("select", function(value, options) {
    return options.fn(this)
        .split('\n')
        .map(function(v) {
            const t = 'value="' + value + '"'
            return !RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"')
        })
        .join('\n')
});
hbs.registerHelper("getDishRecipeStatus", function(status) {
    switch (status) {
        case constant.dishRecipeStatus.waiting:
            return "text-warning";
        case constant.dishRecipeStatus.accepted:
            return "text-success";
        case constant.dishRecipeStatus.rejected:
            return "text-danger";
        default:
            return "";
    }
});
hbs.registerHelper("check", function(value, options) {
    return options.fn(this)
        .split('\n')
        .map(function(v) {
            const t = 'value="' + value + '"'
            return !RegExp(t).test(v) ? v : v.replace(t, t + ' checked="checked"')
        })
        .join('\n')
});
hbs.registerHelper("getDishTypeName", function(dishTypeID) {
    return constant.dishTypes[dishTypeID - 1];
});
hbs.registerHelper("getCuisineName", function(cuisineID) {
    return constant.cuisines[cuisineID - 1];
});
hbs.registerHelper("getDietName", function(dietID) {
    return constant.diets[dietID - 1];
});
hbs.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
hbs.registerHelper("getUserAvatarUrl", function(avatar) {
    return (avatar)? constant.imageStorageLink + constant.userPath + avatar : constant.defaultUserAvatar;
});
hbs.registerHelper("getDishImageUrl", function(dishImage) {
    return (dishImage)? constant.imageStorageLink + constant.dishPath + dishImage : constant.defaultUserAvatar;
});
hbs.registerHelper("getStepImageUrl", function(stepImage) {
    return (stepImage)? constant.imageStorageLink + constant.dishStepPath + stepImage : constant.defaultUserAvatar;
});
const handlebarsHelpers = require('handlebars-helpers');
const helpers = handlebarsHelpers();
hbs.registerHelper("is", helpers.is);
hbs.registerHelper("compare", helpers.compare);
hbs.registerHelper("default", helpers.default);
hbs.registerHelper("append", helpers.append);
hbs.registerHelper("compare", helpers.compare);
hbs.registerHelper('trimString', function(passedString) {
    var theString = "";
    if (passedString.length > 16) {
        theString = passedString.substring(0, 16) + "...";
    } else {
        theString = passedString;
    }
    return new hbs.SafeString(theString)
});
var paginate = require('handlebars-paginate');
hbs.registerHelper('paginate', paginate);

//var NumeralHelper = require("//");
//NumeralHelper.registerHelpers(hbs);
hbs.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
});

module.exports = hbs;