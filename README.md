# mood-island
plant-themed mood diary recorded on an island, your own mental space

### currently this readme is just a writeup of what i want the code to be 

general description/run through:
you first create an island name and island code which serves as a 'login' for your island. this opens you up to a blank island with nxn, let's set n as 4 for now, spaces. those spaces are either occupied with a plant (which can be "wilted" and require being watered), a weed, or nothing.

your options are to:
- water (update): click a "watering" button and then click on every plant space that's wilted. this gives you coins, which can later be redeemed. watering also igves you the option to add information to your plant
- weed (delete): click the "weed" button and click any space to remove the plant there. this can include weeds (which will give you coins), or plants you don’t want in your island anymore
- plant (create): date, mood, title, and diary entry . 
- view plants (read): click on any plant/space to do so, and see your previous entry

requirements:
- the project must fulfill the requirements of the express project guidelines (read here): https://express.athena.hackclub.com/info

extra (cool) features:
- there will be n^2 spaces on your "island" to add plants or elements to. this includes 
- there is a "plant library" that essentially unlocks different kinds of plants based on different things you've done in your island. for example, deleting a plant/memory, adding at least 5 plants to your island, etc. 
- the project has a general "sentiment analysis" that implements AI to do so and can analyze your mood based on a time frame, individual plant, or overall island
