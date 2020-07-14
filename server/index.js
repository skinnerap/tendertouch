/**** IMPORTS *****/
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


/**** GET ROUTES ****/
app.get('/', (req, res) => {
    res.json({
        message: 'Hi Bud'
    });
});


/**** POST ROUTES ****/
app.post('/packages', (req, res) => {
    console.log(req.body);
});

app.post('/addons', (req, res) => {
    console.log(req.body);
})

app.post('/settings', (req, res)  => {
    console.log(req.body);
})

app.post('/blockday', (req, res) => {
    console.log(req.body);
})

app.post('/blockdayind', (req, res) => {
    console.log(req.body);
})

/***** Used to Delete Available Appt Slots in DB *****/
// Posts a day to grab all available appointment time slots
// Which will then be used to select a specific appointment slot
// and remove it from the available appointment slots
app.post('/apptsonday', (req, res) => {
    console.log(req.body);
})

/***** Used to Restore Deleted Appt Slots in DB ****/
// Posts a day to grab all deleted appointment time slots
// Which will then be used to select a specific appointment slot
// and restore it to the available appointment slots
app.post('/deletedapptsonday', (req, res) => {
    console.log(req.body);
})

/**** LISTENING ON SERVER *****/
app.listen(5000, () => {
    console.log('Listening on http://localhost:5000');
});