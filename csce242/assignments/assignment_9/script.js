const drawBtn = document.getElementById('drawBtn');
const sky = document.getElementById('sky');
const body = document.getElementsByName

const drawScene = () => {
  sky.innerHTML = '';

  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;

 
  sky.style.background = isNight ? '#000' : '#87CEEB';
  document.body.style.backgroundColor = isNight ? '#000000' : '#87CEEB';

  const sunOrMoon = document.createElement('div');
  sunOrMoon.className = isNight ? 'moon' : 'sun';
  sky.appendChild(sunOrMoon);

  for (let i = 0; i < 6; i++) {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    cloud.style.left = (10 + i * 12) + "%";
    sky.appendChild(cloud);
  }

  for (let i = 0; i < 6; i++) {
    const tree = document.createElement('div');
    tree.className = 'tree';
    tree.style.left = (10 + i * 13) + "%";
    sky.appendChild(tree);
  }
};

drawBtn.addEventListener('click', drawScene);