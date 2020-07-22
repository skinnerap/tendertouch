const API_URL_PACKAGES = 'http://localhost:5000/packages';
const API_URL_ADDONS = 'http://localhost:5000/addons';
const API_URL_SETTINGS = 'http://localhost:5000/settings';
const API_URL_APPTSLOTS = 'http://localhost:5000/apptSlots';
const API_URL_JOBS = 'http://localhost:5000/jobs';

const container = document.querySelector('._client');



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

// UPDATE THE DECREMENTED CONCURRENCY FOR A BOOKED APPOINTMENT SLOT
async function bookAppointment(date, hour) {

    const appointment = await getAppointmentSlot(date, hour);

    // Important Note: The logic for decrementing the appointments concurrency is on the 
    //                 server side. Therefore I set the passed concurrency to '1' if the 
    //                 appointment slot is already at 1 or less. This is all a means to 
    //                 never allow an appointment's concurrency to drop below 0.

    let newConcurrency = '';

    if(parseInt(appointment.concurrency) < 1) {
        newConcurrency = '1';
    } else newConcurrency = appointment.concurrency;
    
    await fetch(API_URL_APPTSLOTS + '/' + date + '/' + hour + '/' + newConcurrency, {
        method: 'PATCH'
    });

}

bookAppointment('2020-07-24', '10');


// 2 - DISPLAY APPOINTMENT SLOTS FOR A DAY

// 3 - START CONNECTING THE FINAL CONNECTIONS FOR TOMS CLIENT PAGE