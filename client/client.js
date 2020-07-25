/****************** ADMIN ADJUSTMENTS  *****************************/
// I highly recommend only editing these settings if you have read and fully
// understand the instructions I have included about editing these settings
// in the readMe file.

const tAdjustment = 1; // 0 is the lowest setting

const container = document.querySelector('._container');
const apptContainer = document.querySelector('._apptContainer');
const orderContainer = document.querySelector('._orderContainer');


/* ---------------- ADJUSTMENT SECTION COMPLETE -------------------- */
// I do not recommend editing the file below this line unless you are 
// competent in Javascript, Node.js, MongoDB, Express, HTML, and CSS

/******************* ROUTES *****************************/
const API_URL_PACKAGES = 'http://localhost:5000/packages';
const API_URL_ADDONS = 'http://localhost:5000/addons';
const API_URL_SETTINGS = 'http://localhost:5000/settings';
const API_URL_APPTSLOTS = 'http://localhost:5000/apptSlots';
const API_URL_JOBS = 'http://localhost:5000/jobs';


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

    return arr;
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
    const convertedDate = splitDate[0] + '-' + convertedMonth.toString() + '-' + splitDate[2]; 

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

    let startIndex = 0;

    // Defines a starting index for displaying appointment slots when displaying today's appt slots
    for(let i = 0; i < appointments.length; i++) {
        
        // THIS ALLOWS THE SOFTWARE TO ADJUST HOW CLOSE TO THE CURRENT TIME
        // THE ADMIN WOULD LIKE TO ALLOW APPOINTMENTS TO BE BOOKED WHEN 
        // USERS ARE VIEWING APPOINTMENTS ON THE CURRENT DAY
        if(parseInt(appointments[i].hour) == parseInt(currentTime) + 1) {
            startIndex = i + tAdjustment;
        }

    }

    // Only show appointment slots after the current time
    if(convertedDate === thisDate) {
    
        if(appointments.length - 1 < startIndex) {
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
                    html += `<button class='public-appt-btn' id='${appointments[i].hour} ${appointments[i].date}'>${hour}</button>`;
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
                html += `<button class='public-appt-btn' id='${a.hour} ${a.date}'>${hour}</button>`;
            }
    
        });

    }

    if(html === `<div class='public-appt-date'>${displayDate}</div>`) {
        html += `<div class='public-appt-date'>No Appointments Available...</div>`;
    }

    apptContainer.innerHTML = html;

    insertApppointmentButtonListeners(package, addonArray);

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


p1.addEventListener('click', async () => {

    const baseName = p1.textContent.trim();
    

    const typeCar = document.querySelector('#Car');
    const typeTruck = document.querySelector('#Truck');
    const typeSUV = document.querySelector('#SUV');

    typeCar.addEventListener('click', async () => {

        const typeName = typeCar.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', (event) => {

            event.preventDefault();

            let addOns = [];

            const addonChoices = document.querySelectorAll('.addOn-choice');
            
            addonChoices.forEach(a => {

                if(a.checked) {

                    addOns.push(a);

                }

            });

            let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

            });

            console.log(arr);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeTruck.addEventListener('click', async () => {

        const typeName = typeTruck.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', (event) => {

            event.preventDefault();

            let addOns = [];

            const addonChoices = document.querySelectorAll('.addOn-choice');
            
            addonChoices.forEach(a => {

                if(a.checked) {

                    addOns.push(a);

                }

            });

            let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

            });

            console.log(arr);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeSUV.addEventListener('click', async () => {

        const typeName = typeSUV.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', (event) => {

            event.preventDefault();

            let addOns = [];

            const addonChoices = document.querySelectorAll('.addOn-choice');
            
            addonChoices.forEach(a => {

                if(a.checked) {

                    addOns.push(a);

                }

            });

            let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

            });

            console.log(arr);

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

        const typeName = typeCar.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', (event) => {

            event.preventDefault();

            let addOns = [];

            const addonChoices = document.querySelectorAll('.addOn-choice');
            
            addonChoices.forEach(a => {

                if(a.checked) {

                    addOns.push(a);

                }

            });

            let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

            });

            console.log(arr);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeTruck.addEventListener('click', async () => {

        const typeName = typeTruck.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', (event) => {

            event.preventDefault();

            let addOns = [];

            const addonChoices = document.querySelectorAll('.addOn-choice');
            
            addonChoices.forEach(a => {

                if(a.checked) {

                    addOns.push(a);

                }

            });

            let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

            });

            console.log(arr);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeSUV.addEventListener('click', async () => {

        const typeName = typeSUV.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', (event) => {

            event.preventDefault();

            let addOns = [];

            const addonChoices = document.querySelectorAll('.addOn-choice');
            
            addonChoices.forEach(a => {

                if(a.checked) {

                    addOns.push(a);

                }

            });

            let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

            });

            console.log(arr);

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

        const typeName = typeCar.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', (event) => {

            event.preventDefault();

            let addOns = [];

            const addonChoices = document.querySelectorAll('.addOn-choice');
            
            addonChoices.forEach(a => {

                if(a.checked) {

                    addOns.push(a);

                }

            });

            let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

            });

            console.log(arr);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeTruck.addEventListener('click', async () => {

        const typeName = typeTruck.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', (event) => {

            event.preventDefault();

            let addOns = [];

            const addonChoices = document.querySelectorAll('.addOn-choice');
            
            addonChoices.forEach(a => {

                if(a.checked) {

                    addOns.push(a);

                }

            });

            let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

            });

            console.log(arr);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

    typeSUV.addEventListener('click', async () => {

        const typeName = typeSUV.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);
        const addonHTML = await getAddonHTML();

        const form = document.querySelector('.addOn-form');
        form.innerHTML = addonHTML;

        const submit = document.querySelector('.addOn-choice-submit');
        submit.addEventListener('click', (event) => {

            event.preventDefault();

            let addOns = [];

            const addonChoices = document.querySelectorAll('.addOn-choice');
            
            addonChoices.forEach(a => {

                if(a.checked) {

                    addOns.push(a);

                }

            });

            let arr = [];

            addOns.forEach(async a => {

                //get the addon object from DB
                const addonObj = await getAddonInfo(a.id);
                arr.push(addonObj);

            });

            console.log(arr);

            // Call displayCalendar with package and addon array
            displayCalendar(package, arr);

        })
        
    });

});

p4.addEventListener('click', async () => {

    const baseName = p4.textContent.trim();
    

    const typeCar = document.querySelector('#Car');
    const typeTruck = document.querySelector('#Truck');
    const typeSUV = document.querySelector('#SUV');

    typeCar.addEventListener('click', async () => {

        const typeName = typeCar.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);

        displayCalendar(package, []);
    });

    typeTruck.addEventListener('click', async () => {

        const typeName = typeTruck.id;
        const name = baseName + ' - ' +  typeName;

        const package = await getPackageInfo(name);

        displayCalendar(package, []);
    });

    typeSUV.addEventListener('click', async () => {

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

async function insertApppointmentButtonListeners(package, addonArray) {

    const apptBtns = document.querySelectorAll('.public-appt-btn');

    apptBtns.forEach(btn => {

        btn.addEventListener('click', () => {

            const splitBtn = btn.id.split(' ');
            const hour = splitBtn[0];
            const date = splitBtn[1];

            console.log(hour);
            console.log(date);
            console.log(package);
            console.log(addonArray);

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

async function getAddonHTML() {

    const addons = await getAddons();

    html = '';

    addons.forEach(a => {

        html += `<input type="checkbox" class='addOn-choice' id="${a._id}" name="${a.name}" value="${a.name}">
        <label class='addOn-choice-a' for="${a.name}"> ${a.name} - $${a.price}</label>`;
        
    });

    html += `<input class='addOn-choice-submit' type="submit" value="Select a Date">`;

    return html;

}

function displayOrderForm(date, hour, package, addonArray) {

    let html = '';

    const formattedHour = convertHour(hour);
    const formattedDate = convertDate(date);

    html += `<h4 class='order-date'><span class='order-colorChange'>Date:</span> ${formattedDate}</h4>`;
    html += `<h4 class='order-time'><span class='order-colorChange'>Time:</span> ${formattedHour}</h4>`;
    html += `<h4 class='order-pName'><span class='order-colorChange'>Package:</span> ${package.name}</h4>`;
    html += `<h4 class='order-pPrice'><span class='order-colorChange'>Base Price:</span> $${package.price}</h4>`;

    let addOnTotalPrice = 0;

    addonArray.forEach(a => {

        addOnTotalPrice += parseInt(a.price);

        html += `<h4 class='order-aName'><span class='order-colorChange'>Upgrade:</span> ${a.name}</h4>`;
        html += `<h4 class='order-aPrice'><span class='order-colorChange'>Upgrade Price:</span> $${a.price}</h4>`;
    });

    html += `<h4 class='order-aTotalPrice'><span class='order-colorChange'>Upgrade Subtotal:</span> $${addOnTotalPrice}</h4>`;

    const subtotal = parseInt(package.price) + addOnTotalPrice;

    html += `<h4 class='order-subtotal'><span class='order-colorChange'>Subtotal:</span> $${subtotal}</h4>`

    orderContainer.innerHTML = `<div class='order-confirmation-details'></div>
                                <div class='order-customer-details'></div>
                                <div class='order-submit-payment'></div>`;

    const confirmationDetails = document.querySelector('.order-confirmation-details');
    confirmationDetails.innerHTML = html;

    getCustomerDetails();

}

function getCustomerDetails() {

    const customerDetails = document.querySelector('.order-customer-details');

    html = `<form class='collect-customer-details'>
                <label for='customer-fName'>Enter First Name: </label>
                <input type='text' id='customer-fName' name='customer-fName' value=''><br>
                <label for='customer-lName'>Enter Last Name: </label>
                <input type='text' id='customer-lName' name='customer-lName' value=''><br>
                <label for='customer-address'>Address of Service: </label>
                <input type='text' id='customer-address' name='customer-address' value=''><br>
                <label for='customer-city'>City/County: </label>
                <input type='text' id='customer-city' name='customer-city' value=''><br>
                <label for='customer-zip'>Zip Code: </label>
                <input type='text' id='customer-zip' name='customer-zip' value=''><br>
                <label for='customer-carType'>Vehicle's Make and Model: </label>
                <input type='text' id='customer-carType' name='customer-carType' value=''><br>
                <label for='customer-carYear'>Vehicle's Year: </label>
                <input type='text' id='customer-carYear' name='customer-carYear' value=''><br>
                <label for='customer-phone'>Cell Phone: </label>
                <input type='tel' id='customer-phone' name='customer-phone' value=''><br>
                <label for='customer-email'>E-mail: </label>
                <input type='email' id='customer-email' name='customer-email' value=''><br>
                <label for='customer-notes'>Leave us a Note: </label>
                <textarea id='customer-notes' name='customer-notes' cols='25' rows='5'>Leave us any notes you would like us to see before your appointment here...
                </textarea>
            </form>
            <button class='submit-customer-details'>Pay Now</button>
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