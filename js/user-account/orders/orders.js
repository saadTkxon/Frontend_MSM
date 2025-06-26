const allOrdersPack = document.querySelector(".allOrdersPack");
const toShipOrdersPack = document.querySelector(".toShipOrdersPack");
const toReceiveOrdersPack = document.querySelector(".toReceiveOrdersPack");
const deliveredOrdersPack = document.querySelector(".deliveredOrdersPack");
const cancelledOrdersPack = document.querySelector(".cancelledOrdersPack");

const allOrdersPackBtn = document.querySelector(".allOrdersPackBtn");
const toShipOrdersPackBtn = document.querySelector(".toShipOrdersPackBtn");
const toReceiveOrdersPackBtn = document.querySelector(".toReceiveOrdersPackBtn");
const deliveredOrdersPackBtn = document.querySelector(".deliveredOrdersPackBtn");
const cancelledOrdersPackBtn = document.querySelector(".cancelledOrdersPackBtn");


function hideAllPacks(){
    allOrdersPack.style.display = "none";
    toShipOrdersPack.style.display = "none";
    toReceiveOrdersPack.style.display = "none";
    deliveredOrdersPack.style.display = "none";
    cancelledOrdersPack.style.display = "none";
}

function unStyleAllButtons(){
    allOrdersPackBtn.ariaSelected = "false";
    toShipOrdersPackBtn.ariaSelected = "false";
    toReceiveOrdersPackBtn.ariaSelected = "false";
    deliveredOrdersPackBtn.ariaSelected = "false";
    cancelledOrdersPackBtn.ariaSelected = "false";
}

function openAllOrdersPack(){
    hideAllPacks();
    unStyleAllButtons();
    allOrdersPack.style.display = "flex";
    allOrdersPackBtn.ariaSelected = "true";
}

function openToShipOrdersPack(){
    hideAllPacks();
    unStyleAllButtons();
    toShipOrdersPack.style.display = "flex";
    toShipOrdersPackBtn.ariaSelected = "true";
}

function openToReceiveOrdersPack(){
    hideAllPacks();
    unStyleAllButtons();
    toReceiveOrdersPack.style.display = "flex";
    toReceiveOrdersPackBtn.ariaSelected = "true";
}

function openDeliveredOrdersPack(){
    hideAllPacks();
    unStyleAllButtons();
    deliveredOrdersPack.style.display = "flex";
    deliveredOrdersPackBtn.ariaSelected = "true";
}

function openCancelledOrdersPack(){
    hideAllPacks();
    unStyleAllButtons();
    cancelledOrdersPack.style.display = "flex";
    cancelledOrdersPackBtn.ariaSelected = "true";
}

openAllOrdersPack();