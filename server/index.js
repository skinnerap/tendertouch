if(process.env.NODE_ENV !== 'production') {
    const env = require('dotenv');
    env.config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const webhookSecret = process.env.WEBHOOK_SECRETY_KEY;
const twilioSID = process.env.TWILIO_SID;
const twilioToken = process.env.TWILIO_TOKEN;



/********************** IMPORTS **************************************/
const express = require('express');
const cors = require('cors');
const monk = require('monk');
const morgan = require('morgan');
const stripe = require('stripe')(stripeSecretKey);
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
const db = monk('localhost/att');
const sms = new twilio(twilioSID, twilioToken);




/****************** MONGO COLLECTIONS ******************************/
const packs = db.get('packages');
const adds = db.get('addons');
const genSettings = db.get('settings');
const bDays = db.get('blockedDays');
const indbDays = db.get('indBlockedDays');
const apptSlots = db.get('apptSlots');
const deletedApptSlots = db.get('deletedApptSlots');
const jobs = db.get('jobs');

// only use the raw bodyParser for webhooks
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else { 
        express.json({limit: '50mb'})(req, res, next);
    }
});

app.use(cors());
//app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));



// This section needs to be adjusted if the stripe price id's are adjusted in the stripe dashboard
/****************** STRIPE PRICE ID's  *****************************/

const stripeIds = {

    'General Wash - Car' : 40,
    'General Wash - Truck' : 60,
    'General Wash - SUV' : 60,
    'Interior Detail - Car' : 100,
    'Interior Detail - Truck' : 125,
    'Interior Detail - SUV' : 125,
    'Exterior Detail - Car' : 100,
    'Exterior Detail - Truck' : 125,
    'Exterior Detail - SUV' : 125,
    'Full Detail - Car' : 160,
    'Full Detail - Truck' : 180,
    'Full Detail - SUV' : 180,
    'Shampoo Floor and Seats' : 40,
    'Condition Leather' : 40,
    'Clean & Detail Surfaces' : 30,
    'Hand Wax and Buff' : 30,
    'Engine Compartment Cleaned' : 45,
    'Chrome Shined' : 15,
    'Rims Cleaned and Shined' : 15

}

const getPrices = (names) => {

    console.log(names);

    let total = 0;

    const priceMap = {
        'General Wash - Car' : 40,
        'General Wash - Truck' : 60,
        'General Wash - SUV' : 60,
        'Interior Detail - Car' : 120,
        'Interior Detail - Truck' : 145,
        'Interior Detail - SUV' : 145,
        'Exterior Detail - Car' : 100,
        'Exterior Detail - Truck' : 125,
        'Exterior Detail - SUV' : 125,
        'Full Detail - Car' : 160,
        'Full Detail - Truck' : 185,
        'Full Detail - SUV' : 185,
        'Shampoo Floor and Seats' : 40,
        'Condition Leather' : 40,
        'Clean & Detail Surfaces' : 40,
        'Hand Wax and Buff' : 40,
        'Engine Compartment Cleaned' : 45,
        'Chrome Shined' : 25,
        'Rims Cleaned and Shined' : 25
    }

    names.forEach(name => {
        total += priceMap[name] * 100;
    });

    return total;

}

const chargeCustomer = async (customerId) => {
    // Lookup the payment methods available for the customer
    const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card"
    });
    // Charge the customer and payment method immediately
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: "usd",
        customer: customerId,
        payment_method: paymentMethods.data[0].id,
        off_session: true,
        confirm: true
    });
    if (paymentIntent.status === "succeeded") {
        console.log("✅ Successfully charged card off session");
    }
}

app.post("/create-payment-intent", async (req, res) => {

    // Alternatively, set up a webhook to listen for the payment_intent.succeeded event
    // and attach the PaymentMethod to a new Customer
    const customer = await stripe.customers.create();

    // Seperate the customer's email from the purchases in req.body (Email in index[0])
    const email = req.body[0];
    let purchases = [];
    for(let i = 1; i < req.body.length; i++) {
        purchases.push(req.body[i]);
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        customer: customer.id,
        setup_future_usage: 'off_session',
        amount: getPrices(purchases),
        currency: "usd",
        receipt_email: email
    });

    res.send({
        clientSecret: paymentIntent.client_secret
    });

});
 
app.get('/stripe-price/:name', async (req, res) => {

    const key = req.params.name;

    res.json(stripeIds[key]);

});

app.get('/stripe-key', (req, res) => {
    res.json(stripePublicKey);
});

  
// Stripe requires the raw body to construct the event
app.post('/webhook', bodyParser.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      // On error, log and return the error message
      console.log(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Fulfill the purchase...
        
    }
  
    // Successfully constructed event
    //console.log('✅ Success:', event.id);
    //console.log(event);
  
    // Return a response to acknowledge receipt of the event
    res.json({received: true});
});


/********************* GET ROUTES **********************************/

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
    apptSlots.find({"date": req.params.date}).then(a => {
        res.json(a);
    })
})

app.get('/apptSlots/:date/:hour', (req, res) => {
    apptSlots.find({"date": req.params.date, "hour": req.params.hour}).then(a => {
        res.json(a);
    });
});

/*app.get('/apptSlots/:id', (req, res) => {
    const id = req.params.id;
    apptSlots.find({"_id": id}).then(aSlot => {
        res.json(aSlot);
    });
});*/

app.get('/jobs', (req, res) => {
    jobs.find({}).then(jobObjs => {
        res.json(jobObjs);
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

app.get('/jobs/:year/:month/:day', (req, res) => {
    const year = parseInt(req.params.year) - 1;
    const month = parseInt(req.params.month) - 1;
    const day = parseInt(req.params.day) - 1;
    const date = new Date(year, month, day);
    console.log(date);

    jobs.find( {dateYear: {$gt : year} , dateDay: {$gt : month}, dateMonth: {$gt : day}} )
    .then(jobs => {
        res.json(jobs);
    }).catch(err => {
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

app.post('/jobs', (req, res) => {

    const businessNumber = '(999) 999 - 9999';
    let phoneNumber = req.body.customer.phone;
    if(phoneNumber[0] === '1') {
        phoneNumber = '+' + phoneNumber;
    } else {
        phoneNumber = '+1' + phoneNumber;
    }

    // Cast all add-ons as a string for admin's SMS
    let upgrades = '';
    req.body.services.upgrades.forEach(upgrade => {
        upgrades += ',' + upgrade + ' ';
    });
    

    jobs.insert(req.body).then(a => {
        res.json(a);
    }); 

    // Sends message to Admin to notify them about the new booked appointment
    sms.messages.create({
        //to: adminNumber
        to: '+15403189312',
        from: '+12523682210',
        body: 'New Appointment Booked: ' + req.body.date + ' at ' + req.body.time + '. ' +
              'Location: ' + req.body.location.address + ', ' + req.body.location.city +
              ' ' + req.body.location.state + ', ' + req.body.location.zip + '. ' +
              'Services: ' + req.body.services.package + ' ' + upgrades + '.'
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
            res.json(a);
        }).catch(err => {
            console.log(err);
            res.send(err);
        });

});

// UPDATES APPOINTMENT SLOTS CONCURRENCY TO '0' WHEN ADMIN BLOCKS A DAY OF THE WEEK
app.patch('/apptSlots/:dayOfWeek', async (req, res) => {

    apptSlots.update({"dayOfWeek": req.params.dayOfWeek}, {$set : {"concurrency": '0'}}, { multi: true }).then(a => {
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
        res.json(a);
    }).catch(err => {
        console.log(err);
        res.send(err);
    });

})

app.patch('/jobs/:date/:hour', async (req, res) => {

    jobs.update({"date": req.params.date, "hour": req.params.hour}, {$set : {"confirmed": true}})
    .then(a => {
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
