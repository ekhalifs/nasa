const {getAllLaunches, scheduleNewLaunch, existsLaunchWithId, abortLaunchById} = require('../../Models/launches.model');
const {getPagination} = require('../../Services/query')

async function httpGetAllLaunches(req,res){
  const {skip, limit} = getPagination(req.query);
  const launches  = await getAllLaunches(skip, limit)
  res.status(200).json(launches);
}

async function httpAddNewLaunch(req,res){
 const launch = req.body;
 if(!launch.mission || !launch.rocket || !launch.launchDate ||!launch.target){
  res.status(400).json({error: 'missing one or more of the required properties'})
 }
 launch.launchDate = new Date(launch.launchDate);
 if(isNaN(launch.launchDate)){
  res.status(400).json({error: 'Invalid Date'})
 }
 await scheduleNewLaunch(launch);
 return res.status(201).json(launch);
}

async function httpAbortLaunch(req,res){
  const launchId = Number(req.params.id);
  console.log(launchId);
  const existLaunch = await existsLaunchWithId(launchId)
  if(!existLaunch){
    return res.status(404).json({error: 'Launch not found'})
  }
  const aborted = await abortLaunchById(launchId);
  if(!aborted){
    return res.status(400).json({
      error:'Launch not updated'
    })
  }
  return res.status(200).json({
    ok:true
  });
}
module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch
}