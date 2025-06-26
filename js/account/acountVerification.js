const inputs = document.querySelectorAll('.otp-input input');


inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length > 1) {
            e.target.value = e.target.value.slice(0, 1);
        }
        if (e.target.value.length === 1) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    input.addEventListener('keydown', (e) => {
        
        if (e.key === 'Backspace' && !e.target.value) {
            if (index > 0) {
                inputs[index - 1].focus();
            }
        }
        if (e.key === 'e') {
            e.preventDefault();
        }
    });
});



