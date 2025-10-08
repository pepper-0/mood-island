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
var weedingForm = document.getElementById("weeding");
var wateringForm = document.getElementById("watering");

toolkitButton.addEventListener("click", toggleToolkit);
function toggleToolkit() {
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
        weedingForm.style.display = "none";
        wateringForm.style.display = "none";
        console.log("entered plant mode");
    } else if (this.id === "toolkit-shovel") {
        featureMode = 0;
        plantForm.style.display = "none";
        weedingForm.style.display = "block";
        wateringForm.style.display = "none";
        console.log("entered delete mode");
    } else if (this.id === "toolkit-water") {
        featureMode = 0;
        plantForm.style.display = "none";
        weedingForm.style.display = "none";
        wateringForm.style.display = "block";
        console.log("entered edit mode");
    }
}

/* ISLAND */
var nSlots = 4; // slots for 2D array
// tileArray: the container array (gh copilot)
let tileArray = Array.from({ length: nSlots }, (_, row) => // tileArray is a 2d global array; holds all tiles (NOT just plants, some may be EMPTY)
    Array.from({ length: nSlots }, (_, col) => ({
        plant: null // it will hold a plant object
    }))
);

/* PLANT SUBMISSION */
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

// get the plant that corresponds to the tile (console log)
function openPlant(tileID) {
    const plant = displayedPlants[tileID]; // get plant corresponding to this tile
    if (!plant) {
        console.log("no plant for this tile");
        return;
    } else {
        console.log(`Title: ${plant.title}\nEntry: ${plant.entry}\nDate: ${plant.date}`);
    }
}

// handle submitting the plant form
async function plantSubmit(e) {
    e.preventDefault(); // revent page from reloading

    // safety mechanisms
    var tileID;
    try {
        tileID = parseInt(e.target.tileId.value);
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

    await updateEntriesInPage();
}

// function to fetch all entries from server and update the page (including the island)
async function updateEntriesInPage() {

    const response = await fetch("/plants"); // send request to /plant endpoint in server.js (express server)
    allPlants = await response.json(); // get json data from response

    entries.innerHTML = ""; // reset 

    // entry display (at the bottom of the page)
    allPlants.forEach(plant => { // loop through each plant entry
        const entryDiv = document.createElement("div"); // create a div for each entry
        entryDiv.classList.add("entry"); // add class for styling
        entryDiv.innerHTML = `<h3>${plant.title}</h3><p>${plant.entry}</p><small>${plant.date}</small>`; // add content to div
        //entries.innerHTML += entryDiv.outerHTML; // add div to entries container in page
        entries.appendChild(entryDiv); // add div to entries container in page
    });

    // island display (the tiles)
    // for now, all the items to be refreshed; later maybe adjust to tile-by-tile refresh instead 
    for (item of tileArray) {
        if (item.plant) {
            // display; the styling will be done here and add event listener

            // // TODO: make the tiles actually display properly on the island yes 
            // // goal: these are NOT just the plants, they are tiles that potentially hold the plants
            // // if statement to check if theres a plant for that space? or do a for loop that runs through the plants instead of items... okay this is so weird.
            // const tileObj = tileArray[row][col];
            // const tileDiv = document.createElement("div");
            // tileDiv.className = "tile";
            // tileDiv.dataset.row = row;
            // tileDiv.dataset.col = col;
            // tileDiv.innerHTML = ""; // or default content
            // tileDiv.addEventListener("click", () => {
            //     // Access tileObj.plant here
            //     if (tileObj.plant) {
            //         allPlants.forEach(plant => {
            //         const { row, col } = plant; // assuming plant has row and col properties
            //         tileArray[row][col].plant = plant;
            //     });
            //     }
            // });
            // island.appendChild(tileDiv);

            item.addEventListener("click", () => {
                openPlant(item.plant);
            });
        } else {
            // empty tile; display empty tile
            item.innerHTML = ""; // clear tile

        }
    }

    console.log("fetched entries:", allPlants);
     
}