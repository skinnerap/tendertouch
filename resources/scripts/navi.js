let naviBox = document.querySelector('.navi-box');
let naviBtn = document.querySelector('.navi-btn');
let homePage = document.querySelector('.home-page');
let homeBtn = document.querySelectorAll('.navi-link');
const mainBtn = document.querySelector('.main-btn');

naviBtn.addEventListener('click', () => {
    naviBox.style.display = 'block';
    homePage.style.display = 'none';
    naviBtn.style.display = 'none';
    let naviExit = document.querySelector('.navi-exit');
    naviExit.style.display = 'inline-block';
    naviExit.addEventListener('click', () => {

        if(document.querySelector('._orderContainer') !== null) {
            document.querySelector('._orderContainer').innerHTML = '';
        }

        naviBox.style.display = 'none';
        homePage.style.display = 'block';
        naviBtn.style.display = 'inline-block';
        naviExit.style.display = 'none';
    });
    homeBtn.forEach(link => {
        link.addEventListener('click', () => {

            if(document.querySelector('._orderContainer') !== null) {
                document.querySelector('._orderContainer').innerHTML = '';
            }

            naviBox.style.display = 'none';
            homePage.style.display = 'block';
            naviBtn.style.display = 'inline-block';
            naviExit.style.display = 'none';
        });
    });
});

mainBtn.addEventListener('click', () => {
    console.log('clicked');
    if(document.querySelector('._orderContainer') !== null) {
        document.querySelector('._orderContainer').innerHTML = '';
    }
})