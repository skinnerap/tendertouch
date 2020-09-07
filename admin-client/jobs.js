const route = 'http://localhost:5000/jobs';
const submitBtn = document.querySelector(".submitDate");
const div = document.querySelector('.jobs');

submitBtn.addEventListener('click', (e) => {

    e.preventDefault();

    if(div.innerHTML !== '') {
        div.innerHTML = '';
    }

    // Get Date Selected By Admin
    const form = document.querySelector('.dateForm');
    const data = new FormData(form);
    const unformattedDate = data.get('date');

    // Format Date ( Example: Fri Aug 07, 2020)
    const split = unformattedDate.split('-');
    const dateObj = new Date(split[0], parseInt(split[1]) - 1, split[2]).toString();
    const splitObj = dateObj.split(' ');
    const date = splitObj[0] + ' ' + splitObj[1] + ' ' + splitObj[2] + ', ' + splitObj[3];

    console.log(typeof date);
    
    // Get Booked Appointments From Date (/jobs route)
    try {

        fetch(route + '/' + date).then(res => res.json()).then(jobs => {

            jobs.forEach(job => {

                const html = createJobHtml(job);
                div.innerHTML += html;
                addUpgradeHtml(job);

            });
                

        });

    } catch {

        throw new Error('Unable to retrieve data from database');

    }

});

function createJobHtml(job) {

    let html = `
            <div class='jobContainer'>
                <h3 class='jobHeader'>${job.date} - ${job.time}</h3>
                <h4 class='jobSubheader'>Customer Details</h4>
                <ul class='jobUl'>
                    <li class='jobLi'>${job.customer.fName} ${job.customer.lName}</li>
                    <li class='jobLi'>${job.location.address}, ${job.location.city}, ${job.location.state}, ${job.location.zip}</li>
                    <li class='jobLi' id='customerEmail'><a href='mailto:${job.customer.email}'>${job.customer.email}</a></li>
                    <li class='jobLi' id='customerPhone'><a href='tel:${job.customer.phone}'>${job.customer.phone}</a></li>
                    <li class='jobLi'>${job.vehicle.model}</li>
                    <li class='jobLi'>${job.vehicle.year}</li>
                    <li class='jobLi'>Notes: ${job.notes}</li>
                </ul>
                <h4 class='jobSubheader'>Service Details</h4>
                <ul class='jobUl'>
                    <li class='jobLi'>${job.services.package}</li>
                </ul>
                <ul class='jobUlUpgrade'></ul>
            </div>
        `;

    return html;

}

function addUpgradeHtml(job) {

    const div = document.querySelector('.jobUlUpgrade');
    let html = '';

    job.services.upgrades.forEach(upgrade => {

        html += `<li class='jobLi'>${upgrade}</li>`;

    });

    div.innerHTML = html;

}