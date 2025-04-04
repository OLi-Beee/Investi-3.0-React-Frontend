/**
 * @param {*} req 
 * @param {*} res 
 */
exports.getStockData = async (req, res) => {
    try {
      const { key, ticker } = req.query;
  
      if (!key) {
        return res.status(400).json({ message: "Missing 'key' in query string." });
      }
  
      const url = `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes?ticker=${ticker}`;
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": key,
          "x-rapidapi-host": "yahoo-finance15.p.rapidapi.com",
        },
      });
  
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`API error: ${response.status} - ${errorDetails}`);
      }
  
      const result = await response.json();
      return res.status(200).json({
        message: "Fetched live stock data",
        data: result,
      });
  
    } catch (error) {
      console.error("Error fetching multiple stocks:", error.message);
      return res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};
  
  
  /**
   * @param {*} req  - request
   * @param {*} res - result
   */
exports.getLiveData = async (req, res) => {
      const { ticker, token } = req.query;
      
      if (!token) {
        console.error("API token is missing.");
        return null;
      }
    
      const url = `https://api.tiingo.com/iex/${ticker}?token=${token}`;
    
      try {
        const response = await fetch(url);
    
        if (!response.ok) {
          throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }
    
        const result = await response.json();
        res.status(200).json({ message: "fetched live stock data", data: result});
      } catch (error) {
       res.status(500).json({ message: `internal server error ${error.message}`});
      }
};
  
  
  /**
   * @param {*} req - request
   * @param {*} res - result
   */
exports.getHistoricalData = async (req, res) => {
      const { ticker, startDate, token } = req.query;
      const url = `https://api.tiingo.com/iex/${ticker}/prices?startDate=${startDate}&resampleFreq=5min&token=${token}`;
  
      try {
          const response = await fetch(url);
  
          if (!response.ok) {
              throw new Error(`API error: ${response.status} - ${response.statusText}`);
          }
  
          const result = await response.json();
          res.status(200).json({ message: "fetched live stock data", data: result});
        } catch (error) {
         res.status(500).json({ message: `internal server error ${error.message}`});
      }
}
  


/**
 * 
 * @param {*} req - request
 * @param {*} res - result
 */
exports.getFundamentals = async (req, res) => {
      const { ticker, requestedDocs, token } = req.query;
      const url = `https://api.tiingo.com/tiingo/fundamentals/${ticker}/${requestedDocs}?token=${token}`;
  
      try {
          const response = await fetch(url);
  
          if (!response.ok) {
              throw new Error(`API error: ${response.status} - ${response.statusText}`);
          }
  
          const result = await response.json();
          res.status(200).json({ message: "fetched company fundamentals", data: result});
  
      } catch (error) {
          res.status(500).json({ message: `internal server error ${error.message}`});
    }
}


/**
 * @param {*} req - requesr
 * @param {*} res - result
 */
exports.getNewsFromTiingo = async (req, res) => {
    const { token, ticker, tags } = req.query;
    const url = ticker ? 
                `https://api.tiingo.com/tiingo/news?tickers=${ticker}&token=${token}`: tags ? 
                `https://api.tiingo.com/tiingo/news?tags=${tags}&token=${token}` : 
                `https://api.tiingo.com/tiingo/news?token=${token}`;
    console.log("request url", url);

    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(`API error: ${response.status} - ${response.statusText}`);

        const result = await response.json();
        res.status(200).json({ message: "Fetched news", data: result});

    } catch (error) {
        res.status(500).json({ message: `internal server error ${error.message}`});
    }
}



/**
 * @param {*} req - request
 * @param {*} res - result
 */
exports.getCompanyMetadata = async (req, res) => {
    const { token, ticker } = req.query;
    const url = `https://api.tiingo.com/tiingo/daily/${ticker}?token=${token}`;

    try {
        const response =await fetch(url);

        if (!response.ok) throw new Error(`API error: ${response.status} - ${response.statusText}`);

        const result = await response.json();
        res.status(200).json({ message: "fetched metadata", data: result});
    } catch (error) {
        res.status(500).json({ message: `internal server error ${error.message}`});
    }
}



