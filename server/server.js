// imports
const express = require("express"); // load expres lib
const fs = require("fs"); // load file system lib (node.js)
const app = express(); // express app instance, the server
const PORT = 3000; // port number for server to listen on
const path = require("path");

const filePath = path.join(__dirname, "/plants.json"); // path to plants.json file

// middleware
app.use(express.json()); // makes express pares json data
app.use(express.static(path.join(__dirname, "../public"))); // serve static files from static folder

// POST
app.post("/plants", (req, res) => { // set up route for post requests to /plants endpoint
    const newPlant = req.body; // get data from request body
    savePlantEntry(newPlant); // call function to save data
    res.status(200).send("saved plant entry!"); // send back success message

});

// GET
app.get("/plants", async (req, res) => { // set up route for get requests to /plants endpoint
    console.log("GET /plants request received");
    try {
        const data = await loadEntries(); // read data from plants.json file, turning it into js array
        res.json(data); // send data back as json response
    } catch (err) {
        res.status(500).send("Error loading plant entries"); // send back error message
    }
    
});

// taken from hack club Express server example 
function loadEntries() {
    console.log("loading entries from plants.json");
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (parseErr) {
                    reject(parseErr);
                }
            }
        });
    });
}

function savePlantEntry(newPlant) {
    const existing = JSON.parse(fs.readFileSync(filePath, "utf8")); // read existing data in plants.json, turning it into js arra
    existing.push(newPlant); // add diary entry to array
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2)); // save back into the plants.json file
}

// start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});