/* script.js
- includes lots of notes for learning w/ json and fetch api
*/

/* STATIC FEATURES */
    // Sidebar
var sidebarBtns = document.getElementsByClassName("sidebar-button");
for (let btn of sidebarBtns) {
    btn.addEventListener("click", toggleSidebar);
}
function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    var sidebarContent = document.getElementById("sidebar-content");
    var main = document.getElementById("main");
    if (this.id === "sidebar-info") {
        sidebar.style.width = "50%";
        sidebarContent.innerHTML = "what's mood island?<br/>mood island's a digital diary, framed around a mini-internet island filled with plants!<br/> click on a tile with a flower to view the diary entry. click on the toolkit to open up edit view, where you can add new entries or remove entries (if they are yours; you will need the erase code you set when you created the entry).";
        console.log("info button clicked");
    } else if (this.id === "sidebar-documentation") {
        sidebar.style.width = "50%";        
        sidebarContent.innerHTML = "documentation:<br/>this project was built with html, css, and js, using node.js and express. it fulfills the criteria of the athena award's express project, and can be found on github";
        console.log("documentation button clicked");
    } else if (this.id === "sidebar-close") {
        sidebar.style.width = "0%";
        sidebarContent.innerHTML = ""; // clear sidebar content when toggled
    }
}

    // Toolkit
var toolkitButton = document.getElementById("toolkit-button");
var plantForm = document.getElementById("plant-form");
var weedingBlock = document.getElementById("weeding");
var wateringForm = document.getElementById("watering");

toolkitButton.addEventListener("click", toggleToolkit);
function toggleToolkit() { // handle opening/closing toolkit 
    console.log("toolkit button clicked");
    var toolkitContent = document.getElementById("toolkit-content");

    if (window.getComputedStyle(toolkitContent).display == "none") {
        console.log("opening toolkit");
        toolkitButton.style.transform = "rotate(90deg)"; // rotate button when clicked
        toolkitContent.style.display = "flex";

    } else if (window.getComputedStyle(toolkitContent).display == "flex") {
        console.log("closing toolkit");
        toolkitButton.style.transform = "rotate(0deg)"; // un-rotate button when clicked
        toolkitContent.style.display = "none";
        plantForm.style.display = "none"; // hide all forms when closing toolkit
        weedingForm.style.display = "none";
        wateringForm.style.display = "none";
        featureMode = 0; // reset feature mode when closing toolkit, safety feature
        document.body.style.cursor = "default";
    }
}
var featureMode = 0; // 0 = clear, 1 = plant, 2 = shovel, 3 = water
const toolkitOptions = document.getElementsByClassName("toolkit-option");

for (let option of toolkitOptions) {
    option.addEventListener("click", openFeature);
}

function openFeature() {
    if (this.id === "toolkit-plant") {
        featureMode = 1;
        plantForm.style.display = "block";
        weedingBlock.style.display = "none";
        wateringForm.style.display = "none";
        document.body.style.cursor = "";
        console.log("entered plant mode");
    } else if (this.id === "toolkit-shovel") {
        featureMode = 2;
        plantForm.style.display = "none";
        weedingBlock.style.display = "block";
        wateringForm.style.display = "none";
        console.log("entered weed mode");
        handleWeed();
    } else if (this.id === "toolkit-water") {
        featureMode = 3;
        plantForm.style.display = "none";
        weedingBlock.style.display = "none";
        wateringForm.style.display = "block";
        console.log("entered edit mode");
    }
}

/* ISLAND */
var nSlots = 5; // slots for 2D array
var island = document.getElementById("island"); // the island div
// tileArray: the container array (gh copilot)
let tileArray = Array.from({ length: nSlots }, (_, row) => // tileArray is a 2d global array; holds all tiles (NOT just plants, some may be EMPTY)
    Array.from({ length: nSlots }, (_, col) => ({
        plant: null // it will hold a plant object
    }))
);

/* INFORMATION BOX */
var infoContent = document.getElementById("info-content");

/* PLANT SUBMISSION SETUP */
document.getElementById("plant-form").addEventListener("submit", plantSubmit); // to submit your plant diary entry

var entries = document.getElementById("entries"); // to update the entries shown in the page
// allPlants: hold all plant entries
var allPlants = []; 
// tilePlants: hold plants that are on the island
var tilePlants = []; 
updateEntriesInPage(); // function to load existing entries when page loads; adds all entries into allPlants

const islandPlatform = document.getElementById("island-platform");
island.innerHTML = ""; // Clear any existing tiles

// place allPlant entries and place them in the tileArray and tilePlants if applicable
for (plant of allPlants) { 
    var space = plant.tileID; // get tileID of plant
    if (space < 0 || space >= nSlots * nSlots) { // check if space is valid; otherwise add it into the tileArray and the tilePlants
        continue; // skip invalid tileIDs
    }
    var row = Math.floor(space / nSlots); // calculate row
    var col = space % nSlots; // calculate col
    tileArray[row][col].plant = plant; // place plant in tileArray
    tilePlants.push(plant); // add plant to tilePlants array
}

/* PLANT SUBMISSION FUNCTIONS */

// get the plant that corresponds to the tile (console log)
function openPlant(tileID) {
    console.log("tileID:", tileID);
    const plant = tilePlants.find(p => p.tileID === tileID && !p.erased); // get plant corresponding to this tile
    if (plant == null) {
        console.log("no plant for this tile");
        return;
    } else {
        console.log(`Title: ${plant.title}\nEntry: ${plant.entry}\nDate: ${plant.date}`);
        infoContent.innerHTML = `<h3>${plant.title}</h3><p>${plant.entry}</p><small>${plant.date}</small>`;
    }
}

// handle submitting the plant form
async function plantSubmit(e) {
    e.preventDefault(); // prevent page from reloading

    /* START CODE HERE: functionality for clicking a tile to add to */
    // plantForm has a new div that asks where you'd like to select tile to: maybe make some visual styling that indicates this also
    const item = document.createElement("div");
    const txt = document.createElement("p");
    txt.innerHTML = "Click on an empty tile slot to plant your entry there!";
    item.appendChild(txt);
    // consider that this may have to be removed later
    plantForm.appendChild(item);
    // cool functionality to consider later: hovered slot that shows if the thing is occupied or not. i don't wanna have to do that rn tho lol

    // you click on a plant. this should also have verifying code that ensures we are in the right feature mode    
    try {
        var tileID = await selectTile(); // okay i dunno what im doing physics is way too loud for this bro </3
    } catch (error) {
        tileID = -1; // will not be placed on island
    }

    // create data entry object
    const dataEntry = {
        // e.target is the form that was submitted
        tileID: tileID,
        title: e.target.title.value,
        erased: false,
        eraseCode: e.target.eraseCode.value,
        entry: e.target.entry.value,
        // taken straight from copilot lols, takes date and turns it into date str
        date: new Date().toISOString().split("T")[0],
        image: "assets/flowers/succulent.png" // placeholder image for now, will add user choosing functionality later
    }

    await fetch("/plants", { // send request to /plant endpoint in server.js (express server)
        method: "POST", // this is a post request
        headers: {
            "Content-Type": "application/json" // sending json data
        },
        body: JSON.stringify(dataEntry) // convert dataEntry to JSON str
    });

    txt.innerHTML = "";

    await updateEntriesInPage();
}

/* HANDLE WEEDING */

var weedingForm = document.getElementById("weeding-form");
var confirmErase = document.getElementById("confirm-erase");
weedingForm.addEventListener("submit", weedSubmit); // submit the erase code
var selectedPlant;
// stay in this function until you switch out and no longer want to remove a tile
// note: add safety feature that allows you to cancel the process whenever you'd like
async function handleWeed() {
    while (featureMode === 2) {
        console.log("yep entered weed mode");
        var removeID = await selectTile(); // choose which tile to erase
        console.log("selected tile %i", removeID);
        try {
            selectedPlant = allPlants.find(p => p.tileID === removeID && !p.erased);
            console.log("whoa it worked!! somehow.");
        } catch {
            console.log("umm catching an error lols");
        }
        
        weedingForm.style.display = "block";
        console.log("shouldve shown the weed form by now");

        // rest of plant handling proceeds in weedSubmit (when you submit hte erase code)
    }
}

/* TOOLKIT HELPER FUNCTIONS */

// gh copilot; idk how to use promise
function selectTile() {
    return new Promise(resolve => {
        function onTileClick(e) {
            const tileID = parseInt(e.currentTarget.id);
            // Remove this temporary listener from all tiles
            for (let tile of document.getElementsByClassName("tile")) {
                tile.removeEventListener("click", onTileClick);
                // Optionally, restore the original handler here if needed
            }
            resolve(tileID);
        }
        // Add temporary listeners to all tiles
        for (let tile of document.getElementsByClassName("tile")) {
            tile.addEventListener("click", onTileClick);
        }
    });
}

// handle when submission occurs for weed
async function weedSubmit(e) {
    e.preventDefault();

    var enteredEraseCode;
    try { // parse getting the submission erase code from weedSubmit
        enteredEraseCode = e.target.eraseCode.value;
    } catch {
        enteredEraseCode = "";
    }
    console.log("so we shouldve obtained the erase code ??");
    // verify if erase code of plantRemove === entered erase code; if so, remove. try to do it with update entries in page (urgh)
    console.log("selectedPlant.eraseCode: ", selectedPlant.eraseCode);
    console.log("enteredEraseCode: ", enteredEraseCode);
    if (selectedPlant.eraseCode === enteredEraseCode) {
        console.log("by some miracle, this worked! and i am trying to delete plant id",selectedPlant.tileID);

        await fetch(`/plants/${selectedPlant.tileID}`, { // send request to /plant endpoint in server.js (express server)
            method: "DELETE" // this is a delete request
            // headers: {
            //     "Content-Type": "application/json" // sending json data
            // },
            // body: JSON.stringify(dataEntry) // convert dataEntry to JSON str
        });
    }

    updateEntriesInPage();
}

/* PAGE LOADING*/

// function to fetch all entries from server and update the page (including the island)
// also the fact that this doesn't lag out like cRAZY is an absolute miracle lol.
async function updateEntriesInPage() {

    const response = await fetch("/plants"); // send request to /plant endpoint in server.js (express server)
    allPlants = await response.json(); // get json data from response

    entries.innerHTML = ""; // reset 
    tilePlants = []; // reset tilePlants array

    // entry display (at the bottom of the page)
    allPlants.forEach(plant => { // loop through each plant entry
        const entryDiv = document.createElement("div"); // create a div for each entry
        entryDiv.classList.add("entry"); // add class for styling
        entryDiv.innerHTML = `<h3>${plant.title}</h3><p>${plant.entry}</p><small>${plant.date}</small>`; // add content to div
        //entries.innerHTML += entryDiv.outerHTML; // add div to entries container in page
        entries.appendChild(entryDiv); // add div to entries container in page
    });

    // island display (the tiles). for now, all the items to be refreshed; later maybe adjust to tile-by-tile refresh instead 
    // clear island display
    island.innerHTML = ""; 
    // these represent each item in tileArray
    for (let i = 1; i <= nSlots * nSlots; i++) { // provides #, matches tileID
        // find the corresponding plant for this tile
        const plant = allPlants.find(p => p.tileID === i && !p.erased);
        if (plant) {
            // display; the styling will be done here and add event listener

            const row = Math.floor((i - 1) / nSlots);
            const col = (i - 1) % nSlots;
            tileArray[row][col].plant = plant; // update tileArray with the plant
            
            const item = document.createElement("div");
            const plantIcon = document.createElement("img");
            plantIcon.src = plant.image;
            plantIcon.className = "plantIcon";
            item.appendChild(plantIcon);
            item.className = "tile";
            item.id = i;
            item.plant = plant; // attach plant data to the div for easy access

            island.appendChild(item);

            item.addEventListener("click", () => {
                if (featureMode === 0) // safety mechanism that ensures that ONLY when you are in a select mode, can you view (0 = default)
                    openPlant(item.plant.tileID);
            });

            // also add to tilePlants
            // NOTE: may have some overlap with erase updates, keep and eye on this
            tilePlants.push(plant);

        } else {
            // empty tile; display empty tile
            const item = document.createElement("div");
            item.className = "tile";
            item.id = i;
            island.appendChild(item);

        }
    }
    console.log("tilePlants:", tilePlants);
    console.log("fetched entries:", allPlants);
     
}