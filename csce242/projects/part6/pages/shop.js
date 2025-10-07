const shopList = document.getElementById('shop');

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(item => console.log(item.name));
  })
  .catch(err => console.error('Error loading JSON:', err));
