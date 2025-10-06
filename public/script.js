/* script.js
- includes lots of notes for learning w/ json and fetch api
*/
document.getElementById("plant-form").addEventListener("submit", plantSubmit); // to submit your plant diary entry
document.getElementsByClassName("sidebar-button");
for (let btn of document.getElementsByClassName("sidebar-button")) {
    btn.addEventListener("click", toggleSidebar);
}
var entries = document.getElementById("entries"); // to update the entries shown in the page
var allPlants = []; // global array to hold all plant entries
var displayedPlants = [16]; // global array to hold currently displayed plant entries (for filtering, searching, etc)

updateEntriesInPage(); // call function to load existing entries when page loads

const tiles = document.getElementsByClassName("tile"); // static frontend array containing all elements that are tiles (16)

function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    var main = document.getElementById("main");
    if (sidebar.style.width === "50%") {
        sidebar.style.width = "0";
        main.style.marginLeft = "0";
    } else {
        sidebar.style.width = "50%";
        main.style.marginLeft = "50%";
    }
}

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