const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

const services = require('./service.json');

app.get("/", (req, res) => {
    res.send("service review is running");
})

app.get("/service", (req, res) => {
    res.send(services);
});

app.get('/service/:id', (req, res) => {
    const id = req.params.id;
    const service = services.find(singleService => singleService.id == id)
    res.send(service);
})

app.listen(port, () => {
    console.log("service running in port", port);
})