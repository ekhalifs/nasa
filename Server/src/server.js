const https = require('https');
const fs = require('fs');
const app = require('./app')
require('dotenv').config();
const PORT = process.env.PORT
const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert:fs.readFileSync('cert.pem')
},app);

const {loadPlanets} = require('./Models/planets.model');
const {mongodbConnect} = require('./Services/mongo')
const {loadPlanetsData} = require('./Models/launches.model')


server.listen(PORT,async() =>{
  await mongodbConnect(); 
  await loadPlanets();
  await loadPlanetsData();
  console.log(`app is running on port ${PORT}`)
})


