// package-name
// package-price
// package-text
// package-choice
/****Important Note*******/
/*
    If package-choice option text values change in the html document
    they must be adjusted accordingly in the eventListener loop
 */

let packageName = document.querySelector('.package-name');
let packagePrice = document.querySelector('.package-price');
let packageText = document.querySelector('.package-text');
let packageChoice = document.querySelectorAll('.package-choice');

packageChoice.forEach(el => {
    el.addEventListener('click', () => {
        console.log(el.textContent.trim());
        if(document.querySelector('._orderContainer') !== null) {
            document.querySelector('._orderContainer').innerHTML = '';
        }


        if(el.textContent.trim() === 'General Wash') {
            console.log('hi');
            packageName.textContent = el.textContent;
            packagePrice.textContent = '$40 (Car) / $60 (Truck/SUV)';
            packageText.innerHTML = `
                <h5 class='user-packer-choice'> Select Vehicle </h5>

                <a href='#customer-schedule'><button class='btn' id='Car'>Car</button></a>
                <a href='#customer-schedule'><button class='btn' id='Truck'>Truck</button></a>
                <a href='#customer-schedule'><button class='btn' id='SUV'>SUV / Van</button></a>

                <li class='package-item'>
                    Interior Vacuum
                </li>
                <li class='package-item'>
                    General Interior Wiping
                </li>
                <li class='package-item'>
                    Cupholder's
                </li>
                <li class='package-item'>
                    Doorjams and Molding
                </li>
                <li class='package-item'>
                    Interior Windows (Tint Safe)
                </li>
                <li class='package-item'>
                    Exterior Hand Wash
                </li>
                <li class='package-item'>
                    Exterior Hand Dried
                </li>
                <li class='package-item'>
                    Chrome Washed
                </li>
                <li class='package-item'>
                    Rims / Tire Dressings
                </li>
                <li class='package-item'>
                    Wheel Wells
                </li>
                <li class='package-item'>
                    Windows
                </li>
                <h4 class='wantAddons'></h4>

                <form class='addOn-form' id='addOn-form-generalwash'></form>
            `;
        } else if(el.textContent.trim() == 'Exterior Detail') {
            packageName.textContent = el.textContent;
            packagePrice.textContent = '$100 (Car) / $125 (Truck/SUV)';
            packageText.innerHTML = `
                <h5 class='user-packer-choice'> Select Vehicle </h5>

                <button class='btn' id='Car'>Car</button>
                <button class='btn' id='Truck'>Truck</button>
                <button class='btn' id='SUV'>SUV / Van</button>
                <li class='package-item'>
                    <em>General Wash Package</em> + the following:
                </li>
                <li class='package-item'>
                    Hand Wax and Buff of Exterior
                </li>
                <li class='package-item'>
                    Chrome Shined
                </li>
                <li class='package-item'>
                    Rims Shined
                </li>
                <li class='package-item'>
                    Engine Compartment Cleaned
                </li>
                <h4 class='wantAddons'></h4>

                <form class='addOn-form' id='addOn-form-exteriordetail'></form>
            `;
        } else if(el.textContent.trim() == 'Interior Detail') {
            packageName.textContent = el.textContent;
            packagePrice.textContent = '$100 (Car) / $125 (Truck/SUV)';
            packageText.innerHTML = `
                <h5 class='user-packer-choice'> Select Vehicle </h5>

                <button class='btn' id='Car'>Car</button>
                <button class='btn' id='Truck'>Truck</button>
                <button class='btn' id='SUV'>SUV / Van</button>
                <li class='package-item'>
                    <em>General Wash</em> + the following:
                </li>
                <li class='package-item'>
                    Clean and Detail All Surfaces
                </li>
                <li class='package-item'>
                    Armor All Plastic Moldings
                </li>
                <li class='package-item'>
                    Clean and Condition Leather
                </li>
                <li class='package-item'>
                    Shampoo Carpets and Seats
                </li>
                <h4 class='wantAddons'></h4>

                <form class='addOn-form' id='addOn-form-interiordetail'></form>
            `;
        } else if(el.textContent.trim() == 'Full Detail') {
            packageName.textContent = el.textContent;
            packagePrice.textContent = '$160 (Car) / $180 (Truck/SUV)';
            packageText.innerHTML = `
                <h5 class='user-packer-choice'> Select Vehicle </h5>

                <button class='btn' id='Car'>Car</button>
                <button class='btn' id='Truck'>Truck</button>
                <button class='btn' id='SUV'>SUV / Van</button>
                <li class='package-item'>
                    <em>General Wash Package</em> + the following:
                </li>
                <li class='package-item'>
                    Hand Wax and Buff of Exterior
                </li>
                <li class='package-item'>
                    Chrome Shined
                </li>
                <li class='package-item'>
                    Rims Shined
                </li>
                <li class='package-item'>
                    Engine Compartment Cleaned
                </li>
                <li class='package-item'>
                    Clean and Detail All Surfaces
                </li>
                <li class='package-item'>
                    Armor All Plastic Moldings
                </li>
                <li class='package-item'>
                    Clean and Condition Leather
                </li>
                <li class='package-item'>
                    Shampoo Carpets and Seats
                </li>

                <!-- THIS PACKAGE HAS NO ADDONS -->

                <form class='addOn-form' id='addOn-form-fulldetail'></form>
            `;
        }
    });
})


