const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9t60goe.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT (req, res, next) {
  console.log();
  const authHeader = req.headers.authorization;
  if(!authHeader){
    res.status(401).send({message: "unauthorized access"});
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
    if(err){
      res.status(401).send({message: 'unauthorized access'});
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    const servicesCollection = client.db("photography").collection("services");
    const serviceReviews = client.db('photography').collection("reviews");

    app.post('/jwt',(req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '1h'});
      res.send({token});
    })

    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query).limit(3).sort({"name": 1});
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query).sort({"name": 1});
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/service/:id", async (req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const service = await servicesCollection.findOne(query);
        res.send(service);
    });

    // service reviews

    app.get('/reviews', verifyJWT, async(req, res) => {
      const decoded = req.decoded;
      if(decoded.email !== req.query.email){
        res.status(403).send({message: 'unauthorized access'})
      }
      let query = {};
      if(req.query.email){
        query = {
            userEmail: req.query.email
        }
      }
      const cursor = serviceReviews.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.patch('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await serviceReviews.findOne(query);
      res.send(result);
    })

    app.post('/reviews', async(req, res) => {
      const userReview = req.body;
      const result = await serviceReviews.insertOne(userReview);
      res.send(result);
    });

    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await serviceReviews.deleteOne(query);
      res.send(result)
    });

    // services
    app.post('/service', async(req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    })
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("service review is running");
});

app.listen(port, () => {
  console.log("service running in port", port);
});
