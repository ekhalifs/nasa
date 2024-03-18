const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL

async function mongodbConnect(){
  try{
    await mongoose.connect(MONGO_URL);
    console.log('Mongo DB Connected sucessfully')
  }catch(err){
    throw new Error(err);
  }
}

async function mongoDisconnect(){
  await mongoose.disconnect();
}
module.exports ={
  mongodbConnect,
  mongoDisconnect
}