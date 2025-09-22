const exercise1Toggle = document.getElementById('exercise-1-toggle');
const exercise1Section = document.getElementById('exercise-1-section');
const waterSlider = document.getElementById('water-days-input');
const plantState = document.getElementById('plant-state');

const exercise2Toggle = document.getElementById('exercise-2-toggle');
const exercise2Section = document.getElementById('exercise-2-section');
const digitalClock = document.getElementById('digital-clock');

exercise1Toggle.onclick = () => {
    exercise2Section.classList.add('hidden')
    exercise1Section.classList.remove('hidden')
    
};

exercise2Toggle.onclick = () => {
    exercise1Section.classList.add('hidden')
    exercise2Section.classList.remove('hidden')
    
};

// Exercise 1 Section --------------------


waterSlider.addEventListener('change', (e) => {
    const newValue = e.target.value;

    if (newValue >= 1 && newValue <= 2) {
        plantState.src = 'images/plant-state-1.png';
    } else if (newValue >= 3 && newValue <= 5) {
        plantState.src = 'images/plant-state-2.png';
    } else if (newValue >= 6 && newValue <= 9) {
        plantState.src = 'images/plant-state-3.png';
    } else if (newValue >= 10 && newValue <= 12) {
        plantState.src = 'images/plant-state-4.png';
    } else {
        console.log('Something went wrong, out of bounds.');
    }
})







// Exercise 2 Section ----------------------

function updateTime() {
    const currentDate = new Date();
    const hour = currentDate.getHours();
    const minute = currentDate.getMinutes();
    const message = (hour % 12)  + ':' + minute + ' ' + (hour >= 12 ? 'PM' : 'AM');

    digitalClock.innerHTML = message;
}

// initial call and interval
updateTime()
setInterval(updateTime, 60000)