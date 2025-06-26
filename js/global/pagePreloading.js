const pagePreloadingElement = document.querySelector('.pagePreloading');

function hidePagePreloading() {
    pagePreloadingElement.style.opacity = "0";
    setTimeout(() => {
        pagePreloadingElement.style.display = "none";
    }, 500);
}