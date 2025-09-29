const dogFlex = document.getElementById("dog-flex");
const dogNames = ["Doodle", "Torkie", "Joggie", "Barkson"];
 
for(let i = 0; i < 4; i++) {
    const dogItem = document.createElement("div");
    dogItem.className = "dog-item";

    dogItem.innerHTML = `
        <div id="dog-base-item">
            <img src="images/${dogNames[i]}.jpg">
                <div class="dog-hover hidden"> 
                    <span>Please Groom ${dogNames[i]}</span>
                </div>
            </div>
            <div class="dog-popup hidden">
                <span class="close">&#10006;</span>
                <p>${dogNames[i]} After Grooming</p>
                <img src="images/${dogNames[i]}_hover.jpg">
            </div>
    `

    const dogHover = dogItem.querySelector(".dog-hover");
    const dogPopup = dogItem.querySelector(".dog-popup");
    const closePopup = dogItem.querySelector(".close");

    dogItem.addEventListener("mouseenter", () => {
        dogHover.classList.remove("hidden");
    })

    dogItem.addEventListener("mouseleave", () => {
        dogHover.classList.add("hidden");
    })

    dogItem.addEventListener("click", () => {
        dogPopup.classList.remove("hidden");
    })
    closePopup.addEventListener("click", (e) => {
        e.stopPropagation();
        dogPopup.classList.add("hidden");
    })





    document.getElementById("dog-flex").appendChild(dogItem);
}