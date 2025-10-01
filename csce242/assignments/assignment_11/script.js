const flexContainer = document.getElementById("flex-container");


class Painting {
    constructor(name, artist, image, framed) {
        this.name = name;
        this.artist = artist;
        this.image = image;
        this.framed = framed;
    }

    createHTML() {
        const paintingItem = document.createElement("div");
        paintingItem.className = "flex-item";

        paintingItem.innerHTML = `
            <div class="flex-item" onclick="document.getElementById('${this.name}').style.display='block'">
                <h2 class="painting-title">${this.name}</h2>
                <img src="./images/${this.image}.jpg">
            </div>


            <div id="${this.name}" class="w3-modal">
                <div class="w3-modal-content">
                    <div class="w3-container">
                        <span onclick="document.getElementById('${this.name}').style.display='none'" class="w3-button w3-display-topright">&times;</span>

                        <p class="modal-header">${this.name}</p>
                        <p class="modal-subheader">by ${this.artist}</p>
                        <p class="modal-subheader">Framed: ${(this.framed) ? "Yes":"No"}</p>
                        <img class="modal-img" src="./images/${this.image}.jpg">
                        
                    </div>
                </div>
            </div>
                
        `
        return paintingItem;
    }

}

const painting1 = new Painting("Amoung the Roses", "Frank Bramley", "painting_1", false);
const painting2 = new Painting("Autumn Trees, 1911", "Egon Schiele", "painting_2", false);
const painting3 = new Painting("Malcesine on Lake Garda, 1913", "Gustav Klimt", "painting_3", true);
const painting4 = new Painting("Schloss Kammer on Attersee", "Gustav Klimt", "painting_4", false);
const painting5 = new Painting("Harney Desert Landscape", "Childe Hassam", "painting_5", false);

const paintingArray = [painting1, painting2, painting3, painting4, painting5];




for(let i = 0; i <= paintingArray.length; i++) {
    
    const paintingItem = paintingArray[i].createHTML();

    document.getElementById("flex-container").appendChild(paintingItem);
}

