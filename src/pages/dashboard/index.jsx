import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Grid, Paper, Divider, Link, InputAdornment, useMediaQuery, useTheme } from "@mui/material";
import { FaSearch, FaPlus, FaRegCommentDots, FaChartLine } from "react-icons/fa";
import { IoAnalyticsSharp, IoStatsChartSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { red, green, blue, lightBlue, cyan, teal, lightGreen, grey } from '@mui/material/colors';
import { ref, set, get, child } from "firebase/database";
import { database } from "../../firebaseConfig";
import DashboardSidebar from "../../components/DashboardSidebar";
import { onAuthStateChanged } from "firebase/auth";
import WishlistWIdget from "../../components/WishlistWidget";
import StockChart from "../../components/stockChart";
import StockAnalysisModal from "../../components/AnalysisModal";
import { getCurrentDate, isStockMarketOpen } from "../../util/apis";

// ------------------ Color Variables ------------------
const darkGray = "#121212";
const white = "#ffffff";
const darkBg = "#0d0d0d";
const black = "#000000";
const API_URL = process.env.REACT_APP_API_URL;

export default function DashboardPage() {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // ------------------ State ------------------
  const [stock, setStock] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [stockData, setStockData] = useState([]);
  const [stockMetaData, setStockMetaData] = useState([]);
  const [isBullish, setIsBullish] = useState(true);
  const [companyMetadata, setCompanyMetadata] = useState([]);
  const [stockNews, setStockNews] = useState([]);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [wishlist, setWishlist] = useState(null);
  const [candleSticksData, setCandleSticksData] = useState([]);
  const [openAnalysisModal, setOpenAnalysisModal] = useState(false);
  const [aiAnalysis, setAiAnalysy] = useState([]);

  // ------------------ use navigate  ------------------
  const navigate = useNavigate();
  
  //-------- get date from 1 year ago -------------
  const getDate365DaysAgo = () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 365);
  
    // Format to YYYY-MM-DD
    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const day = String(pastDate.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  };
  
  //-------------- get candlesticks -------------
  const getCandleSticks = async(ticker, startDate) => {
    const url = `${API_URL}/tiingo/candlestics?ticker=${ticker}&startDate=${startDate}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      console.log("Status", response.status, result.message);
      return;
    }

    setCandleSticksData(result.data);
    console.log("status", response.status, result.message);
  }

  // ------------------ Search ------------------
  const handleSearch = async (ticker) => {
    if (!ticker) return;

    //write save last searched stock
    if (!ticker) {
      console.log("no user id found");
      return;
    }
    
    /**
     * call get stock data, if we get stock data
     */
    getStockData(ticker); 
    getCandleSticks(ticker, getDate365DaysAgo());
    getCompanyMetadata(ticker);
    getNews(ticker)
    setCurrentStock(ticker);
    setStock(""); 
  };

  //---------- hanle search on key down ----------
  const handleSearchOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // optional: prevents default form submission
      handleSearch(e.target.value); 
    }
  };
  
  // -------------------- save last search ------------------
  const saveLastSearch = async (userId, stock) => {
    try {
      await set(ref(database, `lastSearch/${userId}`), stock)
    } catch (error) {
      console.log(error);
    }
  }

  // --------------------- add to wishlist ------------------------
  const addToWishlish = async () => {
    if (!userId || !currentStock) console.log("userid not found", "current stock not found", currentStock)

    try {
      const wishlistRef = ref(database, `wishlist/${userId}`);
      const snapshot = await get(wishlistRef);
  
      let currentWishlist = [];
  
      if (snapshot.exists()) {
        currentWishlist = snapshot.val();
      }
  
      // Prevent duplicates
      if (!currentWishlist.includes(currentStock)) {
        const updatedWishlist = [...currentWishlist, currentStock.toUpperCase()];
        await set(wishlistRef, updatedWishlist);
        console.log("Stock added to wishlist!");
        fetchWishlist();
      } else {
        console.log("Stock already in wishlist");
      }
  
    } catch (error) {
      console.error("Error saving to wishlist:", error);
    }
  }

  // -------------- get wishlist ----------------------
  const fetchWishlist = async () => {
    if (!userId) return;

    try {
      const wishlistRef = ref(database, `wishlist/${userId}`);
      const snapshot = await get(wishlistRef);

      if (snapshot.exists()) {
        setWishlist(snapshot.val()); // should be an array like ["AAPL", "TSLA"]
        console.log("Wishlist loaded:", snapshot.val());
      } else {
        console.log("No wishlist found");
        setWishlist([]); // Optional: reset to empty array if not found
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  //------------- remove from wishlish -------------
  const removeFromWishlist = async (tickerToRemove) => {
    if (!userId) return;
  
    try {
      const wishlistRef = ref(database, `wishlist/${userId}`);
      const snapshot = await get(wishlistRef);
  
      if (snapshot.exists()) {
        const currentWishlist = snapshot.val();
        const updatedWishlist = currentWishlist.filter((ticker) => ticker !== tickerToRemove);
  
        await set(wishlistRef, updatedWishlist);
        setWishlist(updatedWishlist); // update local state
        console.log(`${tickerToRemove} removed from wishlist`);
        fetchWishlist() // update client
      }
    } catch (error) {
      console.error("Error removing stock from wishlist:", error);
    }
  };
  
  // ------------------ Company Metadata ------------------
  const getCompanyMetadata = async (ticker) => {
    if (!ticker) return;
    
    try {
      const response = await fetch(`${API_URL}/tiingo/company-metadata?ticker=${ticker}`);
      const result = await response.json();

      if (!response.ok){
        console.log("Status:", response.status, response.statusText);
        window.location.reload();
        return;
      }

      console.log("Status:", response.status, response.statusText, result.message);
      setCompanyMetadata(result.data);

    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // ------------------ Stock Data ------------------
  const getStockData = async (ticker) => {
    if (!ticker) {
      console.log("no ticker provided, ticker is", ticker);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/yf/stockdata?ticker=${ticker}`);
      const result = await response.json();

      if (!response.ok) {
        console.log(response.status, response.statusText, result.message);
        window.location.reload()
        return;
      }
      
      /**
       * If response is ok, call all other functions to get stock stats
       * save the ticker if we got a response.
      **/
      setStockData(result?.data?.body[0]); 
      saveLastSearch(userId, ticker);
      console.log(response.status, response.statusText, result.message);
    } catch (error){
      console.log(error);
    }
  };

  // ------------------ Number Formatter ------------------
  const formatNumber = n => {
    if (n >= 1e12) return (n / 1e12).toFixed(n % 1e12 === 0 ? 0 : 1) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
    return n.toLocaleString();
  };

  // ------------------ Get News ------------------
  const getNews = async (ticker, tags) => {
    const url = ticker ? `${API_URL}/tiingo/news?ticker=${ticker}` 
                : tags ? `${API_URL}/tiingo/news?tags=${tags}` 
                : `${API_URL}/tiingo/news`
    try {
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        console.log(response.status, response.statusText, result.message);
      }

      console.log(response.status, response.statusText, result.message);
      setStockNews(result.data);

    } catch (error) {
      console.log(error);
    }
  }

  //----------------- perform analysis ----------------
  const getAiAnalysis = async (ticker) => {
    const url = `${API_URL}/analysis?ticker=${ticker}`;

    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      console.log(response.status, result.message);
      return;
    }

    setAiAnalysy(result.data);
    console.log(response.status, result.message);
  }

  //----------------- useEffects ------------------
  //get candlesticks live
  useEffect(() => {
    if (!currentStock) return;

    const startDate = getDate365DaysAgo();

    // Fetch immediately if market is open
    if (isStockMarketOpen()) {
      getCandleSticks(currentStock, startDate);
    }

    const interval = setInterval(() => {
      if (isStockMarketOpen()) {
        getCandleSticks(currentStock, startDate);
      }
    }, 60000); // every 1 minute

    return () => clearInterval(interval);
  }, [currentStock]);

  //get user on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setEmail(user.email);
      }
    });
  
    return () => unsubscribe(); // Clean up listener
  }, []);

  useEffect(() => {
    const startDate = getDate365DaysAgo();

    const fetchLastSearch = async () => {
      if (!userId) return;
  
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `/lastSearch/${userId}`));
  
        if (snapshot.exists()) {
          const ticker = snapshot.val();
          setCurrentStock(ticker);
          getCandleSticks(ticker, startDate);
          getStockData(ticker);
          getNews(ticker);
          getCompanyMetadata(ticker);
        } else {
          console.log("No last search found");
        }
      } catch (error) {
        console.error("Error getting data:", error);
      }
    };
  
    fetchLastSearch();
  }, [userId]); 

  //------------- get wishlist -----------------
  useEffect(() => {  
    fetchWishlist();
  }, [userId]);
  
  // ------------------ JSX ------------------
  return (
    <Box sx={{ 
      display: "grid", 
      gridTemplateColumns: isSmallScreen 
        ? "1fr" 
        : isMediumScreen 
          ? "220px 1fr" 
          : "220px minmax(0, 4fr) minmax(0, 1fr)", // Adjust the ratio here
      gridAutoFlow: "column", // Force elements to stay in their column
      height: "100vh",
      backgroundColor: darkBg, 
      color: "white", 
      background: 'linear-gradient(to bottom, #121212, #0d0d0d)',
      overflow: "hidden"
    }}>

      {/* Sidebar - Hidden on mobile */}
      {!isSmallScreen && <DashboardSidebar />}

      {/* Main Content */}
      <Box sx={{ 
        px: { xs: 1, sm: 2, md: 2 }, 
        py: 2, 
        mx: "auto",
        overflow: "auto",
        height: "100vh",
        width: "auto",
        maxWidth: "92%",
        // Hide scrollbar but keep scroll functionality
        '&::-webkit-scrollbar': { 
          display: 'none' // Chrome, Safari, and newer versions of Edge
        },
        scrollbarWidth: 'none', // Firefox
        '-ms-overflow-style': 'none', // IE and Edge legacy
      }}>

        {/* Search Bar */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 0.5, 
          mb: 3, 
          mt: 1,
          background: 'rgba(20, 30, 20, 0.3)',
          borderRadius: '10px',
          border: `1px solid ${grey[900]}`,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <TextField
            fullWidth
            placeholder="Search for a stock (e.g., TSLA, AAPL)"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onKeyDown={(e) => handleSearchOnEnter(e)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': { border: 'none' }
              },
              '& .MuiInputBase-input': {
                color: grey[100],
                fontSize: '1rem',
                padding: { xs: '10px 12px', sm: '14px 16px' },
                '&::placeholder': {
                  color: grey[500],
                  opacity: 1
                }
              },
              backgroundColor: 'transparent'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch style={{ color: teal[300] }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: green[700],
              color: white,
              px: 3,
              py: 1.6,
              borderRadius: 0,
              "&:hover": { 
                backgroundColor: green[600],
                transform: 'translateX(2px)'
              },
              textTransform: "none",
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleSearch(stock)}
          >
            Search
          </Button>
        </Box>

        {/* Stock Chart + Profile Section */}
        <Box>
          <Box>

            {/* Stock Chart */}
            <Box>
              <Paper sx={{ 
                py: 3, 
                px: 1.5, 
                backgroundColor: 'rgba(20, 30, 20, 0.4)', 
                minHeight: "26em", 
                borderRadius: 2,
                border: `1px solid ${green[900]}`,
                mb: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                {/* Action buttons */}
                <Box sx={{ display: "flex", justifyContent: "end", gap: 1.5, mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<IoAnalyticsSharp />}
                    sx={{ 
                      color: 'white', 
                      backgroundColor: teal[700],
                      textTransform: "none", 
                      borderRadius: '10px',
                      px: 2.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: teal[600],
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 12px rgba(0,128,128,0.3)`
                      }
                    }}
                    onClick={() => {
                      setOpenAnalysisModal(true);
                      getAiAnalysis(currentStock)
                    }}
                  >
                    View AI Analysis
                  </Button>
                  <Button
                    startIcon={<FaPlus />}
                    variant="outlined"
                    sx={{ 
                      color: grey[200], 
                      borderColor: green[900], 
                      borderRadius: '10px',
                      textTransform: "none",
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: green[700],
                        backgroundColor: 'rgba(0, 128, 0, 0.1)',
                        transform: 'translateX(3px)'
                      }
                    }}
                    onClick={addToWishlish}
                  >
                    Add to Wishlist
                  </Button>
                </Box>
                
                {stockData?.regularMarketPrice !== undefined && stockData?.regularMarketChange !== undefined && stockData?.regularMarketChangePercent !== undefined ? (
                  <StockChart 
                    data={candleSticksData} 
                    companyName={stockData?.shortName} 
                    exchangeCode={companyMetadata?.exchangeCode} 
                    price={stockData?.regularMarketPrice}
                    marketPriceChange={`${stockData.regularMarketChange.toFixed(2)} (${stockData.regularMarketChangePercent.toFixed(2)}%) Today`}
                  />
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <FaChartLine size={40} style={{ color: teal[400], opacity: 0.7 }} />
                    <Typography variant="body1" color={grey[400]} sx={{ fontStyle: 'italic' }}>
                      Search for a stock to view its chart
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Company Profile */}
            <Paper sx={{ 
              px: 3, 
              py: 3, 
              backgroundColor: 'rgba(20, 30, 20, 0.4)',
              width: "auto", // Changed from minWidth: "45em" to be responsive
              minHeight: "26em", 
              borderRadius: 2,
              border: `1px solid ${green[900]}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <Typography color={teal[300]} fontWeight="bold" variant="h6" sx={{ mb: 1 }}>Company Profile</Typography>

              {companyMetadata?.description ? (
                <Typography mt={1} variant="body2" color={grey[300]} sx={{ lineHeight: 1.7, letterSpacing: 0.3 }}>
                  {companyMetadata.description}
                </Typography>
              ) : (
                <Typography variant="body2" color={grey[500]} sx={{ fontStyle: 'italic' }}>
                  Search a stock to get company profile
                </Typography>
              )}
            
              {/* Stock key statistics */}
              <Box container spacing={2} mt={3} color={grey[300]}>
                <Box 
                  display="flex" 
                  flexWrap="wrap" 
                  columnGap={6} 
                  rowGap={3}
                  sx={{
                    background: 'rgba(0, 30, 0, 0.3)',
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${green[900]}`,
                  }}
                >
                  <Typography variant="body2"><strong>Market cap</strong> <br/> {stockData?.marketCap ? formatNumber(stockData.marketCap) : "—"}</Typography>
                  <Typography variant="body2"><strong>Dividend yield</strong> <br/> {stockData?.dividendYield ? `${stockData?.dividendYield}%` : "—"}</Typography>
                  <Typography variant="body2"><strong>Average 10D volume</strong> <br/> {stockData?.averageDailyVolume10Day ? formatNumber(stockData.averageDailyVolume10Day) : "—" }</Typography>
                  <Typography variant="body2"><strong>Volume</strong> <br/> {stockData?.regularMarketVolume ? formatNumber(stockData.regularMarketVolume) : "—" }</Typography>
                  <Typography variant="body2"><strong>Today High</strong> <br/> {stockData?.regularMarketDayHigh ? stockData.regularMarketDayHigh.toFixed(2) : "—" }</Typography>
                  <Typography variant="body2"><strong>Today Low</strong> <br/> {stockData?.regularMarketDayLow ? stockData.regularMarketDayLow.toFixed(2) : "—"}</Typography>
                  <Typography variant="body2"><strong>Open Price</strong> <br/> {stockData?.regularMarketOpen || "—"}</Typography>
                  <Typography variant="body2"><strong>Market Price</strong> <br/> {stockData?.regularMarketPrice || "—"}</Typography>
                  <Typography variant="body2"><strong>52 Week low</strong> <br/> {stockData?.fiftyTwoWeekLow || "—"}</Typography>
                  <Typography variant="body2"><strong>52 Week high</strong> <br/> {stockData?.fiftyTwoWeekHigh || "—"}</Typography>
                  <Typography variant="body2"><strong>52 Week range</strong> <br/> {stockData?.fiftyTwoWeekRange || "—"}</Typography>
                </Box>

                <Box mt={5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold" color={teal[300]}>
                      Recent News
                    </Typography>
                    <Button 
                      size="small" 
                      variant="text" 
                      sx={{ 
                        color: green[400], 
                        textTransform: 'none',
                        '&:hover': { 
                          backgroundColor: 'rgba(0, 128, 0, 0.1)',
                          color: green[300]
                        }
                      }}
                    >
                      View all news
                    </Button>
                  </Box>
                
                  <Divider sx={{ my: 2, bgcolor: green[900], opacity: 0.7 }} />
                  
                  { stockNews?.length > 0 ? (
                    stockNews.slice(0,4).map((news, index) => (
                      <Link key={news.id} href={news?.url} target="_blank" underline="none" color={white}>
                        <Box key={index} py={2.5} px={2.5} mb={0.5} 
                        sx={{
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          "&:hover": {
                            backgroundColor: 'rgba(0, 30, 0, 0.3)',
                            transform: 'translateX(5px)',
                          }
                        }}>
                          <Typography fontSize="11pt" color={teal[400]}>{news?.source.charAt(0).toUpperCase() + news?.source.slice(1)}</Typography>
                          <Typography fontWeight="bold" color={grey[100]} sx={{ my: 0.5 }}>{news?.title}</Typography>
                          <Typography fontSize="10pt" color={grey[500]} sx={{ opacity: 0.9 }}>{news?.description}</Typography>
                        </Box>
                      </Link>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Typography color={grey[500]} sx={{ fontStyle: 'italic' }}>No news available for this stock</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      
      {!isSmallScreen && !isMediumScreen && (
        <WishlistWIdget 
          wishlist={wishlist} 
          removeFromWishlist={removeFromWishlist} 
          handleSearch={handleSearch} 
          ticker={currentStock} 
          marketChange={stockData?.regularMarketChange}
          sx={{ width: "100%" }} // Make sure it uses full allocated width
        />
      )}

      <StockAnalysisModal open={openAnalysisModal} handleClose={() => setOpenAnalysisModal(false)} result={aiAnalysis} stock={currentStock}/>
    </Box>
  );
}