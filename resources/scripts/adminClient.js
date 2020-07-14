/******* GET FORM/SUBMIT ELEMENTS *****/
const packageForm = document.querySelector('.packageForm');
const packageSub = document.querySelector('#package-submit');
const addOnForm = document.querySelector('.addOnForm');
const addOnSub = document.querySelector('#addOn-submit');
const settingsForm = document.querySelector('.settingsForm');
const settingsSub = document.querySelector('#generalSettingsSubmit');
const blockDayForm = document.querySelector('.admin-block-day');
const blockDaySub = document.querySelector('#blockDaySubmit')
const blockDayIndForm = document.querySelector('.admin-block-day-ind');
const blockDayIndSub = document.querySelector('#indefiniteSubmit');
// Following 4 elements work in tandem to delete an appt slot from DB
const apptsOnDayForm = document.querySelector('.admin-appts-on-day');
const apptsOnDaySub = document.querySelector('#apptsOnDaySubmit');
// INSERT VARIABLE FOR DELETE-APPT-SLOT-FORM and SUBMIT BTN HERE
// 1
// 2
// Following 4 elements work in tandem to restore a deleted appt slot from DB
const delApptsOnDayForm = document.querySelector('.admin-deleted-appts-on-day');
const delApptsOnDaySub = document.querySelector('#deletedApptsOnDaySubmit');
// INSERT VARIABLE FOR RESTORE-APPT-SLOT-FORM and SUBMIT BTN HERE
// 1
// 2

/****** ROUTES ********/
const API_URL_PACKAGES = 'http://localhost:5000/packages';
const API_URL_ADDONS = 'http://localhost:5000/addons';
const API_URL_SETTINGS = 'http://localhost:5000/settings';
const API_URL_BLOCKDAY = 'http://localhost:5000/blockday';
const API_URL_BLOCKDAYIND = 'http://localhost:5000/blockdayind';
const API_URL_APPTSONDAY = 'http://localhost:5000/apptsonday';
const API_URL_DELAPPTSONDAY = 'http://localhost:5000/deletedapptsonday';


/***** POSTING GENERAL SETTINGS *****/
settingsSub.addEventListener('click', (event) => {
    event.preventDefault();
    const settingsData = new FormData(settingsForm);
    const travelBuffer = settingsData.get('travelBuffer');
    const conAvailability = settingsData.get('concurrentAvailability');
    const apptStartTime = settingsData.get('apptStartTime');
    const apptEndTime = settingsData.get('apptEndTime');
    const type = 'settings';

    const settingsObj = {
        travelBuffer,
        conAvailability,
        apptStartTime,
        apptEndTime,
        type
    }

    fetch(API_URL_SETTINGS, {
        method: 'POST',
        body: JSON.stringify(settingsObj),
        headers: {
            'content-type': 'application/json'
        }
    });
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
    });

});

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
    });

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
})

/****** POSTING NEW INDEFINITELY BLOCKED DAY ******/
blockDayIndSub.addEventListener('click', (event) => {
    event.preventDefault();
    const blockDayIndData = new FormData(blockDayIndForm);
    const date = blockDayIndData.get('indefinitelyBlockedDay');
    const type = 'blockedDayInd';

    const blockDayIndObj = {
        date,
        type
    }

    fetch(API_URL_BLOCKDAYIND, {
        method: 'POST',
        body: JSON.stringify(blockDayIndObj),
        headers: {
            'content-type': 'application/json'
        }
    });
})

/***** POSTING A DAY TO GRAB APPT SLOTS FROM ******/
apptsOnDaySub.addEventListener('click', (event) => {
    event.preventDefault();
    const apptsOnDayData = new FormData(apptsOnDayForm);
    const day = apptsOnDayData.get('dayToGet');
    const type = 'dayOfApptSlots';

    const apptsOnDayObj = {
        day,
        type
    }

    fetch(API_URL_APPTSONDAY, {
        method: 'POST',
        body: JSON.stringify(apptsOnDayObj),
        headers: {
            'content-type': 'application/json'
        }
    });
});

/***** POSTING A DAY TO GRAB DELETED APPT SLOTS FROM ******/
delApptsOnDaySub.addEventListener('click', (event) => {
    event.preventDefault();
    const delApptsOnDayData = new FormData(delApptsOnDayForm);
    const day = delApptsOnDayData.get('deletedDayToGet');
    const type = 'dayOfDeletedApptSlots';

    const delApptsOnDayObj = {
        day,
        type
    }

    fetch(API_URL_DELAPPTSONDAY, {
        method: 'POST',
        body: JSON.stringify(delApptsOnDayObj),
        headers: {
            'content-type': 'application/json'
        }
    });
})