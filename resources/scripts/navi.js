let naviBox = document.querySelector('.navi-box');
let naviBtn = document.querySelector('.navi-btn');
let homePage = document.querySelector('.home-page');
let homeBtn = document.getElementById('home-link');

naviBtn.addEventListener('click', () => {
    naviBox.style.display = 'block';
    homePage.style.display = 'none';
    naviBtn.style.display = 'none';
    let naviExit = document.querySelector('.navi-exit');
    naviExit.style.display = 'inline-block';
    naviExit.addEventListener('click', () => {
        naviBox.style.display = 'none';
        homePage.style.display = 'block';
        naviBtn.style.display = 'inline-block';
        naviExit.style.display = 'none';
    });
    homeBtn.addEventListener('click', () => {
        naviBox.style.display = 'none';
        homePage.style.display = 'block';
        naviBtn.style.display = 'inline-block';
        naviExit.style.display = 'none';
    });
});