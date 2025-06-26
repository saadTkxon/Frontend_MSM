const orderDetailsArea = document.querySelector('.orderDetailsArea');
const cancelOrderArea = document.querySelector('.cancelOrderArea');

function openOrderDetails(){
    orderDetailsArea.style.opacity = 1;
    orderDetailsArea.style.transform = "translateX(0%)";
}

function closeOrderDetails(){
    orderDetailsArea.style.opacity = 0;
    orderDetailsArea.style.transform = "translateX(110%)";
}

function openCancelOrder(){
    closeOrderDetails();
    cancelOrderArea.style.opacity = 1;
    cancelOrderArea.style.transform = "translateX(0%)";
}

function closeCancelOrder(){
    cancelOrderArea.style.opacity = 0;
    cancelOrderArea.style.transform = "translateX(110%)";
}