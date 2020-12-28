const recipeGuideFilePonds = [];
const recipeIngredientNewImgPonds = [];
const recipeExtIngredientNewImgPonds = [];

$.fn.dynamicGuide = function(option){
    option = option || {};
    option.init = option.init || new Function();
    option.addCallBack = option.addCallBack || new Function();
    option.deleteCallback = option.deleteCallback || new Function();
    option.removeModelRow = option.removeModelRow || false;

    const firstRowFildPond = option.init();
    

    const $wrapper = $(this);
    let currentStep = 1;
    let $firstRow = $wrapper.find(".guide-row");
    const $rowModel = $firstRow.clone();
    const $guideButtonsWrapper = $wrapper.find(".guide-button-wrapper");
    const $addButton = $wrapper.find('.guide-add');
    

    $addButton.on('click', (e) => {
        let $row = $rowModel.clone();
        $row.find(".guide-number").text(currentStep + 1);
        $row.find(`[data-guide-number]`).attr("data-guide-number", currentStep + 1);
        currentStep++;
        $row.insertBefore($guideButtonsWrapper);
        
        // Add Callback
        const filePond = option.addCallBack($row);

        // Row delete
        const $rowDeleteBtn = $row.find('.guide-delete');
        $rowDeleteBtn.on('click', (e) => {
            // At least 1 row exists
            if (currentStep > 1 || option.removeModelRow){
                $row.remove();
                $row = null;
                updateGuideNumbers();

                // Delete callback
                option.deleteCallBack($row, filePond);
            }
            
        })
        
    })

    if (option.removeModelRow){
        $firstRow.remove();
    } else {
        // First Row delete (if there is currently at least 2 rows)
        const $firstRowDeleteBtn = $firstRow.find('.guide-delete');
        $firstRowDeleteBtn.on('click', (e) => {
            // At least 1 row exists
            if (currentStep > 1){
                $firstRow.remove();
                $firstRow = null;
                updateGuideNumbers();

                // Delete callback
                option.deleteCallBack($firstRow, firstRowFildPond);
            }
        })
    }

    function updateGuideNumbers(){
        let number = 0;
        const $allRows = $wrapper.find('.guide-row');
        $allRows.each((key, value) => {
            $(value).find('.guide-number').text(++number);
        })
        currentStep = number;
    }
}
// Dynamic recipe guide
$('#recipe-guide').dynamicGuide({
    init: function() {
        // First guide row image
        const recipeGuideImage = document.querySelectorAll(".recipe-guide-image");
        const recipeGuideImagePond = FilePond.create( recipeGuideImage[0] , recipeGuideFilePonOption);
        recipeGuideFilePonds.push(recipeGuideImagePond);
        return recipeGuideImagePond;
    },
    addCallBack: function($row) {
        const $recipeGuideImg = $row.find('.recipe-guide-image');
        const recipeGuideImgPond = FilePond.create( $recipeGuideImg[0] , recipeGuideFilePonOption);
        recipeGuideFilePonds.push(recipeGuideImgPond);

        return recipeGuideImgPond;
    },
    deleteCallBack: function($row, filePond) {
        recipeGuideFilePonds.splice(recipeGuideFilePonds.indexOf(filePond), 1);
    }
});

// Dynamic ingredients
$('#recipe-ingredients').dynamicGuide({
    init: function(){
        // First row collapse
        const $firstIngreNewCollapsee = $('#recipe-ingredients .recipe-ingredient-row .ingredient-new-collapsee');
        $('#recipe-ingredients .recipe-ingredient-row .ingredient-new-collapser').on('click', (e) => {
            $firstIngreNewCollapsee.collapse('toggle');
        });

            // First ingedient add new image
        const recipeIngreNewImage = document.querySelector("#recipe-ingredients .recipe-ingredient-add-new-image");
        const recipeIngreNewImagePond = FilePond.create( recipeIngreNewImage , recipeNewIngreFilePonOption);
        recipeIngredientNewImgPonds.push(recipeIngreNewImagePond);
        return recipeIngreNewImagePond;
    },
    addCallBack: function($row) {
        // Collapse
        const $rowCollapser = $row.find('.ingredient-new-collapser');
        const $rowCollapsee = $row.find('.ingredient-new-collapsee');
        $rowCollapser.on('click', (e) => {
            $rowCollapsee.collapse('toggle');
        });

        // Select2 for ingredients
        $row.find('.recipe-ingredient.select2').select2(select2IngredientsOption);
        // Select2 for ingredient units
        $row.find('.recipe-ingredient-unit').select2();

        const $recipeIngreNewImg = $row.find('.recipe-ingredient-add-new-image');
        const recipeIngreNewImgPond = FilePond.create( $recipeIngreNewImg[0] , recipeNewIngreFilePonOption);
        recipeIngredientNewImgPonds.push(recipeIngreNewImgPond);
        return recipeIngreNewImgPond;
    },
    deleteCallBack: function($row, filePond) {
        recipeIngredientNewImgPonds.splice(recipeIngredientNewImgPonds.indexOf(filePond), 1);
    }
});

// Dynamic extended ingredients
$('#recipe-extended-ingredients').dynamicGuide({
    removeModelRow: true,
    init: function(){
        if (this.removeModelRow)
            return;
        // First row collapse
        const $firstIngreNewCollapsee = $('#recipe-extended-ingredients .recipe-ingredient-row .ingredient-new-collapsee');
        $('#recipe-extended-ingredients .recipe-ingredient-row .ingredient-new-collapser').on('click', (e) => {
            $firstIngreNewCollapsee.collapse('toggle');
        });

            // First ingedient add new image
        const recipeIngreNewImage = document.querySelector("#recipe-extended-ingredients .recipe-ingredient-add-new-image");
        const recipeIngreNewImagePond = FilePond.create( recipeIngreNewImage , recipeNewIngreFilePonOption);
        recipeExtIngredientNewImgPonds.push(recipeIngreNewImagePond);
        return recipeIngreNewImagePond;
    },
    addCallBack: function($row) {
        // Collapse
        const $rowCollapser = $row.find('.ingredient-new-collapser');
        const $rowCollapsee = $row.find('.ingredient-new-collapsee');
        $rowCollapser.on('click', (e) => {
            $rowCollapsee.collapse('toggle');
        });

        // Select2 for ingredients
        $row.find('.recipe-ext-ingredient.select2').select2(select2IngredientsOption);
        // Select2 for ingredient units
        $row.find('.recipe-ingredient-unit').select2();

        const $recipeExtIngreNewImg = $row.find('.recipe-ingredient-add-new-image');
        const recipeExtIngreNewImgPond = FilePond.create( $recipeExtIngreNewImg[0] , recipeNewIngreFilePonOption);
        recipeExtIngredientNewImgPonds.push(recipeExtIngreNewImgPond);
        return recipeExtIngreNewImgPond;
    },
    deleteCallBack: function($row, filePond) {
        recipeExtIngredientNewImgPonds.splice(recipeExtIngredientNewImgPonds.indexOf(filePond), 1);
    }
});