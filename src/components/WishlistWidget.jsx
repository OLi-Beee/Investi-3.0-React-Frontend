import { Box, Paper, Typography, Divider, CircularProgress } from "@mui/material";
import { RxCross2 } from "react-icons/rx";
import { red, green, grey, teal } from '@mui/material/colors';
import { useEffect, useState, useCallback } from "react";
import { IoBookmarkOutline, IoTrendingUp, IoTrendingDown } from "react-icons/io5";

const darkBg = "#0d0d0d";
const white = "#ffffff";
const API_URL = process.env.REACT_APP_API_URL;

const WishlistWIdget = ({ wishlist, removeFromWishlist, handleSearch, marketChange, sx }) => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  // Improved data fetching with memoized callback
  const getLiveStockData = useCallback(async (ticker) => {
    if (!ticker) return;

    try {
      setLoading(true);
      // Fix API URL - ensure it has a trailing slash
      const baseUrl = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
      const url = `${baseUrl}tiingo/livedata?ticker=${ticker}`;
      
      console.log("Fetching data for:", ticker, "URL:", url);
      
      const response = await fetch(url);
      const result = await response.json();

      // Only update if response is ok
      if (!response.ok) {
        console.error("Error fetching data for ticker:", ticker, result.message || response.statusText);
        return;
      }

      // Create a more robust update approach
      setStockData(prevData => {
        // Filter out old data for this ticker
        const filteredData = prevData.filter(item => item.ticker !== ticker);
        // Add new data, ensuring it exists
        if (result.data && result.data.length > 0) {
          return [...filteredData, ...result.data];
        }
        return filteredData;
      });
      
      console.log("Data received for ticker:", ticker, result.data);
    } catch (error) {
      console.error("Error fetching ticker data:", ticker, error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Fetch data when wishlist changes and periodically refresh
  useEffect(() => {
    if (!wishlist || !Array.isArray(wishlist) || wishlist.length === 0) {
      console.log("Wishlist is empty or invalid:", wishlist);
      return;
    }
    
    console.log("Wishlist updated, fetching data for:", wishlist);
    
    // Initial fetch for all tickers
    wishlist.forEach(ticker => {
      if (ticker) getLiveStockData(ticker);
    });
    
    // Set up interval for periodic updates (every 60 seconds)
    const interval = setInterval(() => {
      if (wishlist && wishlist.length > 0) {
        console.log("Refreshing watchlist data...");
        wishlist.forEach(ticker => {
          if (ticker) getLiveStockData(ticker);
        });
      }
    }, 60000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [wishlist, getLiveStockData]);

  const getPriceForTicker = (ticker) => {
    const stock = stockData?.find(item => item?.ticker === ticker);
    
    if (!stock) return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={14} sx={{ color: teal[400] }} />
        <Typography fontSize="0.8rem" color={grey[500]}>Loading...</Typography>
      </Box>
    );
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {stock.tngoLast > stock.prevClose ? 
          <IoTrendingUp color={green[400]} /> : 
          <IoTrendingDown color={red[400]} />
        }
        <Typography 
          variant="body1" 
          fontWeight="bold"
          sx={{ 
            color: stock.tngoLast > stock.prevClose ? green[400] : red[400],
            letterSpacing: 0.5
          }}>
          ${stock.tngoLast?.toFixed(2)}
        </Typography>
      </Box>
    );
  };

  // The rest of your component stays the same...
  return (
    <Box
      sx={{
        height: "100vh",
        background: 'linear-gradient(to bottom, #121212, #0d0d0d)',
        borderLeft: `1px solid ${grey[900]}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1px',
          height: '100%',
          background: `linear-gradient(to bottom, transparent, ${green[900]}, transparent)`,
          opacity: 0.6,
        },
        ...(sx || {})
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3,
        borderBottom: `1px solid ${grey[900]}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <IoBookmarkOutline size={20} style={{ color: teal[400] }} />
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          sx={{ 
            color: teal[300],
            letterSpacing: 0.5
          }}
        >
          Watchlist
        </Typography>
      </Box>

      {/* Watchlist items */}
      <Box
        sx={{
          height: "calc(100vh - 74px)",
          overflowY: "auto",
          p: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `rgba(${parseInt(green[900].slice(1, 3), 16)}, ${parseInt(green[900].slice(3, 5), 16)}, ${parseInt(green[900].slice(5, 7), 16)}, 0.5)`,
            borderRadius: '10px',
          },
        }}
      >
        {wishlist && wishlist.length > 0 ? (
          wishlist.map((ticker) => (
            <Paper
              key={ticker}
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: "space-between",
                background: 'rgba(20, 30, 20, 0.4)',
                borderRadius: 2,
                border: `1px solid ${grey[900]}`,
                mb: 2,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: "pointer",
                "&:hover": {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 4px 12px rgba(0,128,0,0.2)`,
                  border: `1px solid ${green[900]}`,
                }
              }}
              onClick={() => handleSearch(ticker)}
            >
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                p: 2,
                borderBottom: `1px solid ${grey[900]}`
              }}>
                <Typography 
                  variant="h6" 
                  fontWeight="600"
                  sx={{ color: grey[100] }}
                >
                  {ticker}
                </Typography>
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(ticker);
                  }}
                  sx={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    }
                  }}
                >
                  <RxCross2 
                    fontSize={16} 
                    style={{ 
                      color: grey[400],
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: red[400]
                      }
                    }} 
                  />
                </Box>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography 
                  sx={{ 
                    fontWeight: "bold",
                    fontSize: '0.9rem',
                    color: grey[300],
                    letterSpacing: 0.5
                  }}
                >
                  Price
                </Typography>
                {getPriceForTicker(ticker)}
              </Box>
            </Paper>
          ))
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            opacity: 0.7,
            p: 4
          }}>
            <IoBookmarkOutline size={40} style={{ color: grey[700], marginBottom: '16px' }} />
            <Typography 
              variant="body1" 
              sx={{ 
                color: grey[500], 
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              Your watchlist is empty. Search for stocks and add them to your watchlist.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default WishlistWIdget;
