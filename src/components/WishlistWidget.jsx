import { Box, Paper, Typography } from "@mui/material";
import { RxCross2 } from "react-icons/rx";
import { red, green, grey, lightBlue } from '@mui/material/colors';
import { useEffect, useState } from "react";

const black = "#000000";
const white = "#ffffff";
const API_URL = process.env.REACT_APP_API_URL;

const WishlistWIdget = ({ wishlist, removeFromWishlist, handleSearch, marketChange }) => {
  const [stockData, setStockData] = useState([]);
  const [stockIsUp, setStockIsUp] = useState(true);
  

  const getLiveStockData = async (ticker) => {
    if (!ticker) return;

    const url = `${API_URL}tiingo/livedata?ticker=${ticker}`;

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        console.log("no data for ticker", ticker);
        return;
      }

      setStockData((prevData) => {
        const filteredData = prevData.filter(item => item.ticker !== ticker);
        return [...filteredData, ...result.data];
      });

    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (!wishlist || wishlist.length === 0) return;
      wishlist.forEach((ticker) => {
        getLiveStockData(ticker);
      });

  }, [wishlist]);

  const getPriceForTicker = (ticker) => {
    const stock = stockData.find(item => item.ticker === ticker);
    return stock ? stock.tngoLast + " USD" : "Loading...";
  };

  // useEffect(() => {
    
  //   if (marketChange) {
  //     console.log("market change", marketChangemarketChange.startsWith("-"))
  //     setStockIsUp(true);
  //   }
  // }, [marketChange])

  return (
    <Paper
      sx={{
        d: "flex",
        flexDirection: "column",
        gap: 0,
        width: "19%",
        p: 1,
        minHeight: 340,
        right: 0,
        top: 10,
        position: "fixed",
        background: black,
        color: white,
      }}
    >
      <Box sx={{ border: "solid", borderColor: grey[900], borderWidth: ".1px", py: 1, px: 1, minWidth: "90%" }}>
        <Typography variant="body1" fontWeight="bold" textAlign="center">Wishlist</Typography>
      </Box>

      {wishlist && wishlist.length > 0 ? (
        wishlist.map((ticker) => (
          <Box key={ticker}
            sx={{
              justifyContent: "space-between",
              border: "solid",
              borderColor: grey[900],
              borderWidth: "0.5px",
              p: 1,
              minWidth: "90%",
              "&:hover": {
                backgroundColor: grey[900],
                cursor: "pointer"
              }
            }}
            onClick={() => handleSearch(ticker)}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="body2" fontWeight="bold">{ticker}</Typography>
              <Typography
                sx={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWishlist(ticker);
                }}
              >
                <RxCross2 fontSize={14} />
              </Typography>
            </Box>
            <Box mt={0}>
              <Typography variant="body2" color={marketChange}>
                {getPriceForTicker(ticker)}
              </Typography>
            </Box>
          </Box>
        ))
      ) : (
        <Typography sx={{ mt: 2, textAlign: "center", color: "gray" }}>
          No stocks in wishlist.
        </Typography>
      )}
    </Paper>
  );
};

export default WishlistWIdget;
