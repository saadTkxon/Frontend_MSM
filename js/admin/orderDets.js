const inProcessOrderDets = document.querySelector('.inProcessOrderDets');
const shippedOrderDets = document.querySelector('.shippedOrderDets');
const deliveredOrderDets = document.querySelector('.deliveredOrderDets');
const failedDeliveryOrderDets = document.querySelector('.failedDeliveryOrderDets');
const cancelledOrderDets = document.querySelector('.cancelledOrderDets');
const returnedOrderDets = document.querySelector('.returnedOrderDets');
const cancelOrderArea = document.querySelector('.cancelOrderArea');


function openInProcessOrderDets(){
    inProcessOrderDets.style.opacity = 1;
    inProcessOrderDets.style.transform = "translateY(0%)";
}

function closeInProcessOrderDets(){
    inProcessOrderDets.style.opacity = 0;
    inProcessOrderDets.style.transform = "translateY(110%)";
}

function openShippedOrderDets(){
    shippedOrderDets.style.opacity = 1;
    shippedOrderDets.style.transform = "translateY(0%)";
}

function closeShippedOrderDets(){
    shippedOrderDets.style.opacity = 0;
    shippedOrderDets.style.transform = "translateY(110%)";
}

function openDeliveredOrderDets(){
    deliveredOrderDets.style.opacity = 1;
    deliveredOrderDets.style.transform = "translateY(0%)";
}

function closeDeliveredOrderDets(){
    deliveredOrderDets.style.opacity = 0;
    deliveredOrderDets.style.transform = "translateY(110%)";
}

function openFailedDeliveryOrderDets(){
    failedDeliveryOrderDets.style.opacity = 1;
    failedDeliveryOrderDets.style.transform = "translateY(0%)";
}

function closeFailedDeliveryOrderDets(){
    failedDeliveryOrderDets.style.opacity = 0;
    failedDeliveryOrderDets.style.transform = "translateY(110%)";
}

function openCancelledOrderDets(){
    cancelledOrderDets.style.opacity = 1;
    cancelledOrderDets.style.transform = "translateY(0%)";
}

function closeCancelledOrderDets(){
    cancelledOrderDets.style.opacity = 0;
    cancelledOrderDets.style.transform = "translateY(110%)";
}

function openReturnedOrderDets(){
    returnedOrderDets.style.opacity = 1;
    returnedOrderDets.style.transform = "translateY(0%)";
}

function closeReturnedOrderDets(){
    returnedOrderDets.style.opacity = 0;
    returnedOrderDets.style.transform = "translateY(110%)";
}

function openCancelOrder(){
    cancelOrderArea.style.opacity = 1;
    cancelOrderArea.style.transform = "translateY(0%)";
}

function closeCancelOrder(){
    cancelOrderArea.style.opacity = 0;
    cancelOrderArea.style.transform = "translateY(110%)";
}