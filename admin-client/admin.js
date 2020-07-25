/**************** COLORS  *******************/
const mainDivColor = '#dbfadb';
const successColor = '#0ad164';
const errorColor = '#d12435';



/************ DOM ELEMENTS **************/

// General Settings
const createNewSettings = document.querySelector('#generalSettingsSubmit');

// Packages
const createNewPackage = document.querySelector('#package-submit');
const allPackagesBtn = document.querySelector('#showPackagesSubmit');

// Add-ons
const createNewAddon = document.querySelector('#addOn-submit');
const allAddOnsBtn = document.querySelector('#showAddOnsSubmit');

// Blocked Dates
const createNewBlockedDate = document.querySelector('#blockDaySubmit')
const allBlockedDaysBtn = document.querySelector('#showBlockedDaysSubmit');

// Blocked Days of the Week
const createNewBlockedDayOfWeek = document.querySelector('#indefiniteSubmit');
const allIndBlockedDaysBtn = document.querySelector('#showIndBlockedDaysSubmit');

// Create Appointments Button
const createApptsBtn = document.querySelector('#create-appts');




/************* ROUTES *****************/

const API_URL_PACKAGES = 'http://localhost:5000/packages';
const API_URL_ADDONS = 'http://localhost:5000/addons';
const API_URL_SETTINGS = 'http://localhost:5000/settings';
const API_URL_BLOCKDAY = 'http://localhost:5000/blockedDays';
const API_URL_BLOCKDAYIND = 'http://localhost:5000/indBlockedDays';
const API_URL_APPTSLOTS = 'http://localhost:5000/apptSlots';



/******* APPOINTMENT SLOT CONSTRUCTOR ********/

function ApptSlot(year, month, dayOfMonth, hour, concurrency) {
    // time: start time of the appointment slot
    // teams: teams available during this appointment slot
    this.year = year;
    this.month = month;
    this.dayOfMonth = dayOfMonth;
    this.hour = hour;
    this.concurrency = concurrency;
    this.date = this.year.toString() + '-' + this.month.toString() + '-' + this.dayOfMonth.toString();
    this.dateObj = new Date(this.year, this.month - 1, this.dayOfMonth);
    this.dayOfWeek = this.dateObj.getDay();
    
}



/************* SETTINGS ****************/

// On Click of General Settings Submit Button
createNewSettings.addEventListener('click', (event) => {
    // Prevents the default behaviour of submission by browser
    event.preventDefault();

    // DOM Element and Form Data
    const settingsForm = document.querySelector('.settingsForm');
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
        .then(settingsObj => {
            console.log(settingsObj);

            // Resets the Form Data
            settingsForm.reset();

            // Confirmation of Success to Admin
            const confirm = document.querySelector('#settings-submission');
            confirm.style.backgroundColor = successColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
            
    })).catch(err => {
        console.log(err);

        // Confirmation of Error to Admin
        const confirm = document.querySelector('#settings-submission');
        confirm.style.backgroundColor = errorColor;
        setTimeout(()=> {
            confirm.style.backgroundColor = mainDivColor;
        }, 3000);
        
    });
});

async function getSettings() {
    // A pseudo constructor for the general settings object
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
    }).catch(err => {
        // Properties set as null will be used as a check when executing 
        // algorithms and savings into DB
        o.tb = null;
        o.ca = null;
        o.st = null;
        o.et - null;
    });

    // Returning the General Settings Object
    return o;
}

async function displaySettings() {
    // DOM Elements
    const tb = document.getElementById('currentTB');
    const ca = document.getElementById('currentCA');
    const st = document.getElementById('currentST');
    const et = document.getElementById('currentET');

    // Returns an object with the general settings properties
    const obj = await getSettings();

    // If not all general setting properties are set
    // tell Admin to set them
    if(obj.tb === null || obj.ca === null || obj.st === null || obj.et === null) {
        tb.textContent = 'NOT SET: Please save all general settings.';
        ca.textContent = 'NOT SET: Please save all general settings.';
        st.textContent = 'NOT SET: Please save all general settings.';
        et.textContent = 'NOT SET: Please save all general settings.';
    // If all general settings are set, display them.
    } else {
        tb.textContent = obj.tb.toString();
        ca.textContent = obj.ca.toString();
        st.textContent = obj.st.toString();
        et.textContent = obj.et.toString();
    }
}



/************* PACKAGES ***************/

// On Click of Create New Package Button
createNewPackage.addEventListener('click', (event) => {
    // Prevents the default behaviour of submission by browser
    event.preventDefault();

    // DOM Element and Form Data
    const packageForm = document.querySelector('.packageForm');
    const packageData = new FormData(packageForm);
    const name = (packageData.get('packageName')).toString();
    const price = (packageData.get('packagePrice')).toString();
    const duration = (packageData.get('packageDuration')).toString();
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
        .then(packageObj => {
            console.log(packageObj);

            // Resets the Form Data
            packageForm.reset();

            // Confirmation of Success to Admin
            const confirm = document.querySelector('#package-submission');
            confirm.style.backgroundColor = successColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
            
    })).catch(err => {
        console.log(err);

        // Confirmation of Error to Admin
        const confirm = document.querySelector('#package-submission');
        confirm.style.backgroundColor = errorColor;
        setTimeout(()=> {
            confirm.style.backgroundColor = mainDivColor;
        }, 3000);
        
    });
});

// On Click of Show All Packages
allPackagesBtn.addEventListener('click', async () => {
    await displayPackages();
});

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

// Display All Current Packages and Gives the Option to Delete one from the DB
async function displayPackages() {
    // Get the Array of Package Objects
    const packages = await getPackages();

    // DOM Element to insert current packages into
    const showPackages = document.querySelector('.showPackages');

    // Inserting the current packages into the DOM
    let html = '';
    packages.forEach(p => {
        html += `<option id="${p._id}" name="${p._id}">${p._id} - Name: ${p.name}, Price: $${p.price}, Duration: ${p.duration}(minutes)</option>`;
    });

    showPackages.innerHTML = html;

    // DOM Element to insert a Delete Button into
    const div = document.querySelector('.deletePackage');
    div.innerHTML = `<button class='delBtn' id='deletePackageSubmit'>DELETE PACKAGE</button>`;
    
    // Newly created Delete Button Element
    const delPackageButton = document.querySelector('#deletePackageSubmit');

    // On Click of new Delete Button
    delPackageButton.addEventListener('click', () => {
        // Get the selected Package
        const delForm = document.querySelector('.showPackages');
        const opt = delForm.options[delForm.selectedIndex];
        
        const confirm = document.querySelector('#package-delete-submission');

        // Remove it from the DB
        try {
            // Try to delete
            fetch(API_URL_PACKAGES + '/' + opt.id, {
                method: 'DELETE'
            });

            // On Success
            confirm.style.backgroundColor = successColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
            
        } catch {
            // On Error
            console.log('Error: Failure to Delete Package from Database');
            confirm.style.backgroundColor = errorColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
            
        }
    });
}



/*********************** ADD-ONS **************************/

// On Click of Create New Package
createNewAddon.addEventListener('click', (event) => {
    // Prevents default behavior of browser on submission
    event.preventDefault();

    const addOnForm = document.querySelector('.addOnForm');
    const addOnData = new FormData(addOnForm);

    // Getting Form Data and Stringing it for security
    const name = (addOnData.get('addOnName')).toString();
    const price = (addOnData.get('addOnPrice')).toString();
    const duration = (addOnData.get('addOnDuration')).toString();
    const type = 'addon';

    const addOnObj = {
        name,
        price,
        duration,
        type
    };

    const confirm = document.querySelector('#addon-submission');

    fetch(API_URL_ADDONS, {
        method: 'POST',
        body: JSON.stringify(addOnObj),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json()
        .then(addon => {
            console.log(addon)
            addOnForm.reset();

            // On Success
            confirm.style.backgroundColor = successColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
        })).catch(err => {
            console.log(err);

            // On Error
            confirm.style.backgroundColor = errorColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
        });
});

// On Click of Show All Add-ons
allAddOnsBtn.addEventListener('click', async () => {
    await displayAddons();
});

// Returns an Array of all the Add-on Objects
async function getAddons() {
    // Array to push add-on objects into
    let arr = [];

    await fetch(API_URL_ADDONS).then(res => res.json()).then(addons => {
        addons.forEach(a => {
            arr.push(a);
        });
    });

    return arr;
}

// Display All Current Add-ons and gives the Option to Delete one of them
async function displayAddons() {
    // Get the Array of Add-on Objects
    const addons = await getAddons();

    // DOM Element to insert current add-ons into
    const showAddons = document.querySelector('.showAddOns');

    // Inserting the current add-ons into the DOM
    let html = '';
    addons.forEach(a => {
        html += `<option id="${a._id}" name="${a._id}">${a._id} - Name: ${a.name}, Price: $${a.price}, Duration: ${a.duration}(minutes)</option>`;
    });

    showAddons.innerHTML = html;

    // DOM Element to insert a Delete Button into
    const div = document.querySelector('.deleteAddOn');
    div.innerHTML = `<button class='delBtn' id='deleteAddOnSubmit'>DELETE PACKAGE</button>`;
    
    // Newly created Delete Button Element
    const delAddonButton = document.querySelector('#deleteAddOnSubmit');

    // On Click of new Delete Button
    delAddonButton.addEventListener('click', () => {
        // Get the selected Add-on
        const delForm = document.querySelector('.showAddOns');
        const opt = delForm.options[delForm.selectedIndex];

        const confirm = document.querySelector('#addon-delete-submission');
        // Remove it from the DB
        try {
            // Try to delete
            fetch(API_URL_ADDONS + '/' + opt.id, {
                method: 'DELETE'
            });

            // On Success
            confirm.style.backgroundColor = successColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 5000);
        } catch {
            // On Error
            console.log('Error: Failure to Delete Add-on from Database');
            confirm.style.backgroundColor = errorColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
        }
    });
}



/********************** BLOCKED DATES *****************************/

// On Click of Create New Blocked Date
createNewBlockedDate.addEventListener('click', async (event) => {

    // Prevents default behavior of submission in browser
    event.preventDefault();

    // DOM Element and Form Data
    const blockDayForm = document.querySelector('.admin-block-day');
    const blockDayData = new FormData(blockDayForm);
    const date = blockDayData.get('blockedDay');
    const type = 'blockedDay';

    const blockDayObj = {
        date,
        type
    }

    const currentBlockedDates = await getBlockedDates();
    let blockedDatesSet = new Set();

    currentBlockedDates.forEach(d => {
        blockedDatesSet.add(d.date);
    });
    
    // Insert this Date into the DB for Blocked Dates
    // Used for confirmation of success or error to Admin
    const confirm = document.querySelector('#blockedDay-submission');
    const confirmMsg = document.querySelector('#blockedDay-submission-message');

    if(blockedDatesSet.has(blockDayObj.date)) {
        // This Date is already Blocked
        console.log('This date is already saved as a blocked date in the database');
        // On Error
        confirm.style.backgroundColor = errorColor;
        confirmMsg.textContent = 'This date is already blocked';
        setTimeout(()=> {
            confirm.style.backgroundColor = mainDivColor;
            confirmMsg.textContent = '';
        }, 3000);

    } else {

        // Update the Concurrency to '0' in the DB for all Appointment Slots on this Date
        const settingObj = await getSettings();
        await blockAppointmentSlotRange(blockDayObj.date, settingObj.st, settingObj.et);

        // Post the blocked date to it's collection in the DB
        fetch(API_URL_BLOCKDAY, {
            method: 'POST',
            body: JSON.stringify(blockDayObj),
            headers: {
                'content-type': 'application/json'
            }
        }).then(res => res.json()).then(dateObj => {
            

            // On Success
            confirm.style.backgroundColor = successColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000); 
        }).catch(err => {
            console.log(err);

            // On Error
            confirm.style.backgroundColor = errorColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
        });

    }
    
})

allBlockedDaysBtn.addEventListener('click', async () => {
    await displayBlockedDates();
})

// Returns an Array of Blocked Dates
async function getBlockedDates() {

    // Array to push blocked dates into
    let arr = [];

    try {
        await fetch(API_URL_BLOCKDAY).then(res => res.json()).then(dates => {
            dates.forEach(d => {
                arr.push(d);
            });
        });
    } catch {
        console.log('Error: Could not retrieve the blocked dates');
    }
    
    return arr;
}

// Displays All Current Blocked Dates and gives the Option to Delete one
async function displayBlockedDates() {

    const dates = await getBlockedDates();
    const dateContainer = document.querySelector('.restoreBlockedDaysOptions');
    let html = '';

    dates.forEach(d => {
        html += `<option id="${d._id}" name="${d._id}">${d.date}</option>`;
    });

    dateContainer.innerHTML = html;

    const div = document.querySelector('.restoreBdays');

    div.innerHTML = `<button class='delBtn' id='restoreBlockedDaySubmit'>RESTORE DATE</button>`;
    const deleteDate = document.querySelector('#restoreBlockedDaySubmit');
    deleteDate.addEventListener('click', async () => {

        // Get Selected Date
        const opt = dateContainer.options[dateContainer.selectedIndex];

        const confirm = document.querySelector('#blockedDay-restore-submission');

        // Restore the concurrency on all appt slots on this date
        const settings = await getSettings();
        await restoreAppointmentSlotRange(opt.value, settings.st, settings.et);

        // Try to Delete the Blocked Date
        try {
            fetch(API_URL_BLOCKDAY + '/' + opt.id, {
                method: 'DELETE'
            }); 

            // On Success
            confirm.style.backgroundColor = successColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
        // On Error
        } catch {
            console.log('Error: Could not restore blocked date');

            // On Error
            confirm.style.backgroundColor = errorColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
        }   
    });
}



/***************** BLOCKED DAYS OF THE WEEK ********************/

// On Click of Create New Blocked Day of Week
createNewBlockedDayOfWeek.addEventListener('click', async (event) => {

    // Prevents default behavior of browser on submission
    event.preventDefault();

    const indBlockForm = document.querySelector('#indefinitelyBlockedDay');
    const day = (indBlockForm.options[indBlockForm.selectedIndex].value).toString();
    const type = 'blockedDay';

    const daysIndexed = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    let dayNumbered = '';

    if(day === daysIndexed[0]) dayNumbered = '0';
    if(day === daysIndexed[1]) dayNumbered = '1';
    if(day === daysIndexed[2]) dayNumbered = '2';
    if(day === daysIndexed[3]) dayNumbered = '3';
    if(day === daysIndexed[4]) dayNumbered = '4';
    if(day === daysIndexed[5]) dayNumbered = '5';
    if(day === daysIndexed[6]) dayNumbered = '6';

    const blockedDayObj = {
        day,
        dayNumbered,
        type
    }

    const confirm = document.querySelector('#indBlockedDay-submission');
    const confirmMsg = document.querySelector('#indBlockedDay-submission-message');

    let blockedDaysSet = new Set();
    const currentBlockedDaysOfWeek = await getBlockedDaysOfWeek();

    currentBlockedDaysOfWeek.forEach(d => {
        blockedDaysSet.add(d.day);
    });

    if(blockedDaysSet.has(blockedDayObj.day)) {
        // This Day of the Week is already blocked in the database
        confirm.style.backgroundColor = errorColor;
        confirmMsg.textContent = 'Error: This day of the week is already blocked...';
        setTimeout(()=> {
            confirm.style.backgroundColor = mainDivColor;
            confirmMsg.textContent = '';
        }, 3000);

    } else {

        // UPDATE THE CONCURRENCY TO 0 FOR ALL BLOCKED DAYS OF THE WEEK
        await blockAppointmentSlotsOnDayOfWeek(blockedDayObj.dayNumbered);

        try {
            fetch(API_URL_BLOCKDAYIND, {
                method: 'POST',
                body: JSON.stringify(blockedDayObj),
                headers: {
                    'content-type': 'application/json'
                }
            });
    
            // On Success
            confirm.style.backgroundColor = successColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
            
        } catch {
            console.log('Error: Could not save the blocked day of the week into the database');
    
            // On Error
            confirm.style.backgroundColor = errorColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);
            
        }

    }
    
});

// On Click of Restore Blocked Day of Week
allIndBlockedDaysBtn.addEventListener('click', () => {
    displayBlockedDaysOfWeek();
});

// Returns an Array of Blocked Days of the Week
async function getBlockedDaysOfWeek() {

    // Array to push blocked dates into
    let arr = [];

    try {
        await fetch(API_URL_BLOCKDAYIND).then(res => res.json()).then(days => {
            days.forEach(d => {
                arr.push(d);
            });
        });
    } catch {
        console.log('Error: Could not retrieve the blocked days of the week');
    }
    
    return arr;
}

// Displays All Current Blocked Days of the Week and gives the Option to Delete one
async function displayBlockedDaysOfWeek() {

    let html = '';
    const dayContainer = document.querySelector('.restoreIndBlockedDaysOptions');
    const days = await getBlockedDaysOfWeek();  

    days.forEach(d => {
        html += `<option id="${d._id}" name="${d._id}">${d.day}</option>`;
    });

    dayContainer.innerHTML = html;

    const div = document.querySelector('.restoreIndBdays');
    div.innerHTML = `<button class='delBtn' id='restoreIndBlockedDaySubmit'>RESTORE DAY</button>`;
    const deleteBlockedDay = document.querySelector('#restoreIndBlockedDaySubmit');

    const confirm = document.querySelector('#indBlockedDay-restore-submission');

    deleteBlockedDay.addEventListener('click', async () => {

        const opt = dayContainer.options[dayContainer.selectedIndex];

        const daysIndexed = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        let dayNumbered = '';

        if(opt.value === daysIndexed[0]) dayNumbered = '0';
        if(opt.value === daysIndexed[1]) dayNumbered = '1';
        if(opt.value === daysIndexed[2]) dayNumbered = '2';
        if(opt.value === daysIndexed[3]) dayNumbered = '3';
        if(opt.value === daysIndexed[4]) dayNumbered = '4';
        if(opt.value === daysIndexed[5]) dayNumbered = '5';
        if(opt.value === daysIndexed[6]) dayNumbered = '6';

        // Updates the concurrency for restored days of the week
        const currentConcurrency = await getCurrentConcurrency();

        try {
            fetch(API_URL_APPTSLOTS + '/' + dayNumbered + '/' + currentConcurrency, {
                method: 'PATCH'
            });
        } catch {
            console.log('Error: Unable to update concurrency on restored days of the week');
        }

        try {
            fetch(API_URL_BLOCKDAYIND + '/' + opt.id, {
                method: 'DELETE'
            });
            
            // On Success
            confirm.style.backgroundColor = successColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);

        } catch {

            console.log('Error: Could not restore blocked day of week');

            // On Error
            confirm.style.backgroundColor = errorColor;
            setTimeout(()=> {
                confirm.style.backgroundColor = mainDivColor;
            }, 3000);

        }
    });
}



/**************************** APPOINTMENT SLOTS *************************************/

// On Click of Create Appointments
createApptsBtn.addEventListener('click', () => {
    createAppointments();
});

// Creates Appointment Availability
async function createAppointments() {

    // Retrieve neccessary data
    const settings = await getSettings();
    const blockedDates = await getBlockedDates();
    const blockedDaysOfWeek = await getBlockedDaysOfWeek();

    const dayOfWeekIndexed = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    // Throw all the blocked days of week into a set
    let blockedDaysOfWeekSet = new Set();
    blockedDaysOfWeek.forEach(d => {
        let res = '';

        if(d.day === 'sunday') res = 0;
        if(d.day === 'monday') res = 1;
        if(d.day === 'tuesday') res = 2;
        if(d.day === 'wednesday') res = 3;
        if(d.day === 'thursday') res = 4;
        if(d.day === 'friday') res = 5;
        if(d.day === 'saturday') res = 6;

        blockedDaysOfWeekSet.add(res);
    });

    // Throw all the blocked dates into a set
    let bSet = new Set();
    blockedDates.forEach(d => {
        bSet.add(d.date);
    });

    // If appointment slots are already stored delete them first
    if(await apptsAreStored()) {
        await deleteAppts();
    }

    // Settings used to create appointment slots
    const concurrency = parseInt(settings.ca);
    const startHour = parseInt(settings.st);
    const lastHour = parseInt(settings.et);

    // Date and Times used to create appointment slots
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

                    let thisDaysDay = '';

                    let _x = parseInt(thisDay.toISOString().slice(8,10));
                    let _xx = '';
                    if(_x < 10) {
                        thisDaysDay = '0' + _x.toString();
                    } else {
                        thisDaysDay = _x.toString();
                    }
                    
                    const thisDate = thisDaysYear + '-' + thisDaysMonth + '-' + thisDaysDay;

                    let mon = '';
                    if(j+1 < 10) {
                        mon = '0' + (j+1).toString();
                    } else {
                        mon = (j+1).toString();
                    }

                    // If this is not a blocked date or blocked day of week
                    if((bSet.has(thisDate) || blockedDaysOfWeekSet.has(thisDay.getDay()))) {
                        // Setting available appointment slot
                        const a = new ApptSlot(i, mon, thisDaysDay, m, 0);
                        appointmentArr.push(a);
                    // If it is a blocked date or blocked day of week
                    } else {
                        // Setting 'Concurrency' to zero to indicate the appointment is
                        // blocked and therefore unavailable
                        const a = new ApptSlot(i, mon, thisDaysDay, m, concurrency);
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

                        date: a.date.toString(),
                        hour: a.hour.toString(),
                        day: a.dayOfMonth.toString(),
                        month: a.month.toString(),
                        year: a.year.toString(),
                        concurrency: a.concurrency.toString(),
                        dayOfWeek: a.dayOfWeek.toString()

                    }

                    result.push(obj);

                });
            });
        });
    });
    

    const confirm = document.querySelector('#appt-create-submission');

    try {
        // POSTING THE CREATED APPOINTMENT SLOTS
        await fetch(API_URL_APPTSLOTS, {
            method: 'POST',
            body: JSON.stringify(result),
            headers: {
                'content-type': 'application/json'
            }
        });

        // Visual Confirmation of Success to Admin
        confirm.style.backgroundColor = successColor;
        setTimeout(() => {
            confirm.style.backgroundColor = mainDivColor;
        }, 3000);
    } catch {

        console.log('Error: Did not store appointment slots into database');

        // Visual Confirmation of Error to Admin
        confirm.style.backgroundColor = errorColor;
        setTimeout(() => {
            confirm.style.backgroundColor = mainDivColor;
        }, 3000);
    }
    
}

// Returns an Array of All Appointment Slots
async function getAppts() {
    let arr = [];
    await fetch(API_URL_APPTSLOTS).then(response => response.json()).then(appts => {
        appts.forEach(a => {
            arr.push(a);
        });
    });

    return arr;
}

// Returns true if appointment slots are stored in DB, false if they are not
async function apptsAreStored() {
    const arr = await getAppts();
    return arr.length > 0;
}

// Deletes all Appointment Slots currently stored in the database
async function deleteAppts() {
    try {
        await fetch(API_URL_APPTSLOTS, {
            method: 'DELETE'
        });
    } catch {
        console.log('Error: Could not delete all appointment slots');
    }   
}

// UPDATES THE CONCURRENCY OF AN APPOINTMENT SLOT WHEN BLOCKED
async function blockAppointmentSlot(date, hour) {

    // Important Note: The logic for decrementing the appointments concurrency is on the 
    //                 server side. Therefore I set the passed concurrency to '1' if the 
    //                 appointment slot is already at 1 or less. This is all a means to 
    //                 never allow an appointment's concurrency to drop below 0.

    let concurrency = '1';
    
    try {
        await fetch(API_URL_APPTSLOTS + '/' + date + '/' + hour + '/' + concurrency, {
            method: 'PATCH'
        });
    } catch {
        console.log('Error: Could not update appointment slot');
    }   

}

// UPDATES THE CONCURRENCY ON A RANGE OF APPOINTMENT SLOTS WHEN BLOCKED
async function blockAppointmentSlotRange(date, startHour, endHour) {

    for(let currentHour = parseInt(startHour); currentHour <= parseInt(endHour); currentHour += .5) {

        await blockAppointmentSlot(date, currentHour);

    }

}

// UPDATES THE CONCURRENCY OF AN APPOINTMENT SLOT WHEN RESTORED
async function restoreAppointmentSlot(date, hour) {

    // Important Note:  I will be using the block appointment route and pass in
    //                  a concurrency that is 1 more than the settings.concurrency
    //                  and allowing the route to decrement it down to the desired value

    const settings = await getSettings();
    const concurrency = (parseInt(settings.ca) + 1).toString();
    
    try {
        await fetch(API_URL_APPTSLOTS + '/' + date + '/' + hour + '/' + concurrency, {
            method: 'PATCH'
        });
    } catch {
        console.log('Error: Could not update appointment slot');
    }     

}

// UPDATES THE CONCURRENCY ON A RANGE OF APPOINTMENT SLOTS WHEN RESTORED
async function restoreAppointmentSlotRange(date, startHour, endHour) {

    for(let currentHour = parseInt(startHour); currentHour <= parseInt(endHour); currentHour += .5) {

        await restoreAppointmentSlot(date, currentHour);

    }    

}

// UPDATES THE CONCURRENCY TO 0 ON A BLOCKED DAY OF THE WEEK
async function blockAppointmentSlotsOnDayOfWeek(dayOfWeek) {

    try {
        await fetch(API_URL_APPTSLOTS + '/' + dayOfWeek, {
            method: 'PATCH'
        });
    } catch {
        console.log('Error: Unable to update database with blocked day of the week.');
    }

}

// UPDATES THE CONCURRENCY TO THE SETTINGS.CONCURRENCY VALUE FOR RESTORED DAYS OF THE WEEK
async function restoreAppointmentSlotsOnDayOfWeek(dayOfWeek, concurrency) {

    try {
        await fetch(API_URL_APPTSLOTS + '/' + dayOfWeek + '/' + concurrency, {
            method: 'PATCH'
        });
    } catch {
        console.log('Error: Unable to update database with blocked day of the week.');
    }

}

async function getCurrentConcurrency() {

    const settings = await getSettings();

    return settings.ca;

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




/******************* INITIALIZATION *************************/
displaySettings();
