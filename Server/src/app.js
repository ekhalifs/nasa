const express = require('express');
const path = require('path')
const app = express();
const cors = require('cors');
const morgan = require('morgan')
const helmet = require('helmet');

const api = require('./Routes/api');

app.use(helmet());

app.use(cors({
  origin:'http://localhost:3000',
}))

app.use(morgan('combined'));
app.use(express.json());

app.use('/v1',api)

app.use(express.static(path.join(__dirname,'..','build')))
app.get('/*',(req,res) =>{
  res.sendFile(path.join(__dirname,'..','build','index.html'));
})

module.exports = app;