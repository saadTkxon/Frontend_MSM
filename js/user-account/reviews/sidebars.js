const writeOrEditReviewArea = document.querySelector('.writeOrEditReviewArea');
const viewReviewArea = document.querySelector('.viewReviewArea');

function openWriteOrEditReviewArea12(){
    writeOrEditReviewArea.style.opacity = 1;
    writeOrEditReviewArea.style.transform = "translateX(0%)";
}

function closeWriteOrEditReviewArea12(){

    const viewArea = document.querySelector('.viewReviewArea');
    
    // Clear localStorage for review ID
    localStorage.removeItem("currentReviewId");

    
    writeOrEditReviewArea.style.opacity = 0;
    writeOrEditReviewArea.style.transform = "translateX(110%)";
}

function openViewReviewArea(){
    viewReviewArea.style.opacity = 1;
    viewReviewArea.style.transform = "translateX(0%)";
}

function closeViewReviewArea(){
    viewReviewArea.style.opacity = 0;
    viewReviewArea.style.transform = "translateX(110%)";
}

function openEditReviewArea(){
    closeViewReviewArea();
    openWriteOrEditReviewArea12();
}