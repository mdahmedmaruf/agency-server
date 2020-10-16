const express = require('express');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const { query } = require('express');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.juysi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service-images'));
app.use(fileUpload());
const port = 4000;
console.log(process.env.DB_USER);


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(error => {
  const orderCollections = client.db(process.config.DB_NAME).collection("Orders");
  const reviewCollections = client.db(process.config.DB_NAME).collection("Reviews");
  const serviceCollections = client.db(process.config.DB_NAME).collection("Services");
  const adminCollections = client.db(process.config.DB_NAME).collection("Admins");

  app.post('/addNewOrder', (req, res) => {
    const file = req.files.layoutDesign;
    const name = req.body.name;
    const email = req.body.email;
    const orderCategory = req.body.orderCategory;
    const details = req.body.details;
    const price = req.body.price;
    const newImg = file.data;
    const encodeImg = newImg.toString('base64');
    var image = {
      contentType: file.minetype,
      size: file.size,
      img: Buffer.from(encodeImg, 'base64')
    };
    orderCollections.insertOne({name, email, orderCategory, details, price, image})
    .then(result => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post('/addReview', (req, res) => {
    const reviewCollection = req.body;
    reviewCollections.insertOne(reviewCollection)
    .then(result => {
      //console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.post('/addAdmin', (req, res) => {
    const adminCollection = req.body;
    adminCollections.insertOne(adminCollection)
    .then(result => {
      //console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.post('/addNewService', (req, res) => {
    const file = req.files.designFile;
    const name = req.body.name;
    const description = req.body.description;
    const newImg = file.data;
    const encodeImg = newImg.toString('base64');
    var image = {
      contentType: file.minetype,
      size: file.size,
      img: Buffer.from(encodeImg, 'base64')
    };
    serviceCollections.insertOne({name, description, image})
    .then(result => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollections.find({email: email})
    .toArray((error, admins) => {
      res.send(admins.length > 0);
    });
  });

  app.get('/AllOrderLists', (req, res) => {
    orderCollections.find({})
    .toArray((error, documents) => {
      res.send(documents);
    });
  });

  app.get('/AllServices', (req, res) => {
    serviceCollections.find({})
    .toArray((error, documents) => {
      res.send(documents);
    });
  });

  app.get('/AllReviews', (req, res) => {
    reviewCollections.find({})
    .toArray((error, documents) => {
      res.send(documents);
    });
  });

});


app.get('/', (req, res) => {
  res.send(`<h3>Hello Every One Welcome to BD Creative Agency</h3>`);
});

app.listen(process.env.PORT || port);