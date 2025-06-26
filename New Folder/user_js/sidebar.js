const sidebar = document.querySelector('.sidebar');

function openSidebar(){
    sidebar.style.opacity = 1;
    sidebar.style.transform = "translateX(0%)";
}

function closeSidebar(){
    sidebar.style.opacity = 0;
    sidebar.style.transform = "translateX(110%)";
}