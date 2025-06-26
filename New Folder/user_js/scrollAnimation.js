gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.matchMedia({

    // First Product Size #1:
    "(min-width: 1700px)": function () {

        var tlOne = gsap.timeline({
            scrollTrigger: {
                trigger: ".firstProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1
            }
        })

        tlOne.to(".topProduct", {
            y: '165%',
            x: '113%',
        }, 'topProduct')

        tlOne.to(".topMovingProduct", {
            height: '700px',
            width: '282px',
            objectFit: 'contain',
            transform: 'rotate(21deg)'
        }, 'topProduct')

    },


    // First Product Size #2:
    "(max-width: 1700px) and (min-width: 1401px)": function () {

        var tlOne = gsap.timeline({
            scrollTrigger: {
                trigger: ".firstProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1,
                // markers: true,
            }
        })

        tlOne.to(".topProduct", {
            y: '171%',
            x: '109%',
        }, 'topProduct')

        tlOne.to(".topMovingProduct", {
            height: '650px',
            width: '261px',
            objectFit: 'contain',
            transform: 'rotate(21deg)'
        }, 'topProduct')

        // var tlTwo = gsap.timeline({
        //     scrollTrigger: {
        //         trigger: ".secondProductInfo",
        //         start: "0% 90%",
        //         end: "60% 50%",
        //         scrub: 1,
        //         markers: true,
        //     }
        // })

        // tlTwo.to(".displayProductImageBox>.secondProduct", {
        //     y: '173%',
        //     x: '-303%',
        //     position: 'absolute',
        //     width: '160px',
        //     height: '488px',
        // })

    },

    // First Product Size #3:
    "(min-width: 1201px) and (max-width: 1400px)": function () {

        var tlOne = gsap.timeline({
            scrollTrigger: {
                trigger: ".firstProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1,
                // markers: true,
            }
        })

        tlOne.to(".topProduct", {
            y: '180%',
            x: '111%',
        }, 'topProduct')

        tlOne.to(".topMovingProduct", {
            height: '600px',
            width: '241px',
            objectFit: 'contain',
            transform: 'rotate(21deg)'
        }, 'topProduct')

    },

    // Second Product Size #1:
    "(min-width: 1800px)": function () {

        var tlTwo = gsap.timeline({
            scrollTrigger: {
                trigger: ".secondProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1,
                // markers: true,
            }
        })

        tlTwo.to(".displayProductImageBox>.secondProduct", {
            y: '173%',
            x: `-292%`,
            position: 'absolute',
            width: '160px',
            height: '488px',
        })

    },

    // Second Product Size #2:
    "(min-width: 1701px) and (max-width: 1800px)": function () {

        var tlTwo = gsap.timeline({
            scrollTrigger: {
                trigger: ".secondProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1,
                // markers: true,
            }
        })

        tlTwo.to(".displayProductImageBox>.secondProduct", {
            y: '173%',
            x: `-24.65vw`,
            position: 'absolute',
            width: '160px',
            height: '488px',
        })

    },

    // Second Product Size #3:
    "(min-width: 1601px) and (max-width: 1700px)": function () {

        var tlTwo = gsap.timeline({
            scrollTrigger: {
                trigger: ".secondProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1,
                // markers: true,
            }
        })

        tlTwo.to(".displayProductImageBox>.secondProduct", {
            y: '173%',
            x: `-24.3vw`,
            position: 'absolute',
            width: '160px',
            height: '488px',
        })

    },

    // Second Product Size #4:
    "(min-width: 1501px) and (max-width: 1600px)": function () {

        var tlTwo = gsap.timeline({
            scrollTrigger: {
                trigger: ".secondProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1,
                // markers: true,
            }
        })

        tlTwo.to(".displayProductImageBox>.secondProduct", {
            y: '173%',
            x: `-24vw`,
            position: 'absolute',
            width: '160px',
            height: '488px',
        })

    },

    // Second Product Size #5:
    "(min-width: 1401px) and (max-width: 1500px)": function () {

        var tlTwo = gsap.timeline({
            scrollTrigger: {
                trigger: ".secondProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1,
                // markers: true,
            }
        })

        tlTwo.to(".displayProductImageBox>.secondProduct", {
            y: '173%',
            x: `-23.85vw`,
            position: 'absolute',
            width: '160px',
            height: '488px',
        })

    },

    // Second Product Size #6:
    "(min-width: 1301px) and (max-width: 1400px)": function () {

        var tlTwo = gsap.timeline({
            scrollTrigger: {
                trigger: ".secondProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1,
                // markers: true,
            }
        })

        tlTwo.to(".displayProductImageBox>.secondProduct", {
            y: '307.5%',
            x: `-63.7vw`,
            position: 'absolute',
            zIndex: '50',
            width: '130px',
            height: '397px',
        })

    },

    // Second Product Size #7:
    "(min-width: 1201px) and (max-width: 1300px)": function () {

        var tlTwo = gsap.timeline({
            scrollTrigger: {
                trigger: ".secondProductInfo",
                start: "0% 90%",
                end: "60% 50%",
                scrub: 1,
                // markers: true,
            }
        })

        tlTwo.to(".displayProductImageBox>.secondProduct", {
            y: '307.5%',
            x: `-63.7vw`,
            position: 'absolute',
            width: '130px',
            height: '397px',
        })

    },

    // Overall page animation:
    "(min-width: 1200px)": function () {

        // gsap.from(".firstProductInfo>.innerSpacing>h1, .firstProductInfo>.innerSpacing>p", {
        //     stagger: 0.5,
        //     opacity: 0,
        //     duration: 0.75,
        //     scrollTrigger: {
        //         trigger: ".firstProductInfo",
        //         start: "0% 50%",
        //         end: "0% 20%",
        //         // markers: true
        //     }
        // })

        gsap.from(".firstProductInfoDets>.oneFirstProductInfoDet", {
            stagger: 0.35,
            x: 75,
            opacity: 0,
            duration: 0.75,
            scrollTrigger: {
                trigger: ".firstProductInfoPlusDisplay",
                start: "0% 75%",
                end: "0% 20%",
                // markers: true
            }
        })

        // gsap.from(".displayProductsHere>.oneDisplayProduct", {
        //     stagger: 0.35,
        //     y: 75,
        //     opacity: 0,
        //     duration: 0.75,
        //     scrollTrigger: {
        //         trigger: ".displayProductsHere",
        //         start: "0% 100%",
        //         end: "0% 60%",
        //         // markers: true
        //     }
        // })

        // gsap.from(".heroSectionOne>.innerSpacing>h1, .heroSectionOne>.innerSpacing>p", {
        //     stagger: 0.5,
        //     opacity: 0,
        //     duration: 0.75,
        //     scrollTrigger: {
        //         trigger: ".heroSectionOne",
        //         start: "0% 50%",
        //         end: "0% 20%",
        //         // markers: true
        //     }
        // })

        gsap.from(".heroSectionDets>.oneHeroSectionDet", {
            stagger: 0.35,
            x: 75,
            opacity: 0,
            duration: 0.75,
            scrollTrigger: {
                trigger: ".heroSectionDets",
                start: "0% 85%",
                end: "0% 20%",
                // markers: true
            }
        })

        // gsap.from(".reviewsScreen>.innerSpacing>h1, .reviewsScreen>.innerSpacing>p", {
        //     stagger: 0.5,
        //     opacity: 0,
        //     duration: 0.75,
        //     scrollTrigger: {
        //         trigger: ".reviewsScreen",
        //         start: "0% 50%",
        //         end: "0% 20%",
        //         // markers: true
        //     }
        // })

        gsap.from(".reviewsHere>.oneReview", {
            stagger: 0.35,
            y: 75,
            opacity: 0,
            duration: 0.75,
            scrollTrigger: {
                trigger: ".reviewsHere",
                start: "0% 85%",
                end: "0% 20%",
                // markers: true
            }
        })

        gsap.from(".footer>div", {
            stagger: 0.35,
            y: 75,
            opacity: 0,
            duration: 0.75,
            scrollTrigger: {
                trigger: ".footerArea",
                start: "0% 85%",
                end: "0% 20%",
                // markers: true
            }
        })

    },


    // all 
    "all": function () {
        // ScrollTriggers created here aren't associated with a particular media query,
        // so they persist.
    }

});


