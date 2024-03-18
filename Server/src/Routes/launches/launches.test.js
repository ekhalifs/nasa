const request = require('supertest');
const app = require('../../app');
const {mongodbConnect, mongoDisconnect} = require('../../Services/mongo');

describe('Testing Launches API',() =>{
  beforeAll( async() =>{
    await mongodbConnect();
  })
  
  afterAll(async() =>{
    await mongoDisconnect();
  })

  describe('testing /GET launches',() =>{
    test('It should return 200 status',async () =>{
       await request(app)
      .get('/launches')
      .expect('Content-Type',/json/)
      .expect(200);
   })
  })
  
  describe('test /POST launches',() =>{
    const completeLaunchData = {
        mission:'Moon',
        rocket:'NCKDD',
        target:'Kepler-62 f',
        launchDate:'02-10-2022'
    }
    const launchWithoutDate = {
      mission:'Moon',
      rocket:'NCKDD',
      target:'Kepler-62 f',
    }
  
    const launchWithInvalidDate ={
      mission:'Moon',
      rocket:'NCKDD',
      target:'Kepler-62 f',
      launchDate:'Invalid Date'
    }
    test('It should return 201 created', async() =>{
      const response = await request(app)
        .post('/launches')
        .send(completeLaunchData)
        .expect('Content-Type',/json/)
        .expect(201);
  
        const requestDate = new Date(completeLaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate)
      expect(response.body).toMatchObject(launchWithoutDate)
  
    })
    test('It should catch missing one or more of the required properties', async() =>{
      const response = await request(app)
        .post('/launches')
        .send(launchWithoutDate)
        .expect('Content-Type',/json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: 'missing one or more of the required properties'
      })
    })
    test('It should catch Invalid Date', async () =>{
      const response = await request(app)
        .post('/launches')
        .send(launchWithInvalidDate)
        .expect('Content-Type',/json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: 'Invalid Date'
      })
    })
  })
})
