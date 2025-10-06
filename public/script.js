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
        document.getElementById("plant-form").style.display = "block";
        console.log("entered plant mode");
    } else {
        featureMode = 0;
        document.getElementById("plant-form").style.display = "none";
        console.log("exited mode");
    }
}

/* PLANT SUBMISSION */

document.getElementById("plant-form").addEventListener("submit", plantSubmit); // to submit your plant diary entry

var entries = document.getElementById("entries"); // to update the entries shown in the page
var allPlants = []; // global array to hold all plant entries
var displayedPlants = [16]; // global array to hold currently displayed plant entries (for filtering, searching, etc)

updateEntriesInPage(); // call function to load existing entries when page loads

const tiles = document.getElementsByClassName("tile"); // static frontend array containing all elements that are tiles (16)

// TODO: these are the tiles that also hold the plants; we need to link them together.
for (let i = 0; i < tiles.length; i++) { // go through 16 tiles
    const tileID = tiles[i].id; // get tile id
    const correspondingPlant = allPlants.filter(plant => plant.tileID === tileID); // get plant corresponding to this tile; therefore you can link it to the frontend
    if (correspondingPlant.length > 0) { // if there is a plant for this tile
        // set up the tile with the plant info
        displayedPlants[i] = correspondingPlant[0]; // add to displayedPlants array
    }
    tiles[i].addEventListener("click", () => {
        openPlant(tileID);
    });
}

function openPlant(tileID) {
    const plant = displayedPlants[tileID]; // get plant corresponding to this tile
    if (!plant) {
        console.log("no plant for this tile");
        return;
    } else {
        console.log(`Title: ${plant.title}\nEntry: ${plant.entry}\nDate: ${plant.date}`);
    }
}

async function plantSubmit(e) {
    e.preventDefault(); // revent page from reloading

    // create data entry object
    const dataEntry = {
        // e.target is the form that was submitted
        tileID: e.target.title.value,
        title: e.target.title.value,
        erased: false,
        eraseCode: e.target.eraseCode.value,
        entry: e.target.entry.value,
        // taken straight from copilot lols, takes date and turns it into date str
        date: new Date().toISOString().split("T")[0]
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

async function updateEntriesInPage() {
    const response = await fetch("/plants"); // send request to /plant endpoint in server.js (express server)
    allPlants = await response.json(); // get json data from response

    entries.innerHTML = ""; // reset 

    // copilot carrying here; 
    allPlants.forEach(plant => { // loop through each plant entry
        const entryDiv = document.createElement("div"); // create a div for each entry
        entryDiv.classList.add("entry"); // add class for styling
        entryDiv.innerHTML = `<h3>${plant.title}</h3><p>${plant.entry}</p><small>${plant.date}</small>`; // add content to div
        //entries.innerHTML += entryDiv.outerHTML; // add div to entries container in page
        entries.appendChild(entryDiv); // add div to entries container in page
    });

    console.log("fetched entries:", allPlants);
     
}