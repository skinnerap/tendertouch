/********************** IMPORTS **************************************/
const express = require('express');
const cors = require('cors');
const monk = require('monk');
const morgan = require('morgan');



const app = express();

// db: holds database
const db = monk('localhost/att');



/****************** MONGO COLLECTIONS ******************************/
const xyz = db.get('/');
const packs = db.get('packages');
const adds = db.get('addons');
const genSettings = db.get('settings');
const bDays = db.get('blockedDays');
const indbDays = db.get('indBlockedDays');
const apptSlots = db.get('apptSlots');
const deletedApptSlots = db.get('deletedApptSlots');
const jobs = db.get('jobs');

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));



/********************* GET ROUTES **********************************/
app.get('/', (req, res) => {
    const id = req.params.id;
    xyz.find({}).then(p => {
        res.json(p);
    });

});

app.get('/packages', (req, res) => {
    packs.find().then(packageObjs => {
            res.json(packageObjs);
        });
});

app.get('/packages/:id', (req, res) => {
    const id = req.params.id;
    packs.find({"_id": id}).then(p => {
        res.json(p);
    });
});

app.get('/addons', (req, res) => {
    adds.find().then(addOnObjs => {
        res.json(addOnObjs);
    });
});

app.get('/addons/:id', (req, res) => {
    const id = req.params.id;
    adds.find({"_id": id}).then(a => {
        res.json(a);
    });
});

app.get('/settings', (req, res) => {
    genSettings.find().then(settingsObjs => {
        res.json(settingsObjs);
    });
});

app.get('/settings/:id', (req, res) => {
    const id = req.params.id;
    genSettings.find({"_id": id}).then(s => {
        res.json(s);
    });
});

app.get('/blockedDays', (req, res) => {
    bDays.find().then(bDaysObj => {
        res.json(bDaysObj);
    });
});

app.get('/blockedDays/:id', (req, res) => {
    const id = req.params.id;
    bDays.find({"_id": id}).then(bd => {
        res.json(bd);
    });
});

app.get('/indBlockedDays', (req, res) => {
    indbDays.find().then(indbDaysObj => {
        res.json(indbDaysObj);
    });
});

app.get('/indBlockedDays/:id', (req, res) => {
    const id = req.params.id;
    indbDays.find({"_id": id}).then(ibd => {
        res.json(ibd);
    });
});

app.get('/apptSlots', (req, res) => {
    apptSlots.find().then(appts => {
        res.json(appts);
    });
});

app.get('/apptSlots/:date', (req, res) => {
    console.log(req.params.date);
    apptSlots.find({"date": req.params.date}).then(a => {
        res.json(a);
    })
})

app.get('/apptSlots/:date/:hour', (req, res) => {
    apptSlots.find({"date": req.params.date, "hour": req.params.hour}).then(a => {
        res.json(a);
    });
});

app.get('/apptSlots/:id', (req, res) => {
    const id = req.params.id;
    apptSlots.find({"_id": id}).then(aSlot => {
        res.json(aSlot);
    });
});

app.get('/jobs', (req, res) => {
    jobs.find({}).then(jobObjs => {
        res.json(jobObjs);
    }).catch(err => {
        console.log(err);
        res.send(err);
    });
});

app.get('/jobs/:id', (req, res) => {
    jobs.find({"_id": req.params.id}).then(jobObj => {
        res.json(jobObj);
    }).catch(err => {
        console.log(err);
        res.send(err);
    });
});

app.get('/jobs/:date', (req, res) => {
    jobs.find({"date": req.params.date}).then(jobObjs => {
        res.json(jobObjs);
    }).catch(err => {
        console.log(err);
        res.send(err);
    });
});

app.get('/jobs/:date/:hour', (req, res) => {
    const hour = parseInt(req.params.hour);
    jobs.find({"date": req.params.date, "hour": hour}).then(jobObj => {
        res.json(jobObj);
    }).catch(err => {
        console.log(err);
        res.send(err);
    });
});


/************************ POST ROUTES ***************************************/
app.post('/packages', (req, res) => {
    let p = null;
    if(req.body.name.toString().trim() !== '' &&
        req.body.price.toString().trim() !== '' &&
        req.body.duration.toString().trim() !== ''){
            p = {
                name: req.body.name.toString(),
                price: req.body.price.toString(),
                duration: req.body.duration.toString(),
                type: 'package'
            }
    } else {
        throw new Error('Must fill out all fields');
    }

    if(p) {
        packs
            .insert(p)
            .then(createdP => {
                res.json(createdP);
            });
    } else {
        // Handle error
    }
});

app.post('/addons', (req, res) => {
    let a = null;
    if(req.body.name.toString().trim() !== '' &&
        req.body.price.toString().trim() !== '' &&
        req.body.duration.toString().trim() !== ''){
        a = {
            name: req.body.name.toString(),
            price: req.body.price.toString(),
            duration: req.body.duration.toString(),
            type: 'addon'
        }
    } else {
        throw new Error('Must fill out all fields');
    }

    if(a) {
        adds
            .insert(a)
            .then(createdA => {
                res.json(createdA);
            });
    } else {
        // Handle error
    }
})

app.post('/settings', (req, res) => {
    // ONLY 1 SETTINGS OBJECT MAY LIVE IN THE COLLECTION
    // START BY REMOVING THE COLLECTIONS CONTENTS
    // THEN INSERT THE NEWLY CREATED SETTINGS OBJECT
    genSettings.remove({}).then(() => {
        const s = {
            travelBuffer: req.body.tb.toString(),
            conAvailability: req.body.ca.toString(),
            apptStartTime: req.body.st.toString(),
            apptEndTime: req.body.et.toString(),
            type: req.body.type.toString()
        }

        genSettings.insert(s).then(createdS => {
            res.json(createdS);
        })
    });
});

app.post('/blockedDays', (req, res) => {
    const dayObj = {
        date: req.body.date.toString(),
        type: req.body.type.toString()
    }

    bDays.insert(dayObj).then(createdBday => {
        res.json(createdBday);
    });
})

app.post('/indBlockedDays', (req, res) => {
    const indDayObj = {
        day: req.body.day.toString(),
        numDay: req.body.dayNumbered.toString(),
        type: req.body.type.toString()
    }

    indbDays.insert(indDayObj).then(createdIndBday => {
        res.json(createdIndBday);
    })
})

app.post('/apptSlots', (req, res) => {
    apptSlots.insert(req.body).then(a => {
        res.json(a);
    });
});


/******************* UPDATE ROUTES ***********************************/

// UPDATES APPOINTMENT SLOT WHEN APPOINTMENT SLOT IS BOOKED FOR SERVICE OR BLOCKED BY ADMIN
// Note: When admin wants to use this route to block appointment slots the passed concurrency
//       parameter should be '1'. This ensures it will be updated as '0' when patched in DB
app.patch('/apptSlots/:date/:hour/:concurrency', async (req, res) => {

    const date = req.params.date;
    const hour = req.params.hour;
    const concurrency = (parseInt(req.params.concurrency) - 1).toString();

    apptSlots.update({"date": date, "hour": hour}, {$set : {"concurrency": concurrency}})
        .then(a => {
            console.log(a);
            res.json(a);
        }).catch(err => {
            console.log(err);
            res.send(err);
        });

});

// UPDATES APPOINTMENT SLOTS CONCURRENCY TO '0' WHEN ADMIN BLOCKS A DAY OF THE WEEK
app.patch('/apptSlots/:dayOfWeek', async (req, res) => {

    apptSlots.update({"dayOfWeek": req.params.dayOfWeek}, {$set : {"concurrency": '0'}}, { multi: true }).then(a => {
        console.log(a);
        res.json(a);
    }).catch(err => {
        console.log(err);
        res.send(err);
    });

})

// UPDATES APPOINTMENT SLOTS CONCURRENCY TO THE SETTINGS.CONCURRENCY WHEN ADMIN RESTORES A DAY OF WEEK
app.patch('/apptSlots/:dayOfWeek/:concurrency', async (req, res) => {

    apptSlots.update({"dayOfWeek": req.params.dayOfWeek}, {$set : {"concurrency": req.params.concurrency}}, { multi: true })
    .then(a => {
        console.log(a);
        res.json(a);
    }).catch(err => {
        console.log(err);
        res.send(err);
    });

})



/*********************** DELETE ROUTES **************************************/

app.delete('/packages/:id', (req, res) => {
    packs.remove({"_id": req.params.id });
});

app.delete('/addons/:id', (req, res) => {
    adds.remove({"_id": req.params.id });
});

app.delete('/blockedDays/:id', (req, res) => {
    bDays.remove({"_id": req.params.id});
});

app.delete('/indBlockedDays/:id', (req, res) => {
    indbDays.remove({"_id": req.params.id});
});

app.delete('/apptSlots/:id', (req, res) => {
    apptSlots.remove({"_id": req.params.id});
});

app.delete('/apptSlots', (req, res) => {
    apptSlots.remove({});
});

app.delete('/deletedApptSlots/:id', (req, res) => {
    deletedApptSlots.remove({"_id": req.params.id});
});




/****************** LISTENING ON SERVER *****************************/
app.listen(5000, () => {
    console.log('Listening on http://localhost:5000');
});