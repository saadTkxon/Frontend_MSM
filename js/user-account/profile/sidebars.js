const editAddressArea = document.querySelector('.editAddressArea');
const changePasswordArea = document.querySelector('.changePasswordArea');
const changeAddressArea = document.querySelector('.changeAddressArea');
const addAddressArea = document.querySelector('.addAddressArea');

function openEditAddress(){
    editAddressArea.style.opacity = 1;
    editAddressArea.style.transform = "translateX(0%)";
}

function closeEditAddress(){
    editAddressArea.style.opacity = 0;
    editAddressArea.style.transform = "translateX(110%)";
}

function openChangePassword(){
    closeEditAddress()
    changePasswordArea.style.opacity = 1;
    changePasswordArea.style.transform = "translateX(0%)";
}

function closeChangePassword(){
    changePasswordArea.style.opacity = 0;
    changePasswordArea.style.transform = "translateX(110%)";
}

function openChangeAddress(){
    changeAddressArea.style.opacity = 1;
    changeAddressArea.style.transform = "translateX(0%)";
}

function closeChangeAddress(){
    changeAddressArea.style.opacity = 0;
    changeAddressArea.style.transform = "translateX(110%)";
}

function openAddAddress(){
    addAddressArea.style.opacity = 1;
    addAddressArea.style.transform = "translateX(0%)";
}

function closeAddAddress(){
    addAddressArea.style.opacity = 0;
    addAddressArea.style.transform = "translateX(110%)";
}