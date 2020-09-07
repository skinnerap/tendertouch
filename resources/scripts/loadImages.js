const mount = document.querySelector(".gallery-img-container");
const load = document.querySelector(".load-images");

load.addEventListener('click', () => {
    mount.innerHTML = `<div class="g-row">

    <div class="g-col">

        <img src='../resources/images/1.jpg' alt='clean car' width=>
        <img src='../resources/images/2.jpg' alt='clean car'>
        <img src='../resources/images/3.jpg' alt='clean car'>
        <img src='../resources/images/4.jpg' alt='clean car'>
        <img src='../resources/images/5.jpg' alt='clean car'>

    </div>

    <div class="g-col">

        <img src='../resources/images/6.jpg' alt='clean car'>
        <img src='../resources/images/7.jpg' alt='clean car'>
        <img src='../resources/images/8.jpg' alt='clean car'>
        <img src='../resources/images/9.jpg' alt='clean car'>

    </div>

    <div class="g-col">

        <img src='../resources/images/10.jpg' alt='clean car'>
        <img src='../resources/images/11.jpg' alt='clean car'>
        <img src='../resources/images/12.jpg' alt='clean car'>
        <img src='../resources/images/13.jpg' alt='clean car'>

    </div>

    <div class="g-col">

        <img src='../resources/images/5.jpg' alt='clean car'>
        <img src='../resources/images/9.jpg' alt='clean car'>
        <img src='../resources/images/2.jpg' alt='clean car'>
        <img src='../resources/images/6.jpg' alt='clean car'>                    

    </div>

    
  </div>`;

});