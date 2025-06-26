const toBeReviewedOrdersPack = document.querySelector(".toBeReviewedOrdersPack");
const reviewedOrdersPack = document.querySelector(".reviewedOrdersPack");

const toBeReviewedPackBtn = document.querySelector(".toBeReviewedPackBtn");
const reviewedPackBtn = document.querySelector(".reviewedPackBtn");


function hideAllPacks(){
    toBeReviewedOrdersPack.style.display = "none";
    reviewedOrdersPack.style.display = "none";
}

function unStyleAllButtons(){
    toBeReviewedPackBtn.ariaSelected = "false";
    reviewedPackBtn.ariaSelected = "false";
}

function opentoBeReviewedOrdersPack(){
    hideAllPacks();
    unStyleAllButtons();
    toBeReviewedOrdersPack.style.display = "flex";
    toBeReviewedPackBtn.ariaSelected = "true";
}

function openReviewedOrdersPack(){
    hideAllPacks();
    unStyleAllButtons();
    reviewedOrdersPack.style.display = "flex";
    reviewedPackBtn.ariaSelected = "true";
}


opentoBeReviewedOrdersPack();