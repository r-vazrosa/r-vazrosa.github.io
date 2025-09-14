const sunnyTimes = document.getElementById('sunny-times');
const sunnyTimesMsg = document.getElementById('sunny-times-message');

const colorInput = document.getElementById('color-input');
const colorChange = document.getElementById('color-change');


const weatherImg = document.getElementById('weather-image')


sunnyTimesMsg.innerHTML = `
Here comes the sun
  Sun
    Sun
      Sun
Here it comes`

sunnyTimes.addEventListener('click', () => {
    sunnyTimesMsg.style.display = "block";
});


colorInput.addEventListener('input', () => {
    colorChange.style.color = colorInput.value;
    colorChange.innerHTML = colorInput.value;
});


weatherImg.addEventListener('click', () => {
    weatherImg.src = "images/sun.png"
})