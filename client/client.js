const tAdjustment = 1; // 0 is the lowest setting

const container = document.querySelector('._container');
const apptContainer = document.querySelector('._apptContainer');
const orderContainer = document.querySelector('._orderContainer');

/******************* ROUTES *****************************/
const API_URL_PACKAGES = 'http://localhost:5000/packages';
const API_URL_ADDONS = 'http://localhost:5000/addons';
const API_URL_SETTINGS = 'http://localhost:5000/settings';
const API_URL_APPTSLOTS = 'http://localhost:5000/apptSlots';
const API_URL_JOBS = 'http://localhost:5000/jobs';
const API_URL_PRICES = 'http://localhost:5000/stripe-price';
const API_URL_PAYMENTINTENT = 'http://localhost:5000/create-payment-intent';

let _date, _hour, _package, _addonArray;


/********************* DATA FROM ADMIN ***************************/

// GET ALL PACKAGES
async function getPackages() {
    let arr = [];

    await fetch(API_URL_PACKAGES).then(res => res.json()).then(packages => {
        packages.forEach(p => {
            arr.push(p);
        })
    })

    return arr;
}

// GET ALL ADD-ONS
async function getAddons() {
    let arr = [];

    await fetch(API_URL_ADDONS).then(res => res.json()).then(addons => {
        addons.forEach(a => {
            arr.push(a);
        })
    })

    return arr;
}

// GET SETTINGS
async function getSettings() {
    let travelBuffer = null;
    await fetch(API_URL_SETTINGS).then(res => res.json()).then(settings => {
        travelBuffer = settings[0].travelBuffer;
    })

    return travelBuffer;
}

async function getInteriorAddons() {
    let arr = [];

    await fetch(API_URL_ADDONS).then(res => res.json()).then(addons => {
        addons.forEach(a => {
            arr.push(a);
        })
    });

    for(let i=1; i<=arr.length; i++) {
        arr.pop();
    }

    return arr;
}

async function getExteriorAddons() {
    let arr = [];

    await fetch(API_URL_ADDONS).then(res => res.json()).then(addons => {
        addons.forEach(a => {
            arr.push(a);
        })
    });

    for(let i = 0; i <= 2; i++) {
        arr.shift();
    }

    return arr;
}





/*********************** APPOINTMENT SLOTS *****************************/

// GET APPOINTMENT SLOTS
async function getAppointments() {
    let arr = [];

    await fetch(API_URL_APPTSLOTS)
        .then(res => res.json())
        .then(appointments => {
            appointments.forEach(a => {
                arr.push(a);
            });
        });

    
    return arr;
}

getAppointments();

// GET APPOINTMENTS SLOTS FROM A DATE
async function getAppointmentsFromDate(date) {
    let arr = [];

    await fetch(API_URL_APPTSLOTS + '/' + date)
        .then(res => res.json())
        .then(appointments => {
            appointments.forEach(a => {
                arr.push(a);
            });
        });

    console.log(arr);

    let res = [];
    for(let i=0; i<arr.length; i++) {
        res.push(arr[i]);
    }
    return res;
}

// GET A SPECIFIC APPOINTMENT SLOT
async function getAppointmentSlot(date, hour) {

    let res = '';

    await fetch(API_URL_APPTSLOTS + '/' + date + '/' + hour)
        .then(res => res.json()).then(appointment => {
            res = appointment[0];
        });

    return res;

}

// GET THE CURRENT CURRENCY OF AN APPOINTMENT SLOT
async function getAppointmentSlotConcurrency(date, hour) {

    const appointment = await getAppointmentSlot(date, hour);

    // Convert back into string before updating into DB
    return parseInt(appointment.concurrency);

}

// UPDATES THE CONCURRENCY OF AN APPOINTMENT SLOT WHEN BOOKED
async function decrementAppointmentSlot(date, hour) {

    const appointment = await getAppointmentSlot(date, hour);

    // Important Note: The logic for decrementing the appointments concurrency is on the 
    //                 server side. Therefore I set the passed concurrency to '1' if the 
    //                 appointment slot is already at 1 or less. This is all a means to 
    //                 never allow an appointment's concurrency to drop below 0.

    let newConcurrency = '';

    if(parseInt(appointment.concurrency) < 1) {
        newConcurrency = '1';
    } else newConcurrency = appointment.concurrency;
    
    try {
        await fetch(API_URL_APPTSLOTS + '/' + date + '/' + hour + '/' + newConcurrency, {
            method: 'PATCH'
        });
    } catch {
        console.log('Error: Could not update appointment slot');
    }   

}

// UPDATES THE CONCURRENCY ON A RANGE OF APPOINTMENT SLOTS WHEN BOOKED
async function decrementAppointmentSlotRange(date, startHour, endHour) {

    let settingStartHour = null;
    let settingEndHour = null;
    await fetch(API_URL_SETTINGS).then(res => res.json()).then(settings => {
        settingStartHour = parseFloat(settings[0].apptStartTime);
        settingEndHour = parseFloat(settings[0].apptEndTime);

        console.log(settingStartHour);
        console.log(settingEndHour);
    });

    if(endHour > settingEndHour) {
        endHour = settingEndHour;
    } else if(startHour < settingStartHour) {
        startHour = settingStartHour;
    }

    console.log('startHour: ' + startHour);
    console.log('endHour: ' + endHour);

    for(let currentHour = parseInt(startHour); currentHour <= parseInt(endHour); currentHour += .5) {

        await decrementAppointmentSlot(date, currentHour);

    }

}




/*************************** PUBLIC VIEW ******************************/

async function displayAppointmentsFromDate(date, package, addonArray) {

    const appointments = await getAppointmentsFromDate(date);
    let html = '';
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getUTCMonth();
    if(thisMonth === 0) thisMonth = 12;
    const thisDay = today.getUTCDate();
    const thisDate = thisYear.toString() + '-' + thisMonth.toString() + '-' + thisDay.toString();
    const currentTime = today.toTimeString();


    const splitDate = date.split('-');
    const convertedMonth = parseInt(splitDate[1]) - 1;
    const convertedDay = parseInt(splitDate[2]) < 10 ? parseInt(splitDate[2]) : parseInt(splitDate[2]);
    const convertedDate = splitDate[0] + '-' + convertedMonth.toString() + '-' + convertedDay; 

    const displayDateObj = new Date(splitDate[0], parseInt(splitDate[1]) - 1, splitDate[2]);
    const displayDateString = displayDateObj.toString();
    const splitDisplayDate = displayDateString.split(' ');
    const displayDate = splitDisplayDate[0] + ' ' + splitDisplayDate[1] + ' ' +  splitDisplayDate[2] + ', ' + splitDisplayDate[3];

    html += `<div class='public-appt-date'>${displayDate}</div>`;


    if(parseInt(splitDate[0]) <= thisYear) {
        if((parseInt(splitDate[1]) - 1) <= thisMonth) {
            if(parseInt(splitDate[2]) < thisDay) {
                html += `<div class='public-appt-date'>Sorry, we can't time travel...yet!</div>`;
                apptContainer.innerHTML = html;
                return;
            }
        }
    }

    let startIndex = null;

    // Defines a starting index for displaying appointment slots when displaying today's appt slots
    for(let i = 0; i < appointments.length; i++) {
        
        // THIS ALLOWS THE SOFTWARE TO ADJUST HOW CLOSE TO THE CURRENT TIME
        // THE ADMIN WOULD LIKE TO ALLOW APPOINTMENTS TO BE BOOKED WHEN 
        // USERS ARE VIEWING APPOINTMENTS ON THE CURRENT DAY
        if(parseInt(appointments[i].hour) == parseInt(currentTime) + 1) {
            startIndex = i;
        }

    }

    // Only show appointment slots after the current time
    if(convertedDate === thisDate) {

        console.log("INFO...")
        console.log(parseInt(appointments[startIndex]));
        console.log(parseInt(currentTime));
    
        if(parseInt(appointments[startIndex]) >= parseInt(currentTime) || startIndex === null) {
            // Too Late: No Appointments to Show Today at This Time
            html += `<div class='public-appt-date'>No Appointments Available...</div>`;

        } else {
            // Show appointment slots starting at start index
            for(let i = startIndex; i < appointments.length; i++) {

                let hour = parseFloat(appointments[i].hour);
    
                // AM Hours
                if(hour < 12) {
                    // Convert the .5 to :30 + 'AM'
                    if(hour % 1 !== 0) {
                        hour = (parseInt(hour) / 1).toString() + ':30 AM';
        
                    // Add the :00 + 'AM'
                    } else {
                        hour = hour.toString() + ':00 AM';
        
                    }
                // PM Hours
                } else {
                    if(hour >= 13) {
                        hour = hour - 12;
                    }
                    
                    // Convert the .5 to :30 + 'PM'
                    if(hour % 1 !== 0) {
                        hour = (parseInt(hour) / 1).toString() + ':30 PM';
        
                    // Add the :00 + 'PM'
                    } else {
                        hour = hour.toString() + ':00 PM';
                
                    }
                }

                if(appointments[i].concurrency >= 1) {
                    html += `<a href='#order-link'><div class='public-appt-btn' id='${appointments[i].hour} ${appointments[i].date}'>${hour}</div></a>`;
                }
                
                
            }
        }
    // Show all appointments of the day
    } else {
        appointments.forEach(a => {
            let hour = parseFloat(a.hour);
    
            // AM Hours
            if(hour < 12) {
                // Convert the .5 to :30 + 'AM'
                if(hour % 1 !== 0) {
                    hour = (parseInt(hour) / 1).toString() + ':30 AM';
    
                // Add the :00 + 'AM'
                } else {
                    hour = hour.toString() + ':00 AM';
    
                }
            // PM Hours
            } else {
                if(hour >= 13) {
                    hour = hour - 12;
                }
                
                // Convert the .5 to :30 + 'PM'
                if(hour % 1 !== 0) {
                    hour = (parseInt(hour) / 1).toString() + ':30 PM';
    
                // Add the :00 + 'PM'
                } else {
                    hour = hour.toString() + ':00 PM';
            
                }
            }

            if(a.concurrency >= 1) {
                html += `<a href='#order-link'><div class='public-appt-btn' id='${a.hour} ${a.date}'>${hour}</div></a>`;
            }
    
        });

    }

    if(html === `<div class='public-appt-date'>${displayDate}</div>`) {
        html += `<div class='public-appt-date'>No Appointments Available...</div>`;
    }

    apptContainer.innerHTML = html;

    insertAppointmentButtonListeners(package, addonArray);

}

function displayCalendar(package, addonArray) {

    container.innerHTML = `<form class="user-date-form">
        <label for="user-date-selection" id='get-appts' class="admin-package-prop">Select a Date</label>
        <input type="date" id="user-date-selection" name="user-date-selection" class="user-date-input">
        <input type="submit" value="Get Open Appointments" id="user-date-submit" class="user-btn">
    </form>`;

    document.querySelector('#user-date-submit').addEventListener('click', (event) => {
        event.preventDefault();
        const formData = document.querySelector('.user-date-form');
        const form = new FormData(formData);
        const date = form.get('user-date-selection');
        
        displayAppointmentsFromDate(date, package, addonArray);
    })

}

function clearClient() {
    container.innerHTML = '';
}



// Returns an Array of All Packages 
async function getPackages() {
    // Array to push package objects into
    let arr = [];

    await fetch(API_URL_PACKAGES).then(res => res.json()).then(packages => {
        packages.forEach(p => {
            arr.push(p);
        });
    });

    return arr;
}


// Event Listener for Package Clicks
const p1 = document.querySelector('#package-1');
const p2 = document.querySelector('#package-2');
const p3 = document.querySelector('#package-3');
const p4 = document.querySelector('#package-4');

function collectUpgrades() {

    let addOns = [];

    const addonChoices = document.querySelectorAll('.addOn-box');
                
        addonChoices.forEach(a => {

            if(a.checked) {

                addOns.push(a);

            }

    });

    return addOns;

}

async function getAddonsFromDb(addOns) {

    let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

    });

    return arr;

}


p1.addEventListener('click', async () => {

    const baseName = p1.textContent.trim();
    const typeCar = document.querySelector('#Car');
    const typeTruck = document.querySelector('#Truck');
    const typeSUV = document.querySelector('#SUV');

    typeCar.addEventListener('click', async () => {

        scrollIntoAddon();

        const typeName = typeCar.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', async (event) => {

            // scroll to date
            document.querySelector('._client').scrollIntoView();

            event.preventDefault();

            // Collecting the user selected upgrades
            const addOns = collectUpgrades();

            // Grabbing the selected upgrades from the DB
            const arr = await getAddonsFromDb(addOns);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeTruck.addEventListener('click', async () => {

        scrollIntoAddon();

        const typeName = typeTruck.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', async (event) => {

            // scroll to date
            document.querySelector('._client').scrollIntoView();

            event.preventDefault();

            const addOns = collectUpgrades();

            // Grabbing the selected upgrades from the DB
            const arr = await getAddonsFromDb(addOns);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeSUV.addEventListener('click', async () => {

        scrollIntoAddon();

        const typeName = typeSUV.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', async (event) => {

            // scroll to date
            document.querySelector('._client').scrollIntoView();

            event.preventDefault();

            const addOns = collectUpgrades();

            // Grabbing the selected upgrades from the DB
            const arr = await getAddonsFromDb(addOns);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

});

p2.addEventListener('click', async () => {

    const baseName = p2.textContent.trim();
    const typeCar = document.querySelector('#Car');
    const typeTruck = document.querySelector('#Truck');
    const typeSUV = document.querySelector('#SUV');

    typeCar.addEventListener('click', async () => {

        scrollIntoAddon();

        const typeName = typeCar.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonChoices = await getInteriorAddons();
        const addonHTML = await getAddonHTML(addonChoices);

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', async (event) => {

            // scroll to date
            document.querySelector('._client').scrollIntoView();

            event.preventDefault();

            const addOns = collectUpgrades();

            // Grabbing the selected upgrades from the DB
            const arr = await getAddonsFromDb(addOns);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeTruck.addEventListener('click', async () => {

        scrollIntoAddon();

        const typeName = typeTruck.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonChoices = await getInteriorAddons();
        const addonHTML = await getAddonHTML(addonChoices);

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', async (event) => {

            // scroll to date
            document.querySelector('._client').scrollIntoView();

            event.preventDefault();

            const addOns = collectUpgrades();

            // Grabbing the selected upgrades from the DB
            const arr = await getAddonsFromDb(addOns);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        });
        
    });

    typeSUV.addEventListener('click', async () => {

        scrollIntoAddon();

        const typeName = typeSUV.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonChoices = await getInteriorAddons();
        const addonHTML = await getAddonHTML(addonChoices);

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', async (event) => {

            // scroll to date
            document.querySelector('._client').scrollIntoView();

            event.preventDefault();

            const addOns = collectUpgrades();

            // Grabbing the selected upgrades from the DB
            const arr = await getAddonsFromDb(addOns);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

});

p3.addEventListener('click', async () => {

    

    const baseName = p3.textContent.trim();
    

    const typeCar = document.querySelector('#Car');
    const typeTruck = document.querySelector('#Truck');
    const typeSUV = document.querySelector('#SUV');

    typeCar.addEventListener('click', async () => {

        scrollIntoAddon();

        const typeName = typeCar.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonChoices = await getExteriorAddons();
        const addonHTML = await getAddonHTML(addonChoices);

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', async (event) => {

            // scroll to date
            document.querySelector('._client').scrollIntoView();

            event.preventDefault();

            const addOns = collectUpgrades();

            // Grabbing the selected upgrades from the DB
            const arr = await getAddonsFromDb(addOns);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeTruck.addEventListener('click', async () => {

        scrollIntoAddon();

        const typeName = typeTruck.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonChoices = await getExteriorAddons();
        const addonHTML = await getAddonHTML(addonChoices);

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', async (event) => {

            // scroll to date
            document.querySelector('._client').scrollIntoView();

            event.preventDefault();

            const addOns = collectUpgrades();

            // Grabbing the selected upgrades from the DB
            const arr = await getAddonsFromDb(addOns);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeSUV.addEventListener('click', async () => {

        scrollIntoAddon();

        const typeName = typeSUV.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonChoices = await getExteriorAddons();
        const addonHTML = await getAddonHTML(addonChoices);

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', async (event) => {

            // scroll to date
            document.querySelector('._client').scrollIntoView();

            event.preventDefault();

            const addOns = collectUpgrades();

            // Grabbing the selected upgrades from the DB
            const arr = await getAddonsFromDb(addOns);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

});

p4.addEventListener('click', async () => {

    const baseName = p4.textContent.trim();

    document.querySelector('.addOn-form').style.display = 'none';
    

    const typeCar = document.querySelector('#Car');
    const typeTruck = document.querySelector('#Truck');
    const typeSUV = document.querySelector('#SUV');

    typeCar.addEventListener('click', async () => {

        // scroll to date
        document.querySelector('._client').scrollIntoView();

        const typeName = typeCar.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);

        displayCalendar(package, []);
    });

    typeTruck.addEventListener('click', async () => {

        // scroll to date
        document.querySelector('._client').scrollIntoView();

        const typeName = typeTruck.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);

        displayCalendar(package, []);
    });

    typeSUV.addEventListener('click', async () => {

        // scroll to date
        document.querySelector('._client').scrollIntoView();

        const typeName = typeSUV.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        
        displayCalendar(package, []);
        
    });

    

});



async function getPackageInfo(name) {

    const packages = await getPackages();

    let obj = {
        name: '',
        price: '',
        duration: ''
    }

    for(let p of packages){

        if(p.name === name) {

            obj.name = p.name;
            obj.price = p.price;
            obj.duration = p.duration;

        }

    }

    return obj;

}

async function getAddonInfo(id) {

    const addons = await getAddons();

    let obj = {
        name: '',
        price: '',
        duration: ''
    }

    for(let a of addons) {

        if(a._id === id) {

            obj.name = a.name;
            obj.price = a.price;
            obj.duration = a.duration;

        }

    }

    return obj;

}

async function insertAppointmentButtonListeners(package, addonArray) {

    const apptBtns = document.querySelectorAll('.public-appt-btn');

    apptBtns.forEach(btn => {

        btn.addEventListener('click', () => {

            const splitBtn = btn.id.split(' ');
            const hour = splitBtn[0];
            const date = splitBtn[1];

            // hide the client
            const pName = document.querySelector('.package-name');
            const pPrice = document.querySelector('.package-price');
            const pText = document.querySelector('.package-text');

            pName.innerHTML = '';
            pPrice.innerHTML = '';
            pText.innerHTML = '';
            container.innerHTML = '';
            apptContainer.innerHTML = '';

            // call function to display order form
            displayOrderForm(date, hour, package, addonArray);

        });

    });

}

async function getAddonHTML(addons) {

    if(addons === null || addons === undefined) {
        addons = await getAddons();
    }

    html = '';

    addons.forEach(a => {

        html += `<div class='addOnDiv'><input type="checkbox" class='addOn-box' id="${a._id}" name="${a.name}" value="${a.name}">
        <label class='addOn-choice' for="${a.name}"> ${a.name} - $${a.price}</label></div>`;
        
    });

    html += `<input class='addOn-choice-submit package-choice' type="submit" value="Select a Date">`;

    return html;

}

async function displayOrderForm(date, hour, package, addonArray) {          

    let html = '';

    const formattedHour = convertHour(hour);
    const formattedDate = convertDate(date);

    html += `<h4 class='order-date' id="order-link"><span class='order-colorChange'>Date:</span> ${formattedDate}</h4>`;
    html += `<h4 class='order-time'><span class='order-colorChange'>Time:</span> ${formattedHour}</h4>`;
    html += `<h4 class='order-pName'><span class='order-colorChange'>Package:</span> ${package.name}</h4>`;
    

    let addOnTotalPrice = 0;

    html += `<h4 class='order-aName'><span class='order-colorChange'>Upgrades:</h4>`;

    addonArray.forEach(a => {

        addOnTotalPrice += parseInt(a.price);

        html += `<h4 class='order-aPrice'><span class='addonPrice'>$${a.price}</span> ${a.name}</h4>`;
    });

    html += `<h4 class='order-aTotalPrice'><span class='order-colorChange'>Upgrade Subtotal:</span> <span class='addonPrice'>$${addOnTotalPrice}</span></h4>`;
    html += `<h4 class='order-pPrice'><span class='order-colorChange'>Base Price:</span> <span class='addonPrice'>$${package.price}</span></h4>`;

    const subtotal = parseInt(package.price) + addOnTotalPrice;

    html += `<h4 class='order-subtotal'><span class='order-colorChange'>Subtotal:</span> <span class='addonPrice'>$${subtotal}</span></h4>`

    orderContainer.innerHTML = `<div class='order-confirmation-details'></div>
                                <div class='order-customer-details'></div>
                                <div class='order-submit-payment'></div>`;
    orderContainer.style.display = 'inherit';
    const confirmationDetails = document.querySelector('.order-confirmation-details');
    confirmationDetails.innerHTML = html;

    createCustomerDetails();

    _date = date;
    _hour = hour;
    _package = package;
    _addonArray = addonArray;
    

    // Event Listener on Pay Now Button 
    document.querySelector('.submit-customer-details').addEventListener('click', async (event) => {
        event.preventDefault();
        container.scrollIntoView();
        // -> Get and Store Details from customer
        const customerForm = document.querySelector('.collect-customer-details');
        const valid = customerForm.checkValidity();
        customerForm.reportValidity();
        if(valid) {



        

        const customerDetails = new FormData(customerForm);

        const customer = {
            fName : customerDetails.get('customer-fName'),
            lName : customerDetails.get('customer-lName'),
            address : customerDetails.get('customer-address'),
            city : customerDetails.get('customer-city'),
            zip : customerDetails.get('customer-zip'),
            phone : customerDetails.get('customer-phone'),
            email : customerDetails.get('customer-email'),
            carType : customerDetails.get('customer-carType'),
            carYear : customerDetails.get('customer-carYear'),
            notes : customerDetails.get('customer-notes')
        }     

        // Contains all data we need for a payment and job confirmation to admin
        const customerData = {
            date: _date,
            hour: _hour,
            package: _package,
            addonArray: _addonArray,
            customer: customer,
            confirmed: false
        }

        // Get an array of selected items names
        let purchase = [customerData.customer.email];
        purchase.push(customerData.package.name);
        customerData.addonArray.forEach(upgrade => {
            purchase.push(upgrade.name);
        });

        // Display stripe payment form
        const stripe = Stripe('pk_test_51H8tXeJzubpk3sMGpRS0QDYpF85Sl9b9Rg8BipIhHMZgMEelzqgOypmviCCEZ3RUMfDSySzfLDYiBfiBu2NMtCG500skxbfuja');
        displayStripePaymentForm();

        //document.querySelector("#stripe-submit").disabled = true;
        fetch(API_URL_PAYMENTINTENT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(purchase)
            }).then(function(result) {
                return result.json();
            }).then(function(data) {
                var elements = stripe.elements();
                var style = {
                    base: {
                        color: "#32325d",
                        fontFamily: 'Arial, sans-serif',
                        fontSmoothing: "antialiased",
                        fontSize: "16px",
                        "::placeholder": {
                            color: "#32325d"
                        }
                    },
                    invalid: {
                        fontFamily: 'Arial, sans-serif',
                        color: "#fa755a",
                        iconColor: "#fa755a"
                    }
                };

                var card = elements.create("card", { style: style });

                // Stripe injects an iframe into the DOM
                card.mount("#card-element");

                card.on("change", function (event) {
                    // Disable the Pay button if there are no card details in the Element
                    document.querySelector("button").disabled = event.empty;
                    document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
                });

                var form = document.getElementById("payment-form");
                form.addEventListener("submit", function(event) {
                    event.preventDefault();
                    // Complete payment when the submit button is clicked
                    payWithCard(stripe, card, data.clientSecret, customerData);
                });
        });

        // Calls stripe.confirmCardPayment
        // If the card requires authentication Stripe shows a pop-up modal to
        // prompt the user to enter authentication details without leaving your page.
        var payWithCard = function(stripe, card, clientSecret, customerData) {
            loading(true);
            stripe.confirmCardPayment(clientSecret, {
                //receipt_email: data.customer.email,
                payment_method: {
                    card: card,
                }
            }).then(function(result) {
                if (result.error) {
                    // Show error to your customer
                    showError(result.error.message);
                } else {
                    // The payment succeeded!
                    orderComplete(result.paymentIntent.id, customerData);
                }
            });
        };

        /* ------- UI helpers ------- */
        // Shows a success message when the payment is complete
        var orderComplete = function(paymentIntentId, customerData) {
            loading(false);
            document.querySelector(".result-message").setAttribute("href",
            "https://dashboard.stripe.com/test/payments/" + paymentIntentId);

            document.querySelector(".result-message").classList.remove("hidden");
            document.querySelector("#stripe-submit").disabled = true;

            /*************** APPOINTMENT CONFIRMED ******************/
            // USE DATA COLLECTED BEFORE PAYMENT
            console.log('CONFIRMED APPOINTMENT!');
            console.log(customerData);

            // Hide stripe payment form
            hideStripePaymentForm();
            displayOrderConfirmation(customerData);
            // Update appointment availability in DB
            updateAppointmentAvailability(customerData);
            // Post the job to DB and handle post-payment actions
            postJob(customerData);

        };

        // Show the customer the error from Stripe if their card fails to charge
        var showError = function(errorMsgText) {
            loading(false);
            var errorMsg = document.querySelector("#card-error");
            errorMsg.textContent = errorMsgText;
            setTimeout(function() {
                errorMsg.textContent = "";
            }, 4000);
        };

        // Show a spinner on payment submission
        var loading = function(isLoading) {
            if (isLoading) {
                // Disable the button and show a spinner
                document.querySelector("#stripe-submit").disabled = true;
                document.querySelector("#spinner").classList.remove("hidden");
                document.querySelector("#button-text").classList.add("hidden");
            } else {
                document.querySelector("#stripe-submit").disabled = false;
                document.querySelector("#spinner").classList.add("hidden");
                document.querySelector("#button-text").classList.remove("hidden");
            }

        };}

    }); 

}

// Getting prices of user selected package + upgrades
// Used for grabbing prices from server side to avoid malicious manipulation on client side
async function getStripeIds(data) {

    const pName = data.package.name;
    let arr = [];
    if(data.addonArray.length > 0) {
        data.addonArray.forEach(upgrade => {
            arr.push(upgrade.name);
        });
    }
    
    arr.push(pName);
    
    let total = 0;

    arr.forEach(async item => {
        await fetch(API_URL_PRICES + '/' + item).then(res => res.json())
        .then( price => {
            total += price;
            //const priceID = obj;
            //result.push({price: priceID.toString(), quantity: 1});
        });
    });
    
    return total;

}

function createCustomerDetails() {

    const customerDetails = document.querySelector('.order-customer-details');

    html = `<form class='collect-customer-details'>
                <label class='margin-right' for='customer-fName'>First Name: </label>
                <input type='text' class='block' id='customer-fName' name='customer-fName' value='' size='30' required><br>
                <label class='margin-right' for='customer-lName'>Last Name: </label>
                <input type='text' class='block' id='customer-lName' name='customer-lName' value='' size='30' required><br>
                <label class='margin-right' for='customer-address'>Address of Service: </label>
                <input class='margin-right' type='text' class='block' id='customer-address' name='customer-address' value='' size='30' required><br>
                <label class='margin-right' for='customer-city'>City/County: </label>
                <input type='text' class='block' id='customer-city' name='customer-city' value='' size='30' required><br>
                <label class='margin-right' for='customer-zip'>Zip Code: </label>
                <input type='text' class='block' id='customer-zip' name='customer-zip' value='' size='30' required><br>
                <label class='margin-right' for='customer-carType'>Vehicle's Make and Model: </label>
                <input class='margin-right' type='text' class='block' id='customer-carType' name='customer-carType' value='' size='30' required><br>
                <label class='margin-right' for='customer-carYear'>Vehicle's Year: </label>
                <input type='text' class='block' id='customer-carYear' name='customer-carYear' value='' size='30' required><br>
                <label class='margin-right' for='customer-phone'>Cell Phone: </label>
                <input type='tel' class='block' id='customer-phone' name='customer-phone' value='' size='30' required><br>
                <label class='margin-right' for='customer-email'>E-mail: </label>
                <input type='email' class='block' id='customer-email' name='customer-email' value='' size='30' required><br>
                <label class='margin-right' for='customer-notes'>Leave us a Note: </label>
                <textarea id='customer-notes' name='customer-notes' cols='25' rows='3'></textarea><br>
                

            </form>
            <a href='#stripePaymentForm'><button class='submit-customer-details'>Checkout</button></a>

            `;

    customerDetails.innerHTML = html;

}

// Pass in an formatted for the DB and return a nicely formatted time for the user
function convertHour(hour) {
    // AM Hours
    if(hour < 12) {
        // Convert the .5 to :30 + 'AM'
        if(hour % 1 !== 0) {
            hour = (parseInt(hour) / 1).toString() + ':30 AM';

        // Add the :00 + 'AM'
        } else {
            hour = hour.toString() + ':00 AM';

        }
    // PM Hours
    } else {
        if(hour >= 13) {
            hour = hour - 12;
        }
        
        // Convert the .5 to :30 + 'PM'
        if(hour % 1 !== 0) {
            hour = (parseInt(hour) / 1).toString() + ':30 PM';

        // Add the :00 + 'PM'
        } else {
            hour = hour.toString() + ':00 PM';
    
        }
    }

    return hour;
}

function convertDate(date) {
    const splitDate = date.split('-');

    const displayDateObj = new Date(splitDate[0], parseInt(splitDate[1]) - 1, splitDate[2]);
    const displayDateString = displayDateObj.toString();

    const splitDisplayDate = displayDateString.split(' ');

    const displayDate = splitDisplayDate[0] + ' ' + splitDisplayDate[1] + ' ' +  splitDisplayDate[2] + ', ' + splitDisplayDate[3];

    return displayDate;
}

function displayStripePaymentForm() {

    document.querySelector('._orderContainer').style.display = 'none';

    const html = `<form class='form' id="payment-form">
        <div id="card-element"><!--Stripe.js injects the Card Element--></div>
        <button id="stripe-submit">
            <div class="spinner hidden" id="spinner"></div>
            <span id="button-text">Purchase Appointment</span>
        </button>
        <p id="card-error" role="alert"></p>
        <a class="result-message hidden"></a>

    </form>`;

    document.querySelector('._paymentContainer').innerHTML = html;
}

function hideStripePaymentForm() {

    document.querySelector('._paymentContainer').innerHTML = '';

}

function displayOrderConfirmation(customerData) {

    const confirmationForm = document.querySelector('._orderConfirmation');

    let html = `<h2 class='confirmed-header'>Appointment Confirmed</h2>
                <h3 class='confirmed-subheader'>Order Details</h2>`;
    html += `<ul class='confirmed-ul'>
                <li class='confirmed-li'>Date: ${convertDate(customerData.date)}</li>
                <li class='confirmed-li'>Time: ${convertHour(customerData.hour)}</li>
                <li class='confirmed-li'>Location: ${customerData.customer.address}, ${customerData.customer.city}, ${customerData.customer.zip}</li>
                <li class='confirmed-li'>Base Package: ${customerData.package.name}</li>
            </ul>`;
    confirmationForm.innerHTML = html;
    html = '';

    
    const confirmationUL = document.querySelector('.confirmed-ul');
    customerData.addonArray.forEach(upgrade => {
        html += `<li class='confirmed-li'>Upgrade: ${upgrade.name}</li>`;
    });
    confirmationUL.innerHTML += html;

    confirmationForm.innerHTML += `<p class='confirmed-text'>
                                    We are looking forward to bringing you the quality service
                                    that we are known for here at Tender Touch Mobile Auto Detailing!
                                    We will give you a call on our way to your appointment remind you
                                    of the appointment!
                                    </p>`

}

async function postJob(customerData) {

    // Get Estimated Time of Service
    const estTime = await calculateAppointmentLength(customerData);

    // Used to store dates year, month, and day individually
    const split = customerData.date.split('-');

    const job = {
        date: convertDate(customerData.date),
        dateYear: parseInt(split[0]),
        dateMonth: parseInt(split[1]),
        dateDay: parseInt(split[2]),
        estTime: estTime,
        time: convertHour(customerData.hour),
        location: {
            address: customerData.customer.address,
            city: customerData.customer.city,
            state: 'VA',  //*** CONSTANT VALUE ***
            zip: customerData.customer.zip,
        },
        services: {
            package: customerData.package.name,
            upgrades: [],
        },
        vehicle: {
            model: customerData.customer.carType,
            year: customerData.customer.carYear,
        },
        customer: {
            fName: customerData.customer.fName,
            lName: customerData.customer.lName,
            email: customerData.customer.email,
            phone: customerData.customer.phone,
        },
        notes: customerData.customer.notes,
    };

    // Add upgrades into the array
    customerData.addonArray.forEach(upgrade => {
        job.services.upgrades.push(upgrade.name);
    });

    try{
        fetch(API_URL_JOBS, {
            method: 'POST',
            body: JSON.stringify(job),
            headers: {
                'content-type': 'application/json'
            }
        });
    } catch {
        // ALERT ADMIN THAT THE JOB DID NOT POST
        // PERHAPS LEAD THEM TO STRIPE DASHBOARD?

    }

}

async function updateAppointmentAvailability(customerData) {

    const lengthToBlock = await calculateAppointmentLength(customerData);

    // Decrement Concurrency of Appt Slots for the next 'lengthToBlock' minutes
    startHour = customerData.hour;
    console.log(customerData);
    let endHour = parseInt(customerData.hour) + (lengthToBlock / 60);
    startHour = parseInt(startHour) - 1.5;

    if(endHour % 1 !== 0) {
        const remainder = endHour % 1;
        if(remainder <= .5) {
            endHour = Math.floor(endHour) + .5;
        } else {
            endHour = Math.floor(endHour) + 1;
        }
    }

    endHour = endHour.toString();
    startHour = startHour.toString();

    const date = customerData.date;

    decrementAppointmentSlotRange(date, startHour, endHour);

}

async function calculateAppointmentLength(customerData) {

    let length = 0;

    customerData.addonArray.forEach(upgrade => {
        length += parseInt(parseInt(upgrade.duration));
    });

    length += parseInt(customerData.package.duration);

    length += parseInt(await getSettings());

    // Convert Length to be divisible by 30 (the interval of appointments in minutes)
    if(length % 30 !== 0) {
        if(length % 30 >= 15) {
            // Round up
            length = length + (30 - (length % 30));
        } else {
            // Round down
            length = length - (length % 30);
        }
    }

    return length;
    
}

function scrollIntoAddon() {
    const element = document.querySelector('.wantAddons');
    element.scrollIntoView();
    element.textContent = 'Add Optional Upgrades';
}

