const shopList = document.getElementById("shop");

const getData = async() => {
    const url = "https://r-vazrosa.github.io/csce242/json/shop.json";

    try {
        const response = await fetch(url);

        const data = await response.json();

        data.forEach(item => console.log(item.name));

        const shopItem = document.createElement('div');
        shopItem.innerHTML = 
        `
            <div class="shop-item-description">
                <img src="../images/120.ico">
                <div>
                    <h2>${item.name} ( +${item.value} / ${item.type} )</h2>
                    <p>
                        ${item.description}
                    </p>
                </div>
            </div>
            <div class="shop-item-purchase">
                <img src="../images/865.ico">
            </div>
        `;
    } catch (e) {
        console.error("Error fetching data:", error);
    }

}
