const express = require("express");
const fetch = require('node-fetch');
const router = express.Router();
const controllers = require("./controllers/index")

router.get("/yf/stockdata", controllers.getStockData);
router.get("/tiingo/livedata", controllers.getLiveData);
router.get("/tiingo/historicaldata", controllers.getHistoricalData);
router.get("/tiingo/historicaldata", controllers.getFundamentals);
router.get("/tiingo/news", controllers.getNewsFromTiingo);
router.get("/tiingo/company-metadata", controllers.getCompanyMetadata);

module.exports = router;