/* script.js
- includes lots of notes for learning w/ json and fetch api
*/
document.getElementById("plant-form").addEventListener("submit", plantSubmit); // to submit your plant diary entry
var entries = document.getElementById("entries"); // to update the entries shown in the page

const tiles = document.getElementsByClassName("tile").addEventListener("click", openPlant);
const allPlants = []; // will hold all plant entries
// TODO: these are the tiles that also hold the plants; we need to link them together.
    // do so with loop:
// for (let tile of tiles) {
//     const tileID = tile.id;
//     // Find the plant(s) for this tile
//     const plantsForTile = allPlants.filter(plant => plant.tileID === tileID);
//     // Display plant info in the tile
//     plantsForTile.forEach(plant => {
//         tile.innerHTML += `<h3>${plant.title}</h3><p>${plant.entry}</p><small>${plant.date}</small>`;
//     });
// }



updateEntriesInPage(); // call function to load existing entries when page loads

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
    const allPlants = await response.json(); // get json data from response

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