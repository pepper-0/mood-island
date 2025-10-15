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
var wateringBlock = document.getElementById("watering");
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
        weedingBlock.style.display = "none";
        wateringBlock.style.display = "none";
        featureMode = 0; // reset feature mode when closing toolkit, safety feature
        document.body.style.cursor = "default";
    }
}

var featureMode = 0; // 0 = clear, 1 = plant, 2 = shovel, 3 = water
const toolkitOptions = document.getElementsByClassName("toolkit-option");

for (let option of toolkitOptions) { // eventlisteners for toolkit features
    option.addEventListener("click", openFeature);
}

function openFeature() { // open up a toolbox feature 
    if (this.id === "toolkit-plant") {
        featureMode = 1;
        plantForm.style.display = "block";
        weedingBlock.style.display = "none";
        wateringBlock.style.display = "none";
        document.body.style.cursor = "";
        console.log("entered plant mode");
        resetWaterForm(0);
        resetWeedForm(0);
    } else if (this.id === "toolkit-shovel") {
        featureMode = 2;
        plantForm.style.display = "none";
        weedingBlock.style.display = "block";
        wateringBlock.style.display = "none";
        console.log("entered weed mode");
        handleWeed(0);
        resetWaterForm(0);
    } else if (this.id === "toolkit-water") {
        featureMode = 3;
        plantForm.style.display = "none";
        weedingBlock.style.display = "none";
        wateringBlock.style.display = "block";
        console.log("entered edit mode");
        handleWater(0);
        resetWeedForm(0);
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
var plantForm = document.getElementById("plant-form"); // the form itself
plantForm.addEventListener("submit", plantSubmit); // to submit your plant diary entry
var plantConfirmation = document.getElementById("plant-confirmation"); // confirmation message
var entries = document.getElementById("entries"); // to update the entries shown in the page
var allPlants = []; // holds all plalnt entries
var tilePlants = []; // holds all plants on island
updateEntriesInPage(); // function to load existing entries when page loads; adds all entries into allPlants

const islandPlatform = document.getElementById("island-platform"); // island itself
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

/* HANDLE WATERING/PLANTING */
function openPlant(tileID) { // get the plant that corresponds to the tile (console log)
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

async function plantSubmit(e) { // handle submitting the plant form
    e.preventDefault(); // prevent page from reloading
    plantConfirmation.innerHTML = "";

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

    plantForm.reset();

    plantConfirmation.innerHTML = "planting successful!";
}

/* PLANT-SPECIFIC SETUP */
var selectedPlant;

function selectTile() { // gh copilot; idk how to use promise
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


/* HANDLE WEEDING/DELETING */
var cancelErase = document.getElementById("cancel-erase");
cancelErase.addEventListener("click", resetWeedForm);
var eraseConfirmation = document.getElementById("erase-confirmation");
var weedingForm = document.getElementById("weeding-form");
var confirmErase = document.getElementById("confirm-erase");
// stay in this function until you switch out and no longer want to remove a tile
async function handleWeed() {
    var removeID = await selectTile(); // choose which tile to erase
    cancelErase.style.display = "block";
    try {
        selectedPlant = allPlants.find(p => p.tileID === removeID && !p.erased);
    } catch {
        console.log("umm catching an error lols");
    }
    weedingForm.style.display = "block";
    // rest of plant handling proceeds in weedSubmit (when you submit hte erase code)
    
    var enteredEraseCode = await weedSubmit();

    // verify if erase code of plantRemove === entered erase code; if so, remove. try to do it with update entries in page (urgh)
    if (selectedPlant.eraseCode === enteredEraseCode) {
        await fetch(`/plants/${selectedPlant.tileID}`, { // send request to /plant endpoint in server.js (express server)
            method: "DELETE" // this is a delete request
        });
        updateEntriesInPage();
        resetWeedForm(1);
    } else {
        resetWeedForm(2);
    }
}

function resetWeedForm(code) { // 0 = neutral, 1 = success, 2 = failure
    // refresh so that form is cleared and not appearing
    weedingForm.style.display = "none";
    weedingForm.reset();
    cancelErase.style.display = "none";

    // show results for previous actions
    if (code === null || 0) {
        eraseConfirmation.innerHTML = "";
    } else if (code === 1) {
        eraseConfirmation.innerHTML = "entry has been erased! click on another plant to weed.";
    } else if (code === 2) {
        eraseConfirmation.innerHTML = "your erase code is incorrect. please try again.";
    }
    
    setTimeout(() => {
        handleWeed();
    }, 1000); // pause ui before calling handleweed
}

// handle when submission occurs for weed
function weedSubmit(e) {
    return new Promise(resolve =>  {
        function onSubmit(e) {
            e.preventDefault();
            weedingForm.removeEventListener("submit", onSubmit);
            var enteredEraseCode;
            try { // parse getting the submission erase code from weedSubmit
                enteredEraseCode = e.target.enteredEraseCode.value;
            } catch {
                enteredEraseCode = "";
            }

            resolve(enteredEraseCode);
        }
        weedingForm.addEventListener("submit", onSubmit); // submit the erase code
    });
}

/* HANDLE UPDATING */
var cancelWater = document.getElementById("cancel-water");
var wateringForm = document.getElementById("watering-form");
cancelWater.addEventListener("click", resetWaterForm);
var waterConfirmation = document.getElementById("water-confirmation");

var wateringUpdateForm = document.getElementById("watering-update-form");
wateringUpdateForm.addEventListener("submit", updatePlant);
var updateTitle = document.getElementById("update-title");
var updateEraseCode = document.getElementById("update-erase-code");
var updateEntry = document.getElementById("update-entry");

async function handleWater() {
    console.log("handle water called");
    var selectedID = await selectTile(); // choose which tile to erase
    console.log("got tile, it is", selectedID);

    // show necessary blocks
    cancelWater.style.display = "block";
    wateringForm.style.display = "block";

    console.log("showed things");

    try {
        selectedPlant = allPlants.find(p => p.tileID === selectedID && !p.erased);
    } catch {
        console.log("umm catching an error lols");
    }
    
    var enteredPassCode = await waterSubmit();

    // verify if erase code of plantRemove === entered erase code; if so, remove. try to do it with update entries in page (urgh)
    if (selectedPlant.eraseCode === enteredPassCode) {
        var response = await fetch(`/plants/${selectedPlant.tileID}`, { // send request to /plant endpoint in server.js (express server)
            method: "GET"// this is a delete request
        });
        var plant = await response.json(); // plant data
        try { // handle obtaining the update now
            wateringUpdateForm.style.display = "block";
            console.log("obtained the following plnat, this msg indicates we have entered the function that will permit users to modify: ", plant);
            updateTitle.value = plant.title;
            updateEraseCode.value = plant.eraseCode;
            updateEntry.value = plant.entry;

            wateringForm.style.display = "none";

//            await updatePlant(); // get the signal that it's ready (def not right but we'll let it slide for now)
        } catch {
            resetWaterForm(3);
        }  
    } else {
        resetWaterForm(1); // passcode incorrect lols
    }
}

async function updatePlant(e) {
    e.preventDefault();
    
    const dataEntry = {
        title: e.target.updatedTitle.value,
        eraseCode: e.target.updatedEraseCode.value,
        entry: e.target.updatedEntry.value
    }

    await fetch(`/plants/${selectedPlant.tileID}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataEntry)
    });

    updateEntriesInPage();

    resetWaterForm(2);
}

function waterSubmit(e) { // submission for correct passcode 
    return new Promise(resolve =>  {
        function onSubmit(e) {
            e.preventDefault();
            wateringForm.removeEventListener("submit", onSubmit);
            var enteredPassCode;
            try { // parse getting the submission erase code from waterSubmit
                enteredPassCode = e.target.enteredPassCode.value;
            } catch {
                enteredPassCode = "";
            }

            resolve(enteredPassCode);
        }
        wateringForm.addEventListener("submit", onSubmit); // submit the erase code
    });
}

function resetWaterForm(code) { // 0 = neutral, 1 = erase code failure, 2 = success
    wateringForm.style.display = "none";
    wateringUpdateForm.style.display = "none";
    wateringForm.reset();
    wateringUpdateForm.reset();
    cancelWater.style.display = "none";

    if (code === null || 0) {
        waterConfirmation.innerHTML = "";
    } else if (code === 1) {
        waterConfirmation.innerHTML = "your passcode was incorrect! please try again.";
    } else if (code === 2) {
        waterConfirmation.innerHTML = "watering successful!";
    } else if (code === 3) {
        waterConfirmation.innerHTML = "unexpected error occurred D: sorry, im on a time crunch and probably didnt have time to fix this. oops";
    }

    setTimeout(() => {
        handleWater();
    }, 1000); // pause ui before calling handlewater again
}

/* TOOLKIT HELPER FUNCTIONS */

// function to fetch all entries from server and update the page (including the island)
async function updateEntriesInPage() {

    const response = await fetch("/plants"); // send request to /plant endpoint in server.js (express server)
    allPlants = await response.json(); // get json data from response

    entries.innerHTML = ""; // reset 
    tilePlants = []; // reset tilePlants array

    // entry display (at the bottom of the page)
    // allPlants.forEach(plant => { // loop through each plant entry
    //     const entryDiv = document.createElement("div"); // create a div for each entry
    //     entryDiv.classList.add("entry"); // add class for styling
    //     entryDiv.innerHTML = `<h3>${plant.title}</h3><p>${plant.entry}</p><small>${plant.date}</small>`; // add content to div
    //     //entries.innerHTML += entryDiv.outerHTML; // add div to entries container in page
    //     entries.appendChild(entryDiv); // add div to entries container in page
    // });

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