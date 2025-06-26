gsap.to('.preloader>.spinner', {
    opacity: 0.55,
    delay: 3,
    duration: 0.5
})

document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener('load', preloading);
});

function preloading() {

    const key = "loadedFlag";
    const sessionValue = sessionStorage.getItem(key);

    if (sessionValue === "loadedOnce") {
        basicPreloading();
    } else {
        advancedPreloading();
        sessionStorage.setItem(key, 'loadedOnce');
    }
}

function basicPreloading() {

    var tl = gsap.timeline();

    tl.to('.preloader>.spinner', {
        opacity: 0,
        delay: 4,
        duration: 0.5
    })

    tl.to('.preloader>svg', {
        opacity: 0,
        duration: 0.35
    })

    tl.to('.preloader', {
        opacity: 0,
        duration: 0.75,
        display: 'none'
    })

}

function advancedPreloading() {

    var tl = gsap.timeline();

    tl.to('.preloader>.spinner', {
        opacity: 0,
        delay: 4,
        duration: 0.5
    })

    tl.to('.preloader>svg', {
        opacity: 0,
        duration: 0.35
    })

    tl.to('.preloader', {
        opacity: 0,
        duration: 0.5,
        display: 'none'
    })

    tl.from('.navbar', {
        opacity: 0,
        y: -75,
        delay: 1,
        duration: 0.5
    }, 'togetherOne')

    tl.from('.productDisplay', {
        opacity: 0,
        delay: 0.5,
        duration: 1
    }, 'togetherOne')

    tl.from('.textWithImage>h3, .backWriting>h2, .backWriting>h1', {
        stagger: 0.35,
        opacity: 0,
        duration: 0.75
    })

    tl.from('.textWithImage>img', {
        opacity: 0,
        y: 50,
        scale: 0.1,
        duration: 1.5,
        ease: "elastic.out(1,0.4)",
    })

     tl.from('.topSocialLinks>a', {
        stagger: 0.27,
        opacity: 0,
        x: 50,
        duration: 0.27
    }, 'togetherTwo')

    tl.from('.mainScreenPhoto', {
        opacity: 0,
        x: 100,
        y: 50,
        duration: 1,
        
    }, 'togetherTwo')

}