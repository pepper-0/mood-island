// imports
const express = require("express"); // load expres lib
const fs = require("fs"); // load file system lib (node.js)
const fsp = require("fs").promises; // load promise vers
const app = express(); // express app instance, the server
const PORT = 3000; // port number for server to listen on
const path = require("path");

const filePath = path.join(__dirname, "/plants.json"); // path to plants.json file

// middleware
app.use(express.json()); // makes express pares json data
app.use(express.static(path.join(__dirname, "../public"))); // serve static files from static folder

// REQ LOGGER
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

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

// DELETE
// app.delete("/plants", (req, res) => {
//     console.log("debug works");
//     res.status(200).send("completed");
// });
app.delete("/plants/:tileID", async (req, res) => { // taken frm geeksforgeeks cause this is so confusing </3. set up route for delete reqs to /plants endpt
    console.log("gang did i even enter ehre lol");
    try { // i am so not built for backend what am i doing ??
        const data = await loadEntries(); // obtain data first
        console.log("1 loaded entries");
        const deleteID = parseInt(req.params.tileID); // find tile id of the thing u wanna delete
        console.log("2 loaded and looking for tileID:", deleteID);
        
        const plantIndex = data.findIndex(p => p.tileID === deleteID && !p.erased); // finding the item based on tileID 
        console.log("3 obtained plantIndex, which is at", plantIndex);
        if (plantIndex === -1) return res.status(404).send('Item not found'); // not  sure if correct for here; look at it again later
        data.splice(plantIndex, 1); // remove item from array
        console.log("4 spliced");
        // now turn the array into a JSON again and write into the JSON file.
        await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
        res.status(200).send("plant successfully deleted");
    } catch (err) {
        // poopy poopy
        console.error("delete error yippee (not:", err);
        res.status(500).send("deletion server error yippee i guess");
    }
    
});

// taken from hack club Express server example. parses JSON str into array
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