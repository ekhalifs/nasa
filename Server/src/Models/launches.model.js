const axios = require('axios');

const launchesDB = require('./launches.mongo');
const planets = require('./planets.mongo');

// let latestFlightNumber  = 100;
// const launch ={
//   flightNumber: 100,//flight_number
//   mission: 'Kepler Exploration X',//name
//   rocket: 'Kepler IS1',//mission.name
//   launchDate: new Date('27 November 2028'),//date_local
//   target: 'Kepler-442 b',//not applicable
//   customers: ['Space X','NASA'], //payloads.customers
//   upcoming: true, //upcomfing
//   success: true, //success
// }
// //launches.set(launch.flightNumber, launch);
// saveLaunch(launch);

async function saveLaunch(launch){
  
  await launchesDB.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch,{
    upsert: true
  })
}
async function scheduleNewLaunch(launch){
  const planet = await planets.findOne({
    keplerName: launch.target
  })
  if(!planet){
    throw new Error('No matching planet found')
  }
  const newFlightNumber = await getLatestLaunchFlightNumber() +1;
  const newLaunch = Object.assign(launch,{
    upcoming: true,
    success: true,
    customers: ['Space X','NASA'],
    flightNumber: newFlightNumber
  })
  saveLaunch(newLaunch);
}

async function getAllLaunches(skip, limit){
  return await launchesDB
    .find({},{'_id':0,'__v':0})
    .sort({flightNumber: -1})
    .skip(skip)
    .limit(limit)
}
async function getLatestLaunchFlightNumber(){
  const latestLaunch = await launchesDB.findOne()
    .sort('-flightNumber');
  if(!latestLaunch){
    return latestFlightNumber;
  }
  return latestLaunch.flightNumber;
}

async function findLaunch(filter){
  return await launchesDB.findOne(filter);
}

async function existsLaunchWithId(launchId){
  return findLaunch({
    flightNumber: launchId
  })
}

async function abortLaunchById(launchId){
  const aborted = await launchesDB.updateOne({
    flightNumber: launchId
  },{
    upcoming: false,
    success: false,
  })
  return aborted.modifiedCount === 1 && aborted.matchedCount === 1
}

async function populateLaunches(){
  const response = await axios.post('https://api.spacexdata.com/v4/launches/query',{
    query:{},
    options:{
      pagination:false,
      populate:[
        {
          path:'rocket',
          select:{
            name:1
          }
        },
        {
          path:'payloads',
          select:{
            customers: 1
          }
        }
      ]
    }
  })
  if(response.status !== 200){
    console.log('Error in downloading data');
    throw new Error('Error in downloading data')
  }
  const launchDocs = response.data.docs;
  for(const launchDoc of launchDocs ){
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => payload['customers'])
    const launch ={
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success:launchDoc['success'],
      customers
    }
    // console.log(launch.customers);
    // console.log(launch.launchDate)
    // console.log(launch.mission)
    //console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch)
  }
}

async function loadPlanetsData(){
  const firstLaunch = await findLaunch({
    flightNumber:1,
    mission:'FalconSat',
    rocket:'Falcon 1',
  })
  if(firstLaunch){
    console.log('Launch Data already loaded')
  }else{
    await populateLaunches();
  }
  
}

module.exports = {
  loadPlanetsData,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById
};