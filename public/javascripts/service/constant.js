// Messages
    //Error messages
    const nameErrMsg = "Tên không được để trống và không quá 100 ký tự";
    const healthWScoreErrMsg = "Chỉ số sức khỏe từ 0 đến 100";
    const servingsErrMsg = "Số khẩu phần ăn phải lớn hơn 0";
    const readyTimeErrMsg = "Thời gian thực hiện phải lớn hơn 0";
    const priceErrMsg = "Chi phí phải lớn hơn 0";
    const descriptionErrMsg = "Mô tả món ăn không được để trống và không quá 3000 ký tự"
    const guideContentErrMsg = "Mô tả bước thực hiện không được để trống"
    const dishTypeCbErrMsg = "Chọn ít nhất 1 loại món ăn";
    const cuisineCbErrMsg = "Chọn ít nhất 1 nền ẩm thực";
    const someFieldNotCorrectErrMsg = "Một số thông tin chưa nhập đúng";
    const recipeImgErrMsg = "Chọn ảnh minh họa công thức";
    const recipeIngreNameErrMsg = "Có nguyên liệu chưa nhập tên, &nbsp";
    const recipeIngreUnitValNameErrMsg = "Có nguyên liệu chưa nhập số lượng";
    const recipeVideoErrMsg = "Link Video minh họa không hợp lệ (phải là link embedded)";
    const recipeInfoErrMsg = "Thông tin món ăn chưa hợp lệ";
    const recipeGuideErrMsg = "Hướng dẫn món ăn chưa hợp lệ";
    const duplicateIngreErrMsg = "Công thức có nguyên liệu bị trùng";
    const noDishSelectedErrMsg = "Chưa có bài đăng nào được chọn";
    const wantToAccepRecipeMsg = "Bạn có chắc muốn chấp nhận công thức món ăn này ?";
    const wantToRejectRecipeMsg = "Bạn có chắc muốn từ chối món ăn này ?";

// Constant variables
const autocompleteDelay = 500;
// Rewrite checkForm of jquery validation
$.validator.prototype.checkForm = function() {
    //overriden in a specific page
    this.prepareForm();
    for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
        if (this.findByName(elements[i].name).length !== undefined && this.findByName(elements[i].name).length > 1) {
            for (var cnt = 0; cnt < this.findByName(elements[i].name).length; cnt++) {
                this.check(this.findByName(elements[i].name)[cnt]);
            }
        } else {
            this.check(elements[i]);
        }
    }
    return this.valid();
};
const postRecipeFormValidateOp = {
    rules: {
        name: {
            required: true,
            minlength: 1,
            maxlength: 100
        },
        healthScore: {
            required: true,
            number: true,
            min: 0,
            max: 100
        },
        servings: {
            required: true,
            number: true,
            min: 0
        },
        readyTime: {
            required: true,
            number: true,
            min: 0
        },
        price: {
            required: true,
            number: true,
            min: 0
        },
        description: {
            required: true,
            minlength: 1,
            maxlength: 3000
        },
        dishTypeCb: {
            required: true
        },
        cuisineCb: {
            required: true
        },
        recipeImage: {
            recipeImageRule: true
        },
        recipeIngredient: {
            required: true,
            minlength: 1
        },
        recipeIngredientUnitVal: {
            required: true,
            min: 0
        },
        recipeExtIngredient: {
            required: true,
            minlength: 1
        },
        recipeExtIngredientUnitVal: {
            required: true,
            min: 0
        }
    },
    messages: {
        name: {
            required: nameErrMsg,
            minlength: nameErrMsg,
            maxlength: nameErrMsg
        },
        healthScore: {
            required: healthWScoreErrMsg,
            number: healthWScoreErrMsg,
            min: healthWScoreErrMsg,
            max: healthWScoreErrMsg
        },
        servings: {
            required: servingsErrMsg,
            number: servingsErrMsg,
            min: servingsErrMsg
        },
        readyTime: {
            required: readyTimeErrMsg,
            number: readyTimeErrMsg,
            min: readyTimeErrMsg
        },
        price: {
            required: priceErrMsg,
            number: priceErrMsg,
            min: priceErrMsg
        },
        description: {
            required: descriptionErrMsg,
            minlength: descriptionErrMsg,
            maxlength: descriptionErrMsg
        },
        dishTypeCb: {
            required: dishTypeCbErrMsg
        },
        cuisineCb: {
            required: cuisineCbErrMsg
        },
        recipeImage: {
            recipeImageRule: recipeImgErrMsg
        },
        recipeIngredient: {
            required: recipeIngreNameErrMsg,
            minlength: recipeIngreNameErrMsg
        },
        recipeIngredientUnitVal: {
            required: recipeIngreUnitValNameErrMsg,
            min: recipeIngreUnitValNameErrMsg
        },
        recipeExtIngredient: {
            required: recipeIngreNameErrMsg,
            minlength: recipeIngreNameErrMsg
        },
        recipeExtIngredientUnitVal: {
            required: recipeIngreUnitValNameErrMsg,
            min: recipeIngreUnitValNameErrMsg
        }
    },
    errorPlacement: function(error, element) {
        // Dish type checkbox
        if (element.attr("name") == "dishTypeCb" )
            error.insertAfter(".recipe-type-wrapper");
        // Cuisine checkbox
        else if (element.attr("name") == "cuisineCb" )
            error.insertAfter(".recipe-cuisine-wrapper");
        // Recipe image
        else if (element.attr("name") == "recipeImage" )
            error.insertAfter(element[0].parentElement);
        // Recipe ingredients
        else if (element.attr("name") == "recipeIngredient" )            
            error.insertBefore("#recipe-ingredients");
        // Recipe ingredients unit value
        else if (element.attr("name") == "recipeIngredientUnitVal" ){
            error.insertBefore("#recipe-ingredients");
        }
        // Recipe extended ingredients
        else if (element.attr("name") == "recipeExtIngredient" )            
            error.insertBefore("#recipe-extended-ingredients");
        // Recipe extended ingredients unit value
        else if (element.attr("name") == "recipeExtIngredientUnitVal" ){
            error.insertBefore("#recipe-extended-ingredients");
        }
        else
            error.insertAfter(element);
    },
    ignore: ""
}
const postRecipeGuideValidateOp = {
    rules: {
        guide_content: {
            required: true,
            minlength: 1,
        },
        video: {
            youtubeLink: true
        }
    },
    messages: {
        guide_content: {
            required: guideContentErrMsg,
            minlength: guideContentErrMsg,
        },
        video: {
            youtubeLink: recipeVideoErrMsg
        }
    },
    errorPlacement: function(error, element) {
        // Guide content
        if (element.attr("name") == "guide_content")
            $("#recipe-guide").prepend(error);
        else
            error.insertAfter(element);
    }
}
const ingredientUnits = {
    weights: ["mg", "gram", "kg"],
    volumes: ["ml", "l"],
    others: ["muỗng cà phê", "muỗng canh", "trái"]
};
const select2NutritionsOption = {
    placeholder: 'Thêm thành phần dinh dưỡng',
    minimumInputLength: 0,
    ajax: {
        url: '/autocompleteNutritions',
        type: "GET",
        data: function (params) {
            var query = {
                nameReg: params.term
            }
            return query;
        },
        dataType: 'json',
        delay: autocompleteDelay
    }
};
const select2IngredientsOption = {
    placeholder: 'Tên nguyên liệu',
    minimumInputLength: 0,            
    allowClear: true,
    tags: true,
    ajax: {
        url: '/autocompleteIngredients',
        type: "GET",
        data: function (params) {
            var query = {
                nameReg: params.term
            }
            return query;
        },
        dataType: 'json',
        delay: autocompleteDelay
    }
};