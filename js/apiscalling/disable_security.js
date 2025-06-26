
// Disable right-click
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

// Disable common dev tools & copy/paste keys
document.addEventListener('keydown', function (e) {
    // F12
    if (e.keyCode === 123) {
        e.preventDefault();
    }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    if ((e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
        e.preventDefault();
    }
    // Ctrl+U
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
        e.preventDefault();
    }
    // Ctrl+C / Ctrl+V / Ctrl+X
    if (e.ctrlKey && ['C', 'V', 'X'].includes(e.key.toUpperCase())) {
        e.preventDefault();
    }
});

// Disable copy, cut, and paste via mouse
document.addEventListener('copy', function (e) {
    e.preventDefault();
});
document.addEventListener('cut', function (e) {
    e.preventDefault();
});
document.addEventListener('paste', function (e) {
    e.preventDefault();
});

