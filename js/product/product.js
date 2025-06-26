document.addEventListener("DOMContentLoaded", function () {
    const decreaseBtn = document.querySelector(".quantityDecreaseButton");
    const increaseBtn = document.querySelector(".quantityIncreaseButton");
    const quantityInput = document.querySelector(".quantityCount");

    function updateButtons() {
        decreaseBtn.disabled = parseInt(quantityInput.value) <= 1;
    }

    decreaseBtn.addEventListener("click", function () {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
        updateButtons();
    });

    increaseBtn.addEventListener("click", function () {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        updateButtons();
    });

    updateButtons();
});


const productShowcaseArea = document.querySelector(".productShowcaseArea");
const imagePreview = document.querySelector(".imagePreview");


document.onmousemove = ev => {
    const positionX = (window.innerWidth / -90 - ev.x) / -70;
    const positionY = ev.y / 50;
    imagePreview.style.transform = `translate(${positionX}px, ${positionY}px)`;
};




const latestReviews = document.querySelector(".latestReviews");
const fiveStarReviews = document.querySelector(".fiveStarReviews");
const fourStarReviews = document.querySelector(".fourStarReviews");
const threeStarReviews = document.querySelector(".threeStarReviews");
const twoStarReviews = document.querySelector(".twoStarReviews");
const oneStarReviews = document.querySelector(".oneStarReviews");

function closeAllReview(){
    latestReviews.style.display = "none";
    fiveStarReviews.style.display = "none";
    fourStarReviews.style.display = "none";
    threeStarReviews.style.display = "none";
    twoStarReviews.style.display = "none";
    oneStarReviews.style.display = "none";
}

function openFiveStartReviews(){
    closeAllReview();
    fiveStarReviews.style.display = "block";
}

function openFourStartReviews(){
    closeAllReview();
    fourStarReviews.style.display = "block";
}

function openThreeStartReviews(){
    closeAllReview();
    threeStarReviews.style.display = "block";
}

function openTwoStartReviews(){
    closeAllReview();
    twoStarReviews.style.display = "block";
}

function openOneStartReviews(){
    closeAllReview();
    oneStarReviews.style.display = "block";
}