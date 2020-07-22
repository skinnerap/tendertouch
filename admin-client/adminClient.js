/******* GET FORM/SUBMIT ELEMENTS *****/
const packageForm = document.querySelector('.packageForm');
const packageSub = document.querySelector('#package-submit');
const allPackagesBtn = document.querySelector('#showPackagesSubmit');
const allPackages = document.querySelector('.showPackages');
const addOnForm = document.querySelector('.addOnForm');
const addOnSub = document.querySelector('#addOn-submit');
const allAddOnsBtn = document.querySelector('#showAddOnsSubmit');
const allAddOns = document.querySelector('.showAddOns');
const settingsForm = document.querySelector('.settingsForm');
const settingsSub = document.querySelector('#generalSettingsSubmit');
const blockDayForm = document.querySelector('.admin-block-day');
const blockDaySub = document.querySelector('#blockDaySubmit')
const blockDayIndForm = document.querySelector('.admin-block-day-ind');
const blockDayIndSub = document.querySelector('#indefiniteSubmit');
const allBlockedDaysBtn = document.querySelector('#showBlockedDaysSubmit');
const allBlockedDays = document.querySelector('.restoreBlockedDaysOptions');
const allIndBlockedDaysBtn = document.querySelector('#showIndBlockedDaysSubmit');
const allIndBlockedDays = document.querySelector('.restoreIndBlockedDaysOptions');
const deleteApptOptions = document.querySelector('.appts-to-delete');
const createApptsBtn = document.querySelector('#create-appts');

/****** ROUTES ********/
const API_URL_PACKAGES = 'http://localhost:5000/packages';
const API_URL_ADDONS = 'http://localhost:5000/addons';
const API_URL_SETTINGS = 'http://localhost:5000/settings';
const API_URL_BLOCKDAY = 'http://localhost:5000/blockedDays';
const API_URL_BLOCKDAYIND = 'http://localhost:5000/indBlockedDays';
const API_URL_APPTSLOTS = 'http://localhost:5000/apptSlots';

/***************** APPOINTMENT SLOT CONSTRUCTOR ********************/
function ApptSlot(year, month, dayOfMonth, hour, concurrency) {
    // time: start time of the appointment slot
    // teams: teams available during this appointment slot
    this.year = year;
    this.month = month;
    this.dayOfMonth = dayOfMonth;
    this.hour = hour;
    this.concurrency = concurrency;
    this.date = this.year.toString() + '-' + this.month.toString() + '-' + this.dayOfMonth.toString();
}

/************************************** **********************************************/
/************************************** **********************************************/
/************************************** **********************************************/
/************************************** **********************************************/
/************************************** **********************************************/
/*******************            CLICK EVENTS                   ***********************/

/********************** POSTING GENERAL SETTINGS *********************************/
settingsSub.addEventListener('click', (event) => {
    event.preventDefault();
    const settingsData = new FormData(settingsForm);
    const tb = settingsData.get('travelBuffer');
    const ca = settingsData.get('concurrentAvailability');
    const st = settingsData.get('apptStartTime');
    const et = settingsData.get('apptEndTime');
    const type = 'settings';

    const settingsObj = {
        tb,
        ca,
        st,
        et,
        type
    }

    fetch(API_URL_SETTINGS, {
        method: 'POST',
        body: JSON.stringify(settingsObj),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json()
        .then(createdS => {
            settingsForm.reset();
    }));
});

/***** POSTING NEW PACKAGE ********/
packageSub.addEventListener('click', (event) => {
    event.preventDefault();
    const packageData = new FormData(packageForm);
    const name = packageData.get('packageName');
    const price = packageData.get('packagePrice');
    const duration = packageData.get('packageDuration');
    const type = 'package';

    const packageObj = {
        name,
        price,
        duration,
        type
    };

    fetch(API_URL_PACKAGES, {
        method: 'POST',
        body: JSON.stringify(packageObj),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json()
        .then(createdP => {
            packageForm.reset();
    }));

});

/***** DISPLAYING ALL PACKAGES ******/
allPackagesBtn.addEventListener('click', (event) => {
    listAllPackages();
});

/***** DISPLAYING ALL ADD-ONS ******/
allAddOnsBtn.addEventListener('click', (event) => {
    listAllAddOns();
})

/***** POSTING NEW ADDON ********/
addOnSub.addEventListener('click', (event) => {
    event.preventDefault();
    const addOnData = new FormData(addOnForm);
    const name = addOnData.get('addOnName');
    const price = addOnData.get('addOnPrice');
    const duration = addOnData.get('addOnDuration');
    const type = 'addon';

    const addOnObj = {
        name,
        price,
        duration,
        type
    };

    fetch(API_URL_ADDONS, {
        method: 'POST',
        body: JSON.stringify(addOnObj),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json()
        .then(createdA => {
            addOnForm.reset();
        }));
});

/****** POSTING NEW BLOCKED DAY ******/
blockDaySub.addEventListener('click', (event) => {
    event.preventDefault();
    const blockDayData = new FormData(blockDayForm);
    const date = blockDayData.get('blockedDay');
    const type = 'blockedDay';

    const blockDayObj = {
        date,
        type
    }

    fetch(API_URL_BLOCKDAY, {
        method: 'POST',
        body: JSON.stringify(blockDayObj),
        headers: {
            'content-type': 'application/json'
        }
    });

    //fetch(API_URL_APPTSLOTS + '/' + date)

    createAppts();
})

/****** POSTING NEW INDEFINITELY BLOCKED DAY ******/
blockDayIndSub.addEventListener('click', (event) => {
    event.preventDefault();
    const indBlockForm = document.querySelector('#indefinitelyBlockedDay');
    const day = indBlockForm.options[indBlockForm.selectedIndex].value;
    const type = 'blockedDay';

    const blockedDayObj = {
        day,
        type
    }

    fetch(API_URL_BLOCKDAYIND, {
        method: 'POST',
        body: JSON.stringify(blockedDayObj),
        headers: {
            'content-type': 'application/json'
        }
    });

    createAppts();
})

/********** DISPLAYING APPTS OF A DAY TO SELECT AND DELETE ONE **********************/
/*          FUTURE FEATURE : COMING SOON
/*
apptsOnDaySub.addEventListener('click', async (event) => {
    event.preventDefault();
    const apptsOnDayData = new FormData(apptsOnDayForm);
    const delBtn = document.querySelector('.deleteApptBtn');
    const date = apptsOnDayData.get('dayToGet');
    const year = parseInt(date.slice(0,4));
    const month = parseInt(date.slice(5,7));
    const day = parseInt(date.slice(8,10));
    const appts = await getApptsFromDate(year, month, day);

    if(appts.length === 0) {
        deleteApptOptions.innerHTML = `<option>No Appointments Found</option>`;
    } else {
        let html = '';
        appts.forEach(a => {
            let h = '';
            if(a.hour - Math.floor(a.hour) !== 0) {
                h = Math.floor(a.hour) + ':30';
            } else {
                h = a.hour + ':00';
            }
            html += `<option>${a.year}-${a.month}-${a.dayOfMonth} @ ${h}</option>`
        });

       deleteApptOptions.innerHTML = html;
       delBtn.innerHTML = `<button class='delApptSub'>DELETE APPOINTMENT SLOT</button>`;
       const delSub = document.querySelector('.delApptSub');
       delSub.addEventListener('click', async () => {
           const d = deleteApptOptions.value;

           // DESTRUCTURE THE DATE
           const year = parseInt(d.slice(0,4));
           const z = d.split('-');
           const month = parseInt(z[1]);
           const z1 = z[2].split(' ');
           const day = parseInt(z1[0]);
           let hour = z1[2];

           const z2 = hour.split(':');
           const flooredHour = z2[0];
           if(z2[1] === '30') {
               hour = parseInt(flooredHour) + .5;
           } else {
               hour = parseInt(flooredHour);
           }
           // END DESTRUCTURING

           // DELETE THE APPOINTMENT SLOT FROM THE DB
           const updatedDayArr = await deleteApptSlot(year, month, day, hour);

       });
    }
});*/

/****** LISTING ALL PACKAGES SO THAT ONE CAN BE SELECTED AND THEN DELETED ****/
function listAllPackages() {
    fetch(API_URL_PACKAGES).then(response => response.json()).then(packageObjs => {
        // Access to all the package objects in DB here
        // packageObjs : Array of Packages
        let html = '';
        packageObjs.forEach(p => {
            html += `<option id="${p._id}" name="${p._id}">${p._id} - Name: ${p.name}, Price: $${p.price}, Duration: ${p.duration}(minutes)</option>`;
        });
        allPackages.innerHTML = html;
        const delPackageDiv = document.querySelector('.deletePackage');
        delPackageDiv.innerHTML = `<button class='delBtn' id='deletePackageSubmit'>DELETE PACKAGE</button>`;
        const delPackageButton = document.querySelector('#deletePackageSubmit');
        delPackageButton.addEventListener('click', () => {
            // GET SELECTED PACKAGE
            const delForm = document.querySelector('.showPackages');
            const opt = delForm.options[delForm.selectedIndex];
            fetch(API_URL_PACKAGES + '/' + opt.id, {
                method: 'DELETE'
            });
        });
    });
}

/****** LISTING ALL ADD-ONS SO THAT ONE CAN BE SELECTED AND THEN DELETED ****/
function listAllAddOns() {
    fetch(API_URL_ADDONS).then(response => response.json()).then(addOnObjs => {
        // Access to all the add-on objects in DB here
        // addOnObjs : Array of add-ons
        let html = '';
        addOnObjs.forEach(a => {
            html += `<option id="${a._id}" name="${a._id}">${a._id} - Name: ${a.name}, Price: $${a.price}, Duration: ${a.duration}(minutes)</option>`;
        });
        allAddOns.innerHTML = html;
        const delAddOnDiv = document.querySelector('.deleteAddOn');
        delAddOnDiv.innerHTML = `<button class='delBtn' id='deleteAddOnSubmit'>DELETE ADD-ON</button>`;
        const delAddOnButton = document.querySelector('#deleteAddOnSubmit');
        delAddOnButton.addEventListener('click', () => {
            // GET SELECTED PACKAGE
            const delForm = document.querySelector('.showAddOns');
            const opt = delForm.options[delForm.selectedIndex];
            fetch(API_URL_ADDONS + '/' + opt.id, {
                method: 'DELETE'
            });
        });
    });
}

/****** DISPLAYING ALL BLOCKED DAYS TO SELECT AND DELETE ONE *****/
allBlockedDaysBtn.addEventListener('click', async () => {
    let html = '';
    const delBtnDiv = document.querySelector('.restoreBdays');
    fetch(API_URL_BLOCKDAY).then(response => response.json()).then(days => {
        days.forEach(day => {
            html += `<option id="${day._id}" name="${day._id}">${day.date}</option>`;

        });
        allBlockedDays.innerHTML = html;
        delBtnDiv.innerHTML = `<button class='delBtn' id='restoreBlockedDaySubmit'>RESTORE DATE</button>`;
        const delSub = document.querySelector('#restoreBlockedDaySubmit');
        delSub.addEventListener('click', async () => {
            // Get Selected Day
            const opt = allBlockedDays.options[allBlockedDays.selectedIndex];
            await fetch(API_URL_BLOCKDAY + '/' + opt.id, {
                method: 'DELETE'
            });

            await createAppts();
        });
    });


});

/****** DISPLAYING ALL INDEFINITELY BLOCKED DAYS TO SELECT AND DELETE ONE *****/
allIndBlockedDaysBtn.addEventListener('click', async () => {
    let html = '';
    const delBtnDiv = document.querySelector('.restoreIndBdays');
    await fetch(API_URL_BLOCKDAYIND).then(response => response.json()).then(days => {
        days.forEach(day => {
            html += `<option id="${day._id}" name="${day._id}">${day.day}</option>`;

        });
        allIndBlockedDays.innerHTML = html;
        delBtnDiv.innerHTML = `<button class='delBtn' id='restoreIndBlockedDaySubmit'>RESTORE DAY</button>`;
        const delSub = document.querySelector('#restoreIndBlockedDaySubmit');
        delSub.addEventListener('click', async () => {
            // Get Selected Day
            const opt = allIndBlockedDays.options[allIndBlockedDays.selectedIndex];
            await fetch(API_URL_BLOCKDAYIND + '/' + opt.id, {
                method: 'DELETE'
            });

            await createAppts();
        });
    });


});

createApptsBtn.addEventListener('click', async() => {
    await createAppts();
});

/************************************** **********************************************/
/************************************** **********************************************/
/************************************** **********************************************/
/************************************** **********************************************/
/************************************** **********************************************/
/*******************            ALGO FUNCTIONS                 ***********************/



/**************************** READ SETTINGS ************************************/
function displaySettings() {
    const tb = document.getElementById('currentTB');
    const ca = document.getElementById('currentCA');
    const st = document.getElementById('currentST');
    const et = document.getElementById('currentET');
    fetch(API_URL_SETTINGS).then(response => response.json()).then(settingsObj => {
        //ONLY ONE SETTINGS OBJECT CAN EXIST IN THE COLLECTION
        //THEREFORE THIS APPROACH IS FINE
        settingsObj.forEach(obj => {
            tb.textContent = obj.travelBuffer.toString();
            ca.textContent = obj.conAvailability.toString();
            st.textContent = obj.apptStartTime.toString();
            et.textContent = obj.apptEndTime.toString();
        });
    });
}

async function getSettings() {
    let o = {
        tb: null,
        ca: null,
        st: null,
        et: null
    }

    await fetch(API_URL_SETTINGS).then(response => response.json()).then(settingsObj => {
        //ONLY ONE SETTINGS OBJECT CAN EXIST IN THE COLLECTION
        //THEREFORE THIS APPROACH IS FINE
        o.tb = settingsObj[0].travelBuffer;
        o.ca = settingsObj[0].conAvailability;
        o.st = settingsObj[0].apptStartTime;
        o.et = settingsObj[0].apptEndTime;
    });

    return o;
}

// GETS BLOCKED DATES (Holidays/Vacations/Etc)
async function getBlockedDates() {
    let arr = [];

    await fetch(API_URL_BLOCKDAY).then(response => response.json()).then(bDays => {
        // EXAMPLE November 26 2020 - bDays[i].date: ("2020-11-26")
        bDays.forEach(dayObj => {
            arr.push(dayObj.date);
        });
    });

    return arr;
}

// GETS INDEFINITELY BLOCKED DAYS OF WEEK
async function getBlockedDays() {
    let arr = [];

    await fetch(API_URL_BLOCKDAYIND).then(response => response.json()).then(indbDays => {
        indbDays.forEach(dayObj => {
            if(dayObj.day === 'sunday') arr.push(0);
            else if(dayObj.day === 'monday') arr.push(1);
            else if(dayObj.day === 'tuesday') arr.push(2);
            else if(dayObj.day === 'wednesday') arr.push(3);
            else if(dayObj.day === 'thursday') arr.push(4);
            else if(dayObj.day === 'friday') arr.push(5);
            else if(dayObj.day === 'saturday') arr.push(6);
        });
    });

    return arr;
}

/************************ GENERATE APPOINTMENTS *******************************/
async function createAppts() {

    // Check if appointment slots are already stored in DB
    // If so, delete them first
    if(await apptsAreStored()) {
        deleteAppts();
        setTimeout(()=>{},1000);
    }

    // IMPORTANT NOTE WHEN WORKING WITH JS DATES
    // currentMonth and dayOfWeek ARE 0-INDEXED! (March: 2, April: 3, ...)

    // HELPER FUNCTIONS:
    //      - daysInThisMonth(month, year)
    //      - startAtNextHour(minutes)

    const settings = await getSettings(); // returns settings object

    const travelBuffer = settings.tb;
    const concurreny = settings.ca;
    const startHour = parseInt(settings.st);
    const lastHour = parseInt(settings.et);

    // blockedDates: An array of blocked date objects
    // blockedDates[i].year
    // blockedDates[i].month
    // blockedDates[i].day
    const blockedDates = await getBlockedDates();

    // blockedDays: An array of numbers (0 to 6)
    // 0: Sunday, 1: Monday, Etc...
    const blockedDays = await getBlockedDays();

    const date = new Date();

    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();
    const currentDayOfMonth = date.getDate();
    const currentHour = parseInt(date.toTimeString());
    const currentMinute = date.getMinutes();

    // Create Appointment Slots
    let appointmentArr = [];
    let dayArr = [];
    let monthArr = [];
    let yearArr = [];

    // Loops through years
    for(let i = currentYear; i < currentYear + 2; i++) {

        // Loops through months
        let j = 0;
        for(i === currentYear ?  j = currentMonth :  j = 0; j < 12; j++) {

            // Loops through days
            let k = 1;
            for(i === currentYear && j === currentMonth ? k = currentDayOfMonth : k = 1; k <= daysInThisMonth(j,i); k++) {

                //Validate The Start Time
                let validatedStart = null;
                if(currentHour > startHour && i === currentYear && j === currentMonth && k === currentDayOfMonth) {
                    validatedStart = currentHour;
                    if(startAtNextHour(currentMinute)) {
                        validatedStart += 1;
                    } else validatedStart += .5;
                } else validatedStart = startHour;

                // Loops through hours
                for(let m = validatedStart; m <= lastHour; m += .5) {

                    //console.log('Year: ' + i + ' Month: ' + j + ' Day: ' + k + ' Current Time: ' + m);
                    //console.log('--------------------');
                    // Check if date or day is blocked
                    const thisDay = new Date(i, j, k);

                    const thisDaysYear = thisDay.toISOString().slice(0,4);
                    const _y = parseInt(thisDay.toISOString().slice(5,7));
                    let _z = '';
                    if(_y < 10) {
                        _z = '0' + _y.toString();
                    } else {
                        _z = _y.toString();
                    }
                    const thisDaysMonth = _z;

                    let _x = parseInt(thisDay.toISOString().slice(8,10));
                    const thisDaysDay = _x.toString();
                    const thisDate = thisDaysYear + '-' + thisDaysMonth + '-' + thisDaysDay;

                    // Convert all the blockedDate objects into strings
                    // then throw them into a set
                    let bSet = new Set();
                    blockedDates.forEach(d => {
                        bSet.add(d);
                    });

                    if(!((bSet.has(thisDate) || blockedDays.includes(thisDay.getDay())))) {
                        let mon = '';
                        if(j+1 < 10) {
                            mon = '0' + (j+1).toString();
                        } else {
                            mon = (j+1).toString();
                        }
                        const a = new ApptSlot(i, mon, k, m, concurreny);
                        appointmentArr.push(a);
                    }

                }
                dayArr.push(appointmentArr);
                appointmentArr = [];
            }
            monthArr.push(dayArr);
            dayArr = [];
        }
        yearArr.push(monthArr);
        monthArr = [];
    }

    let result = [];

    /******************* POST THE INITIALLY CREATED APPT SLOTS **********************/
    yearArr.forEach( mArr => {
        mArr.forEach( dArr => {
            dArr.forEach( appt => {
                appt.forEach( a => {

                    const obj = {

                        date: a.date,
                        hour: a.hour,
                        day: a.dayOfMonth,
                        month: a.month,
                        year: a.year,
                        concurreny: a.concurrency

                    }

                    result.push(obj);

                });
            });
        });
    });

    // POSTING THE CREATED APPOINTMENT SLOTS
    await fetch(API_URL_APPTSLOTS, {
        method: 'POST',
        body: JSON.stringify(result),
        headers: {
            'content-type': 'application/json'
        }
    });
}

async function getAppts() {
    let arr = [];
    await fetch(API_URL_APPTSLOTS).then(response => response.json()).then(appts => {
        appts.forEach(a => {
            arr.push(a);
        });
    });

    return arr;
}

async function apptsAreStored() {
    const arr = await getAppts();
    return arr.length > 0;
}

function deleteAppts() {
    fetch(API_URL_APPTSLOTS, {
        method: 'DELETE'
    });
}


async function getApptsFromDate(year, month, day) {
    let arr = [];
    const date = year.toString() + '-' + month.toString() + '-' + day.toString();

}

// Sets the concurrency of this appointment to 0
// Effectively making it inactive
async function deleteApptSlot(year, month, day, hour) {

}

/************************ HELPERS - WORKING WITH DATES ******************************/
function daysInThisMonth(month, year) {
    // Checks and returns the number of days in a given month
    return new Date(year, month+1, 0).getDate();
}

function startAtNextHour(minutes) {
    // Determines if loop starts at (hour + .5) or (hour + 1)
    // Based on a 30 minute interval system for appointment slots
    return true;
}



/*********************** INITIALIZATION ********************************************/
displaySettings();



