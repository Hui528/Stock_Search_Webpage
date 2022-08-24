const express = require('express');
const app = express();
const finnhub = require('./finnhubAPI');
const PORT = process.env.PORT || 3080
// const PORT = 3080;
const cors = require('cors');
app.use(cors());

app.get('/autocomplete/:name', async function (req, res) {
    let data = await finnhub.getAutocomplete(req.params.name);
    res.send(data);
})

app.get('/description/:name', async function (req, res) {
    let data = await finnhub.getDescription(req.params.name);
    res.send(data);
})

app.get('/hourlyData/:name/:latest', async function (req, res) {
    // let d = new Date();
    let latest = req.params.latest;
    let d = new Date(latest * 1000);
    let data = await finnhub.getHistoricalData(req.params.name, 5, d.setHours(d.getHours() - 6) / 1000, latest);
    res.send(data);
})

app.get('/hisData/:name', async function (req, res) {
    let d = new Date();
    let data = await finnhub.getHistoricalData(req.params.name, 'D', Math.floor(d.setFullYear(d.getFullYear() - 2) / 1000), Math.floor(Date.now() / 1000));
    res.send(data);
})

app.get('/latestPrice/:name', async function (req, res) {
    let data = await finnhub.getLatestPrice(req.params.name);
    res.send(data);
})

app.get('/news/:name', async function (req, res) {
    let before = new Date();
    before.setDate(before.getDate() - 7);
    let data = await finnhub.getNews(req.params.name, before.toLocaleDateString('en-CA'), new Date().toLocaleDateString('en-CA'), 20);
    res.send(data);
})

app.get('/social/:name', async function (req, res) {
    let data = await finnhub.getSocialSentiment(req.params.name);
    res.send(data);
})

app.get('/trends/:name', async function (req, res) {
    let data = await finnhub.getTrends(req.params.name);
    res.send(data);
})

app.get('/earning/:name', async function (req, res) {
    let data = await finnhub.getEarning(req.params.name);
    res.send(data);
})

app.get('/peers/:name', async function (req, res) {
    let data = await finnhub.getPeers(req.params.name);
    res.send(data);
})

app.use(function (req, res, next) {
    next(createError(404));
});

app.listen(PORT, () => {
    console.log(`server.js listen to port ${PORT}...`);
})
