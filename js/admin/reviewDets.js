const viewReviewArea = document.querySelector('.viewReviewArea');


function openViewReviewArea(){
    viewReviewArea.style.opacity = 1;
    viewReviewArea.style.transform = "translateY(0%)";
}

function closeViewReviewArea(){
    viewReviewArea.style.opacity = 0;
    viewReviewArea.style.transform = "translateY(110%)";
}