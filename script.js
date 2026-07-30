const linesSvg = document.getElementById('linesSvg');
const introText = document.getElementById('introText');
const scrollHint = document.getElementById('scrollHint');
const centerText = document.getElementById('centerText');
const topNav = document.getElementById('topNav');
const bottomBar = document.getElementById('bottomBar');
const fadeTop = document.getElementById('fadeTop');
const fadeBottom = document.getElementById('fadeBottom');

const maxScroll = window.innerHeight;

window.addEventListener('scroll', () => {
    let scrollTop = window.scrollY;
    let progress = Math.min(scrollTop / maxScroll, 1);

    // Скрываем начальную фразу и подсказку скролла
    introText.style.opacity = 1 - progress * 2.5;
    scrollHint.style.opacity = 1 - progress * 3;

    linesSvg.style.transform = `scaleX(${2.5 - progress * 1.5})`;
    linesSvg.style.opacity = progress;

    let fadeIn = Math.max(0, (progress - 0.3) * 1.4);
    centerText.style.opacity = fadeIn;
    fadeTop.style.opacity = fadeIn;
    fadeBottom.style.opacity = fadeIn;

    if (progress > 0.4) {
        let uiProgress = (progress - 0.4) * 1.6;
        topNav.style.opacity = uiProgress;
        topNav.style.transform = `translateY(0)`;
        topNav.style.pointerEvents = 'auto';

        bottomBar.style.opacity = uiProgress;
        bottomBar.style.transform = `translateY(0)`;
        bottomBar.style.pointerEvents = 'auto';
    } else {
        topNav.style.opacity = 0;
        topNav.style.transform = `translateY(-20px)`;
        topNav.style.pointerEvents = 'none';

        bottomBar.style.opacity = 0;
        bottomBar.style.transform = `translateY(20px)`;
        bottomBar.style.pointerEvents = 'none';
    }
});