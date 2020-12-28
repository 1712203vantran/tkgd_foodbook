$(document).ready(function() {

    // Search
    const $searchDishesForm = $(document.searchDishesForm);
    if ($searchDishesForm.length > 0) {
        const $submitBtn = $searchDishesForm.find('button[type=submit]');
        const $searchTypeDisplay = $searchDishesForm.find('.search-type-display');
        const $searchKeyword = $searchDishesForm.find('.search-keyword');
        $searchDishesForm.find('.search-type-option').on('click', (e) => {
            const $this = $(e.target);
            $searchTypeDisplay.text($this.attr("data-search-type-title"));
            $searchKeyword.attr("name", $this.attr("data-search-type"));
        })
    }

    // AdvancedSearch
    const $advancedSearchDishesForm = $("#advancedSearchForm");
    if ($advancedSearchDishesForm.length > 0) {
        const $submitBtn = $advancedSearchDishesForm.find('button[type=submit]');
        const $searchTypeDisplay = $advancedSearchDishesForm.find('.search-type-display');
        const $searchKeyword = $advancedSearchDishesForm.find('.search-keyword');
        $advancedSearchDishesForm.find('.search-type-option').on('click', (e) => {
            const $this = $(e.target);
            $searchTypeDisplay.text($this.attr("data-search-type-title"));
            $searchKeyword.attr("name", $this.attr("data-search-type"));
        });

        $submitBtn.on('click', (e) => {
            let queryUrl = `/search?${$searchKeyword.attr("name")}=${$searchKeyword.val()}&`;
            let selectedDishTypes = $advancedSearchDishesForm.find('[name=dishTypes]').val();
            let selectedCuisines = $advancedSearchDishesForm.find('[name=cuisines]').val();
            let selectedDiets = $advancedSearchDishesForm.find('[name=diets]').val();

            // Dish Types
            if (selectedDishTypes) {
                selectedDishTypes = selectedDishTypes.map((dishType, index) => parseInt(dishType))
                queryUrl += "dishTypes=" + JSON.stringify(selectedDishTypes) + "&";
            }

            // Cuisines
            if (selectedCuisines) {
                selectedCuisines = selectedCuisines.map((cuisine, index) => parseInt(cuisine))
                queryUrl += "cuisines=" + JSON.stringify(selectedCuisines) + "&";
            }

            // Diets
            if (selectedDiets) {
                selectedDiets = selectedDiets.map((diet, index) => parseInt(diet))
                queryUrl += "diets=" + JSON.stringify(selectedDiets) + "&";
            }

            window.location.href = queryUrl;
        })
    }

    const relatedProductSlider = $('#relatedProducts').lightSlider({
        item: 5,
        slideMove: 3,
        loop: false,
        autoWidth: true,
        easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
        enableDrag: false,
        controls: false,
        pager: false,
        onSliderLoad: function() {
            $('#relatedProducts').removeClass('cS-hidden');
        }
    });
    $('#related-product-slide-left').on('click', function() {
        relatedProductSlider.goToPrevSlide();
    });
    $('#related-product-slide-right').on('click', function() {
        relatedProductSlider.goToNextSlide();
    });

    // Post recipe panel
    const $postRecipePanel = $('#postRecipePanel');
    if ($postRecipePanel.length > 0) {
        const windowVar = window;
        const $recipeInfoTab = $postRecipePanel.find("#recipeInfoTab");
        const $recipeGuideTab = $postRecipePanel.find("#recipeGuideTab");
        const $tab1NextBtn = $postRecipePanel.find("#tab1NextBtn");
        const $tab2BackBtn = $postRecipePanel.find("#tab2BackBtn");
        const $submitBtn = $postRecipePanel.find("#submitBtn")
            // Next

        $tab1NextBtn.on('click', (e) => {
            if (!postRecipeInfoFormValidator.form()) {
                $tab2BackBtn.click();
                swal.error(recipeInfoErrMsg);
                return;
            }
            $recipeGuideTab.tab('show');
            windowVar.scrollTo(0, 0);
        });

        // Back
        $tab2BackBtn.on('click', (e) => {
            $recipeInfoTab.tab('show');
            windowVar.scrollTo(0, 0);
        });

        //Post recipe validate
        const $postRecipeForm = $(document.post_recipe_form);
        let postRecipeInfoFormValidator;
        if ($postRecipeForm.length > 0) {
            $(document.post_recipe_form.name).focus();
            postRecipeInfoFormValidator = $postRecipeForm.validate(postRecipeFormValidateOp);
        }

        // Post recipe guide validate
        const $postRecipeGuideForm = $(document.recipeGuideForm);
        let postRecipeGuideFormValidator;
        if ($postRecipeGuideForm.length > 0) {
            $(document.guide_content).focus();
            postRecipeGuideFormValidator = $postRecipeGuideForm.validate(postRecipeGuideValidateOp);
        }

        // Autocomplete
        // Nutritions
        const $postRecipeNutritionsSelect = $('#post_recipe_nutritions .select2');
        if ($postRecipeNutritionsSelect.length > 0) {
            $postRecipeNutritionsSelect.select2(select2NutritionsOption);
        }

        // Ingredients
        const $recipeIngredientsInput = $('#recipe-ingredients .recipe-ingredient.select2');
        if ($recipeIngredientsInput.length > 0) {
            $recipeIngredientsInput.select2(select2IngredientsOption);
        }

        // Extended Ingredients
        const $recipeExtIngredientsInput = $('#recipe-extended-ingredients .recipe-ext-ingredient.select2');
        if ($recipeExtIngredientsInput.length > 0) {
            $recipeExtIngredientsInput.select2(select2IngredientsOption);
        }

        // Ingredient units
        const $recipeIngredientUnitSelect = $('#recipe-ingredients .recipe-ingredient-unit, #recipe-extended-ingredients .recipe-ingredient-unit');
        if ($recipeIngredientUnitSelect.length > 0) {
            $recipeIngredientUnitSelect.select2();
        }

        // Submit
        $submitBtn.on('click', (e) => {
            // Check if recipe info is valid
            if (!postRecipeInfoFormValidator.form()) {
                $tab2BackBtn.click();
                swal.error(recipeInfoErrMsg);
                return;
            }
            if (!postRecipeGuideFormValidator.form()) {
                swal.error(recipeGuideErrMsg);
                return;
            }
            const props = new FormData();
            const checkDupSet = new Set();

            // Check duplicate ingredients
            // Ingredients
            const ingredients = [];
            $postRecipeForm.find("#recipe-ingredients .recipe-ingredient-row").each((key, item) => {
                const $item = $(item);
                const recipeIngreVal = $item.find("[name=recipeIngredient]").val();
                const isNew = isNaN(recipeIngreVal);
                const ingredientObj = {
                    ingredientID: (isNew) ? recipeIngreVal : parseInt(recipeIngreVal),
                    amount: parseFloat($item.find("[name=recipeIngredientUnitVal]").val()),
                    unit: $item.find("[name=recipeIngredientUnit]").val(),
                    isNew: isNew
                };
                ingredients.push(ingredientObj);
                checkDupSet.add(ingredientObj.ingredientID);
            })

            if (checkDupSet.size != ingredients.length) {
                swal.error(duplicateIngreErrMsg);
                return;
            }

            // Ingredients images
            recipeIngredientNewImgPonds.forEach((item, index) => {
                const file = item.getFile();
                if (file != null && ingredients[index].isNew) {
                    props.append("newIngreImages", file.file);
                    ingredients[index].hasNewImage = true;
                } else
                    ingredients[index].hasNewImage = false;
            })

            // Extended Ingredients
            const extIngredients = [];
            $postRecipeForm.find("#recipe-extended-ingredients .recipe-ingredient-row").each((key, item) => {
                const $item = $(item);
                const recipeExtIngreVal = $item.find("[name=recipeExtIngredient]").val();
                const isNew = isNaN(recipeExtIngreVal);
                const extIngredientObj = {
                    ingredientID: (isNew) ? recipeExtIngreVal : parseInt(recipeExtIngreVal),
                    amount: parseFloat($item.find("[name=recipeExtIngredientUnitVal]").val()),
                    unit: $item.find("[name=recipeExtIngredientUnit]").val(),
                    isNew: isNew
                };
                extIngredients.push(extIngredientObj);
                checkDupSet.add(extIngredientObj.ingredientID);
            })

            if (checkDupSet.size != (extIngredients.length + ingredients.length)) {
                swal.error(duplicateIngreErrMsg);
                return;
            }

            // Extended ingredients images
            recipeExtIngredientNewImgPonds.forEach((item, index) => {
                const file = item.getFile();
                if (file != null && extIngredients[index].isNew) {
                    props.append("newExtIngreImages", file.file);
                    extIngredients[index].hasNewImage = true;
                } else
                    extIngredients[index].hasNewImage = false;

            })

            props.append("ingredients", JSON.stringify(ingredients));
            props.append("extIngredients", JSON.stringify(extIngredients));

            // Get data from form
            $postRecipeForm.serializeArray().forEach((item, index) => props.append(item.name, item.value));
            // Parse number
            props.set("healthScore", parseInt(props.get("healthScore")));
            props.set("difficulty", parseInt(props.get("difficulty")));
            props.set("servings", parseInt(props.get("servings")));
            props.set("readyTime", parseInt(props.get("readyTime")));
            props.set("price", parseInt(props.get("price")));

            // Get checkboxes value
            dishTypes = [];
            cuisines = [];
            diets = [];
            // Dish types
            $("#recipeType input[name='dishTypeCb']:checked").each((key, item) => {
                dishTypes.push(parseInt(item.value));
            });
            // Cuisines
            $("#recipeCuisine input[name='cuisineCb']:checked").each((key, item) => {
                cuisines.push(parseInt(item.value));
            });
            // Diets
            $("#recipeDiet input[name='dietCb']:checked").each((key, item) => {
                diets.push(parseInt(item.value));
            });
            props.append("dishTypes", JSON.stringify(dishTypes));
            props.append("cuisines", JSON.stringify(cuisines));
            props.append("diets", JSON.stringify(diets));

            nutritions = [];
            // Nutritions
            $(document.post_recipe_form.nutritions).select2("data").forEach((item, index) => {
                nutritions.push(parseInt(item.id));
            });
            props.delete("nutritions");
            props.append("nutritions", JSON.stringify(nutritions));

            // Recipe guide
            $postRecipeGuideForm.serializeArray().forEach((item, index) => props.append(item.name, item.value));
            // Dish steps
            steps = [];
            $postRecipeGuideForm.find(".recipe-guide-row").each((key, item) => {
                const $item = $(item);
                steps.push({
                    number: parseInt($item.find(".guide-number").text()),
                    description: $item.find("[name=guide_content]").val(),
                    equipments: $item.find("[name=guide_equipments]").val(),
                    image: ""
                });
            })

            // Guide images
            let countStepImg = 0;
            recipeGuideFilePonds.forEach((item, index) => {
                const files = item.getFiles();
                if (files.length > 0) {
                    props.append("stepImagesBoundary", countStepImg);
                    files.forEach((item2, index2) => {
                        props.append("stepImages", item2.file);
                        countStepImg++;
                    })
                    steps[index].hasImages = true;
                } else {
                    props.append("stepImagesBoundary", countStepImg);
                    steps[index].hasImages = false;
                }
            })

            props.append("steps", JSON.stringify(steps));

            props.append("image", recipeImagePond.getFile().file);
            showLoading();
            $.ajax({
                url: '/postRecipe',
                data: props,
                contentType: false,
                type: 'POST',
                processData: false,
                success: function(dataJson) {
                    if (dataJson.success) {
                        (async function() {
                            await swal.success(dataJson.message);
                            window.location.href = dataJson.returnUrl;
                        })();
                    } else {
                        swal.error(dataJson.message);
                    }
                    hideLoading();
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    swal.error(xhr.responseText);
                    hideLoading();
                }
            });
        });
    }

    // Censor recipes
    const $waitingRecipes = $('#waitingRecipes');
    const $censorButtonsBar = $('#censorButtonsBar');
    if ($waitingRecipes.length > 0 && $censorButtonsBar.length > 0) {
        const $waitingRecipeList = $waitingRecipes.find('.waiting-recipe');
        const $waitingRecipeCbs = $waitingRecipes.find('.waiting-recipe .waiting-recipe-checkbox input[type=checkbox]');
        $('#selectAll').on('click', (e) => {
            $waitingRecipeCbs.each((key, cb) => {
                cb.checked = true;
            })
        })
        $('#acceptRecipe').on('click', async(e) => {
            const data = [];
            $waitingRecipes.find('.waiting-recipe .waiting-recipe-checkbox input[type=checkbox]:checked').each((key, input) => {
                data.push(parseInt(input.value));
            });

            // Check empty censor
            if (data.length == 0) {
                swal.error(noDishSelectedErrMsg);
                return;
            }

            // Confirm choice
            const confirm = await swal.warning(wantToAccepRecipeMsg);
            if (!confirm.isConfirmed)
                return;

            showLoading();
            $.ajax({
                url: '/censorRecipe',
                data: {
                    dishIDs: data,
                    status: 1
                },
                type: 'POST',
                dataType: 'json',
                success: function(dataJson) {
                    if (dataJson.success) {
                        (async function() {
                            await swal.success(dataJson.message);
                            window.location.href = "/censorRecipe"
                        })();
                    } else {
                        swal.error(dataJson.message);
                    }
                    hideLoading();
                },
                error: function(err) {
                    swal.error(err);
                    hideLoading();
                }
            });
        });

        $('#rejectRecipe').on('click', async(e) => {
            // Confirm choice
            const confirm = await swal.warning(wantToRejectRecipeMsg);
            if (!confirm.isConfirmed)
                return;
            const data = [];
            $waitingRecipes.find('.waiting-recipe .waiting-recipe-checkbox input[type=checkbox]:checked').each((key, input) => {
                data.push(parseInt(input.value));
            });

            // Check empty censor
            if (data.length == 0) {
                swal.error(noDishSelectedErrMsg);
                return;
            }

            showLoading();
            $.ajax({
                url: '/censorRecipe',
                data: {
                    dishIDs: data,
                    status: 2
                },
                type: 'POST',
                dataType: 'json',
                success: function(dataJson) {
                    if (dataJson.success) {
                        (async function() {
                            await swal.success(dataJson.message);
                            window.location.href = "/censorRecipe";
                        })();
                    } else {
                        swal.error(dataJson.message);
                    }
                    hideLoading();
                },
                error: function(err) {
                    swal.error(err);
                    hideLoading();
                }
            });
        })
    }

    // Filter
    const $dishesFilter = $('#dishesFilter');
    if ($dishesFilter.length > 0) {
        // Dish Types
        $('.filterDishType .dish-type-item, .filterDishTypeCbs .dish-type-item').on('click', (e) => {
            let queryUrl = (location.pathname == "/dishes" || location.pathname == "/search") ? location.pathname : "/dishes";
            queryUrl += "?";
            const urlParams = new URLSearchParams(window.location.search);
            const dishName = urlParams.get("dishName");
            const ingredientName = urlParams.get("ingredientName");
            const nutritionName = urlParams.get("nutritionName");
            const dishTypes = urlParams.get("dishTypes");
            const cuisines = urlParams.get("cuisines");
            const diets = urlParams.get("diets");

            // Keyword
            if (dishName != null) {
                queryUrl += "dishName=" + dishName + "&";
            } else if (ingredientName != null) {
                queryUrl += "ingredientName=" + ingredientName + "&";
            } else if (nutritionName != null) {
                queryUrl += "nutritionName=" + nutritionName + "&";
            }

            const $this = $(e.currentTarget);
            const newDishTypeID = parseInt($this.attr("data-dish-type"));
            if (dishTypes != null) {
                const arr = JSON.parse(dishTypes);
                const checkIdx = arr.indexOf(newDishTypeID);
                // Remove dishTypeID
                if (checkIdx != -1) {
                    arr.splice(checkIdx, 1);
                    if (arr.length > 0)
                        queryUrl += "dishTypes=" + JSON.stringify(arr) + "&";
                }
                // Push dishTypeID
                else {
                    arr.push(newDishTypeID);
                    queryUrl += "dishTypes=" + JSON.stringify(arr) + "&";
                }
            } else {
                queryUrl += `dishTypes=[${newDishTypeID}]&`;
            }

            if (cuisines != null) {
                queryUrl += `cuisines=${cuisines}&`;
            }

            if (diets != null) {
                queryUrl += `diets=${diets}&`;
            }
            window.location.href = queryUrl;
        })

        // Cuisines
        $('.filterCuisine .cuisine-item, .filterCuisineCbs .cuisine-item').on('click', (e) => {
            let queryUrl = (location.pathname == "/dishes" || location.pathname == "/search") ? location.pathname : "/dishes";
            queryUrl += "?";
            const urlParams = new URLSearchParams(window.location.search);
            const dishName = urlParams.get("dishName");
            const ingredientName = urlParams.get("ingredientName");
            const nutritionName = urlParams.get("nutritionName");
            const dishTypes = urlParams.get("dishTypes");
            const cuisines = urlParams.get("cuisines");
            const diets = urlParams.get("diets");

            // Keyword
            if (dishName != null) {
                queryUrl += "dishName=" + dishName + "&";
            } else if (ingredientName != null) {
                queryUrl += "ingredientName=" + ingredientName + "&";
            } else if (nutritionName != null) {
                queryUrl += "nutritionName=" + nutritionName + "&";
            }

            const $this = $(e.currentTarget);
            if (dishTypes != null) {
                queryUrl += `dishTypes=${dishTypes}&`;
            }

            const newCuisineID = parseInt($this.attr("data-cuisine"));
            if (cuisines != null) {
                const arr = JSON.parse(cuisines);
                const checkIdx = arr.indexOf(newCuisineID);
                // Remove cuisineID
                if (checkIdx != -1) {
                    arr.splice(checkIdx, 1);
                    if (arr.length > 0)
                        queryUrl += "cuisines=" + JSON.stringify(arr) + "&";
                }
                // Push cuisineID
                else {
                    arr.push(newCuisineID);
                    queryUrl += "cuisines=" + JSON.stringify(arr) + "&";
                }
            } else {
                queryUrl += `cuisines=[${newCuisineID}]&`;
            }

            if (diets != null) {
                queryUrl += `diets=${diets}&`;
            }
            window.location.href = queryUrl;
        })

        // Diets
        $('.filterDiet .diet-item, .filterDietCbs .diet-item').on('click', (e) => {
            let queryUrl = (location.pathname == "/dishes" || location.pathname == "/search") ? location.pathname : "/dishes";
            queryUrl += "?";
            const urlParams = new URLSearchParams(window.location.search);
            const dishName = urlParams.get("dishName");
            const ingredientName = urlParams.get("ingredientName");
            const nutritionName = urlParams.get("nutritionName");
            const dishTypes = urlParams.get("dishTypes");
            const cuisines = urlParams.get("cuisines");
            const diets = urlParams.get("diets");

            // Keyword
            if (dishName != null) {
                queryUrl += "dishName=" + dishName + "&";
            } else if (ingredientName != null) {
                queryUrl += "ingredientName=" + ingredientName + "&";
            } else if (nutritionName != null) {
                queryUrl += "nutritionName=" + nutritionName + "&";
            }

            const $this = $(e.currentTarget);
            if (dishTypes != null) {
                queryUrl += `dishTypes=${dishTypes}&`;
            }

            if (cuisines != null) {
                queryUrl += `cuisines=${cuisines}&`;
            }

            const newDietID = parseInt($this.attr("data-diet"));
            if (diets != null) {
                const arr = JSON.parse(diets);
                const checkIdx = arr.indexOf(newDietID);
                // Remove newDietID
                if (checkIdx != -1) {
                    arr.splice(checkIdx, 1);
                    if (arr.length > 0)
                        queryUrl += "diets=" + JSON.stringify(arr) + "&";
                }
                // Push newDietID
                else {
                    arr.push(newDietID);
                    queryUrl += "diets=" + JSON.stringify(arr) + "&";
                }
            } else {
                queryUrl += `diets=[${newDietID}]&`;
            }

            window.location.href = queryUrl;
        })
    }

    // Comment
    const $dishComment = $('.dish-comment');
    if ($dishComment.length > 0) {
        const dishID = $('input[name=dishID]').val();
        const $dishCommentList = $dishComment.find('.dish-comment-list');

        const $submitBtn = $dishComment.find('.dish-comment-submit');
        if ($submitBtn.length > 0) {
            $submitBtn.on('click', (e) => {
                showLoading();
                const $disNewCommentContent = $dishComment.find('.dish-new-comment-content');
                const content = $disNewCommentContent.val();
                $.ajax({
                    url: '/addComment',
                    data: {
                        dishID: dishID,
                        content: content
                    },
                    type: 'POST',
                    dataType: 'json',
                    success: function(dataJson) {
                        if (dataJson.success) {
                            $dishCommentList.prepend($(dataJson.newCommentLi));
                            $disNewCommentContent.val("");
                        } else {
                            swal.error(dataJson.message);
                        }
                        hideLoading();
                    },
                    error: function(err) {
                        swal.error(err);
                        hideLoading();
                    }
                });
            })
        }

        // Load more comments
        const $loadCommentsBtn = $('.load-comments-btn');
        if ($loadCommentsBtn.length > 0) {
            const $commentLoadingImg = $loadCommentsBtn.find('.loading-comment');
            $loadCommentsBtn.on('click', (e) => {
                $commentLoadingImg.show();
                const $this = $(e.target);
                $.ajax({
                    url: '/getComments',
                    data: {
                        dishID: dishID,
                        page: parseInt($this.attr("data-next-comment-page"))
                    },
                    type: 'GET',
                    dataType: 'json',
                    success: function(dataJson) {
                        if (dataJson.success) {
                            $dishCommentList.append($(dataJson.commentLis));
                            if (dataJson.nextPage != -1) {
                                $this.attr("data-next-comment-page", dataJson.nextPage);
                            } else {
                                $this.remove();
                            }
                        } else {
                            swal.error(dataJson.message);
                        }
                        $commentLoadingImg.hide();
                    },
                    error: function(err) {
                        swal.error(err);
                        $commentLoadingImg.hide();
                    }
                });
            })
        }
    }

    // Scroll Target
    const $scrollTarget = $('#scrollTarget');
    if ($scrollTarget.length > 0) {
        setTimeout(() => {
            scrollTo(0, $scrollTarget.offset().top);
        }, 500)
    }

    // Favorite (add/remove)
    $(".favorite-dish").click(function(item) {
        $(this).toggleClass("fa far");
        favoriteDish(item.target.id);
    });

    // sent review
    const dishID = $('input[name=dishID]').val();
    // const $dishCommentList = $dishComment.find('.dish-comment-list');
    const $dishReview = $('.dish-review');

    // thay đổi react khi hover vào rating
    const $dishDetailStarRating2 = $dishReview.find('#dishDetailStarRating2');
    $dishDetailStarRating2.on('rating:hover', function(event, value, caption, target) {
        displayReact(value);
    });
    // trả về giá trị cũ khi leave hover
    $dishDetailStarRating2.on('rating:hoverleave', function(event, target) {
        let ratingValue = parseFloat($dishDetailStarRating2.val());
        displayReact(ratingValue);
    });

    const $sendReviewSection = $dishReview.find('#sendReviewSection');
    const $submitReviewBtn = $dishReview.find('.dish-review-submit');
    if ($submitReviewBtn.length > 0) {
        $submitReviewBtn.on('click', (e) => {
            //showLoading();
            const $dishReviewRating = $dishReview.find('.dishDetailStarRating');
            const $dishReviewContent = $dishReview.find('.dish-review-content');
            const rating = $dishReviewRating.val();
            const content = $dishReviewContent.val();
            // alert(dishID + rating + content)
            $.ajax({
                url: '/addReview',
                data: {
                    dishID: dishID,
                    rating: rating,
                    content: content
                },
                type: 'POST',
                dataType: 'json',
                success: function(dataJson) {
                    if (dataJson.success) {
                        // thông báo đã gửi đánh giá
                        $sendReviewSection.replaceWith($(dataJson.reviewed));
                        // hiển thị lại số sao đánh giá
                        $dishDetailStarRating2.rating('destroy');
                        $dishDetailStarRating2.rating('create', { disabled: true, showCaption: false, size: 'xl' });
                    } else {
                        swal.error(dataJson.message);
                    }
                    //hideLoading();
                },
                error: function(err) {
                    swal.error(err);
                    //hideLoading();
                }
            });
        })
    }

});

// Favorite (add/remove)
function favoriteDish(dishID) {

    //showLoading();
    $.ajax({
        url: '/doFavorite',
        data: {
            dishID: dishID
        },
        type: 'POST',
        dataType: 'json',
        success: function(dataJson) {
            if (dataJson.success) {
                $('.favoriteNumber' + dishID).html(dataJson.newFavoriteNumber);
            } else {
                swal.error(dataJson.message);
            }
            //hideLoading();
        },
        error: function(err) {
            swal.error("Hãy đăng nhập để yêu thích món ăn");
            //hideLoading();
        }
    });

    return;
}


$("#dish-rating1").click(function() {
    $('html,body').animate({
            scrollTop: $("#reviewSection").offset().top
        },
        'slow');
});