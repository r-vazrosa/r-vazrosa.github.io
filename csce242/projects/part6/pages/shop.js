const shopList = document.getElementById("shop");

window.addEventListener('DOMContentLoaded', () => {
    const getData = async() => {
        const url = "https://r-vazrosa.github.io/csce242/json/shop.json";

        try {
            const response = await fetch(url);

            const data = await response.json();

            data.forEach(item => {
                console.log(item.name);
                const shopItem = document.createElement('div');
                shopItem.className = ((item.id % 2 == 0) ? "shop-item-alternate" : "shop-item");
                const description = ((item.id % 2 == 0) ? "shop-item-description-alternate" : "shop-item-description")

                shopItem.innerHTML = 
                `
                    <div class=${description}>
                        <img src="../images/item-img-${item.id}.png">
                        <div>
                            <h2>${item.name} ( +${item.value} / ${item.type} )</h2>
                            <p>
                                ${item.description}
                            </p>
                        </div>
                    </div>
                    <div class="shop-item-purchase">
                        <img src="../images/shop-purchase.png">
                    </div>
                `;
                shopList.appendChild(shopItem);
            }) 

            
        } catch (e) {
            console.error("Error fetching data:", e);
        }

        }

    getData();

})

