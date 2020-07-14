const covidBox = document.querySelector('.covid-box');
const covidBtn = document.querySelector('.covid-btn');

covidBtn.addEventListener('click', () => {
    const covidExit = document.querySelector('.covid-exit-box');
    covidBox.classList.add('swing-in-top-fwd');
    covidBox.style.display = 'block';
    covidExit.addEventListener('click', () => {
        covidBox.style.display = 'none';
    });
});

