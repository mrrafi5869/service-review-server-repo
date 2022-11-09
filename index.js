const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9t60goe.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const servicesCollection = client.db("photography").collection("services");

    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/service/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const service = services.find((singleService) => singleService.id == id);
    //   res.send(service);
    const id = req.params.id;
    const query = {_id: Object(id)};
    const service = await servicesCollection.findOne(query);
    res.send(service);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

const services = require("./service.json");

app.get("/", (req, res) => {
  res.send("service review is running");
});

// app.get("/service", (req, res) => {
//     res.send(services);
// });

app.listen(port, () => {
  console.log("service running in port", port);
});
