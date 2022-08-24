const express = require('express');
// const router = express.Router();
const axios = require('axios');
// const { response } = require('express');
const HttpsProxyAgent = require('https-proxy-agent');

const TOKEN = 'c80vos2ad3ie5egtfmlg';
module.exports.getAutocomplete = getAutocomplete;
module.exports.getDescription = getDescription;
module.exports.getLatestPrice = getLatestPrice;
module.exports.getHistoricalData = getHistoricalData;
module.exports.getNews = getNews;
module.exports.getSocialSentiment = getSocialSentiment;
module.exports.getTrends = getTrends;
module.exports.getEarning = getEarning;
module.exports.getPeers = getPeers;

async function getAutocomplete(name) {
    let url = `https://finnhub.io/api/v1/search?q=${name}&token=${TOKEN}`;
    await axios.get(url).then(response => {
        result = response.data.result
        data = [];
        for (let i = 0; i < result.length; i++) {
            company = {}
            company["displaySymbol"] = result[i]["displaySymbol"];
            company["description"] = result[i]["description"];
            data.push(company);
        }
        // console.log("loading data...")
        // console.log(data)
        // console.log('exit finnhub.js...')
    })
        .catch(error => {
            console.log(error);
        });
    return data
}

async function getDescription(name) {
    let url = `https://finnhub.io/api/v1/stock/profile2?symbol=${name}&token=${TOKEN}`;
    await axios.get(url).then(response => {
        result = response.data;
        data = {};
        data["ticker"] = result["ticker"];
        data["company_name"] = result["name"];
        data["exchange_code"] = result["exchange"];
        data["ipo_start_date"] = result["ipo"];
        data["industry"] = result["finnhubIndustry"];
        data["weburl"] = result["weburl"];
        data["logo"] = result["logo"];
    })
        .catch(error => {
            console.log(error);
        });
    return data;
}

async function getHistoricalData(name, resolution, from, to) {
    // let url = `https://finnhub.io/api/v1/stock/candle?symbol=${name}
    // &resolution=${resolution}&from=${from}&to=${to}&token=${TOKEN}`;
    let url = `https://finnhub.io/api/v1/stock/candle?symbol=${name}&resolution=${resolution}&from=${from}&to=${to}&token=${TOKEN}`;
    await axios.get(url).then(response => {
        result = response.data;
        data = {};
        data["close_prices"] = result["c"];
        data["high_prices"] = result["h"];
        data["low_prices"] = result["l"];
        data["open_prices"] = result["o"];
        data["status"] = result["s"];
        data["timestamp"] = result["t"];
        data["volume"] = result["v"];
    })
        .catch(error => {
            console.log(error);
        });
    return data;
}

async function getLatestPrice(name) {
    let url = `https://finnhub.io/api/v1/quote?symbol=${name}&token=${TOKEN}`;
    await axios.get(url).then(response => {
        result = response.data;
        data = {};
        data["ticker"] = name;
        data["last_price"] = result["c"];
        data["change"] = result["d"];
        data["change_percentage"] = result["dp"];
        data["current_timestamp"] = result["t"];
        data["high_price"] = result["h"];
        data["low_price"] = result["l"];
        data["open_price"] = result["o"];
        data["prev_close"] = result["pc"];
    })
        .catch(error => {
            console.log(error);
        });
    return data;
}

async function getNews(name, start_date, end_date, len) {
    let url = `https://finnhub.io/api/v1/company-news?symbol=${name}&from=${start_date}&to=${end_date}&token=${TOKEN}`;
    await axios.get(url).then(response => {
        result = response.data;
        data = [];
        let i;
        for (i = 0; i < result.length; i++) {
            if (data.length == len) {
                break;
            }
            item = {}
            if (result[i]["headline"] && result[i]["image"] && result[i]["url"] && result[i]["source"] && result[i]["datetime"] && result[i]["summary"]) {
                item["headline"] = result[i]["headline"];
                item["image"] = result[i]["image"];
                item["url"] = result[i]["url"];
                item["source"] = result[i]["source"];
                item["datetime"] = result[i]["datetime"];
                item["summary"] = result[i]["summary"];
                data.push(item);
            }
        }
    })
        .catch(error => {
            console.log(error);
        });
    return data;
}

async function getSocialSentiment(name) {
    let url = `https://finnhub.io/api/v1/stock/social-sentiment?symbol=${name}&from=2022-01-01&token=${TOKEN}`;
    await axios.get(url).then(response => {
        result = response.data;
        data = {};
        reddit = result["reddit"];
        twitter = result["twitter"];
        let mention = 0;
        let positiveMention = 0;
        let negativeMention = 0;
        for (let i = 0; i < reddit.length; i++) {
            mention += reddit[i]["mention"];
            positiveMention += reddit[i]["positiveMention"];
            negativeMention += reddit[i]["negativeMention"];
        }
        data["reddit"] = { "mention": mention, "positiveMention": positiveMention, "negativeMention": negativeMention }
        mention = 0;
        positiveMention = 0;
        negativeMention = 0;
        for (let i = 0; i < twitter.length; i++) {
            mention += twitter[i]["mention"];
            positiveMention += twitter[i]["positiveMention"];
            negativeMention += twitter[i]["negativeMention"];
        }
        data["twitter"] = { "mention": mention, "positiveMention": positiveMention, "negativeMention": negativeMention }
    })
        .catch(error => {
            console.log(error);
        });
    return data;
}

async function getTrends(name) {
    let url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${name}&token=${TOKEN}`;
    await axios.get(url).then(response => {
        result = response.data;
        console.log(result)
        // data = {};
        data = [];
        for (let i = 0; i < result.length; i++) {
            // let date = result[i]["period"];
            // let item = {}
            // item["buy"] = result[i]["buy"];
            // item["hold"] = result[i]["hold"];
            // item["sell"] = result[i]["sell"];
            // item["strongBuy"] = result[i]["strongBuy"];
            // item["strongSell"] = result[i]["strongSell"];
            // data[date] = item;

            let item = {}
            item["period"] = result[i]["period"];
            item["buy"] = result[i]["buy"];
            item["hold"] = result[i]["hold"];
            item["sell"] = result[i]["sell"];
            item["strongBuy"] = result[i]["strongBuy"];
            item["strongSell"] = result[i]["strongSell"];
            data.push(item);
        }
    })
        .catch(error => {
            console.log(error);
        });
    return data;
}

async function getEarning(name) {
    let url = `https://finnhub.io/api/v1/stock/earnings?symbol=${name}&token=${TOKEN}`;
    await axios.get(url).then(response => {
        result = response.data;
        data = [];
        for (let i = 0; i < result.length; i++) {
            let item = {};
            item["actual"] = result[i]["actual"] || 0;
            item["estimate"] = result[i]["estimate"] || 0;
            item["period"] = result[i]["period"] || 0;
            item["surprise"] = result[i]["surprise"] || 0;
            data.push(item);
        }
    })
        .catch(error => {
            console.log(error);
        });
    return data;
}

async function getPeers(name) {
    let url = `https://finnhub.io/api/v1/stock/peers?symbol=${name}&token=${TOKEN}`;
    await axios.get(url).then(response => {
        result = response.data;
        data = {};
        data["peers"] = result;
    })
        .catch(error => {
            console.log(error);
        });
    return data;
}