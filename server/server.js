
const express = require("express"); // load expres lib
const fs = require("fs"); // load file system lib (node.js)

const app = express(); // express app instance, the server

app.use(express.json()); // makes express pares json data

// POST
app.post("/plant", (req, res) => { // set up route for post requests to /plant endpoint
    const newPlant = req.body; // get data from request body
    savePlantEntry(newPlant); // call function to save data
    res.status(200).send("saved plant entry!"); // send back success message

});

// GET
app.get("/plants", (req, res) => { // set up route for get requests to /plants endpoint
    const data = JSON.parse(fs.readFileSync("plants.json", "utf8")); // read data from plants.json file, turning it into js array
    res.json(data); // send data back as json response
});

function savePlantEntry(newPlant) {
    const existing = JSON.parse(fs.readFileSync("plants.json", "utf8")); // read existing data in plants.json, turning it into js arra
    existing.push(newPlant); // add diary entry to array
    fs.writeFileSync("plants.json", JSON.stringify(existing, null, 2)); // save back into the plants.json file
}