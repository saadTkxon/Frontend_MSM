const filtersArea = document.querySelector('.filtersArea');

function openFiltersArea(){
    filtersArea.style.opacity = 1;
    filtersArea.style.transform = "translateX(0%)";
}

function closeFiltersArea(){
    filtersArea.style.opacity = 0;
    filtersArea.style.transform = "translateX(-110%)";
}