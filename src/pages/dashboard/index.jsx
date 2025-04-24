import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Grid, Paper, Divider, Link } from "@mui/material";
import { FaSearch, FaPlus, FaRegCommentDots } from "react-icons/fa";
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
const darkGray = "#0f172a";
const white = "#ffffff";
const gray = "#1e293b";
const black = "#000000";
const API_URL = process.env.REACT_APP_API_URL;

export default function DashboardPage() {

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
    <Box sx={{ display: "grid", gridTemplateColumns:"15% 65% 20%" , minHeight: "100vh", backgroundColor: black, color: "white" }}>

      {/* Sidebar */}
     <DashboardSidebar />

      {/* Main Content */}
      <Box sx={{ flex: 1, px: 0.5, background: black }}>

        {/* Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5, mt:0.5 }}>
          <TextField
            fullWidth
            placeholder="Search for a stock (e.g., TSLA, AAPL)"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onKeyDown={(e) => handleSearchOnEnter(e)}
            InputProps={{
              // startAdornment: <FaSearch style={{ marginRight: 10 }} />,
              style: { backgroundColor: black, color: "white", borderRadius: 0 },
            }}
            variant="outlined"
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: black,
              color: white,
              px: 2,
              py: 2,
              borderRadius: 0,
              "&:hover": { backgroundColor: lightBlue[500]},
              textTransform: "none",
            }}
            onClick={() => handleSearch(stock)}
          >
            {/* Search */}
            <FaSearch fontSize="14pt" color={white}/>
          </Button>
        </Box>

        {/* Stock Chart + Profile Section */}
        <Box>
          <Box>

            {/* Stock Chart */}
            <Box>
              <Paper sx={{ py:3, px:2, backgroundColor: black, minHeight: "26em", borderRadius: 0 }}>
                 {/* action buttons */}
                  <Box sx={{ display: "flex", justifyContent: "end" , gap: 1 }}>
                    <Button
                        variant="outlined"
                        sx={{ color: black, borderColor: lightBlue[900], textTransform: "none", background: lightBlue[500] }}
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
                        sx={{ color: "#cbd5e1", borderColor: "#334155", textTransform: "none" }}
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
                    <Typography variant="body2" color="gray">Loading stock chart...</Typography>
                  )}
              </Paper>
            </Box>

            {/* Company Profile */}
            <Paper sx={{ px: 3, pb: 3, backgroundColor: black, minWidth: "45em", minHeight: "26em", borderRadius: 0 }}>
              <Typography color="#cbd5e1" fontWeight="bold" variant="h6">Profile</Typography>

              {companyMetadata ? (
                <Typography mt={1} variant="body2" color="#cbd5e1">
                  {companyMetadata.description}
                </Typography>
              ) : (
                "Search a stock to get company profile"
              )}
            
              {/* Stock key statistics */}
              <Box container spacing={2} mt={6} color="#cbd5e1">
                <Typography mb={2} variant="h6" fontWeight="bold" color="white">
                  Key Statistics
                </Typography>

                <Box display="flex" flexWrap="wrap" columnGap={6} rowGap={2}>
                  <Typography variant="body2"><strong>Market cap</strong> <br/> {stockData?.marketCap ? formatNumber(stockData.marketCap) : "_"}</Typography>
                  <Typography variant="body2"><strong>Dividend yield</strong> <br/> {stockData?.dividendYield ? `${stockData?.dividendYield}%` : "_"}</Typography>
                  <Typography variant="body2"><strong>Average 10D volume</strong> <br/> {stockData?.averageDailyVolume10Day ? formatNumber(stockData.averageDailyVolume10Day) : "_" }</Typography>
                  <Typography variant="body2"><strong>Volume</strong> <br/> {stockData?.regularMarketVolume ? formatNumber(stockData.regularMarketVolume) : "_" }</Typography>
                  <Typography variant="body2"><strong>Today High</strong> <br/> {stockData?.regularMarketDayHigh ? stockData.regularMarketDayHigh.toFixed(2) : "_" }</Typography>
                  <Typography variant="body2"><strong>Today Low</strong> <br/> {stockData?.regularMarketDayLow ? stockData.regularMarketDayLow.toFixed(2) : "_"}</Typography>
                  <Typography variant="body2"><strong>Open Price</strong> <br/> {stockData?.regularMarketOpen}</Typography>
                  <Typography variant="body2"><strong>Market Price</strong> <br/> {stockData?.regularMarketPrice}</Typography>
                  <Typography variant="body2"><strong>52 Week low</strong> <br/> {stockData?.fiftyTwoWeekLow}</Typography>
                  <Typography variant="body2"><strong>52 Week high</strong> <br/> {stockData?.fiftyTwoWeekHigh}</Typography>
                  <Typography variant="body2"><strong>52 Week range</strong> <br/> {stockData?.fiftyTwoWeekRange}</Typography>
                </Box>

                <Box mt={4}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" fontWeight="bold" color="white">
                      Top News
                    </Typography>
                    <Link mt={1.5} underline="no-underline" color={lightBlue[500]} sx={{ "&:hover": { textDecoration: "underline", cursor: "pointer"}}}>
                      Show more
                    </Link>
                  </Box>
                
                  <hr />
                  { stockNews ? stockNews.slice(0,4).map((news, index) => (
                    <Link key={news.id} href={news?.url} target="_blank" underline="none" color={white}>
                      <Box key={index} py={4} px={3} mx={-3} 
                      sx={{
                        "&:hover": {
                          backgroundColor: grey[900],
                        }
                      }}>
                        <Typography fontSize="11pt" color={white}>{news?.source.charAt(0).toUpperCase() + news?.source.slice(1)}</Typography>
                        <Typography fontWeight="bold" color={white}>{news?.title}</Typography>
                        <Typography fontSize="10pt" color="#b4b3b3">{news?.description}</Typography>
                      </Box>
                    </Link>
                    )) : null
                  }
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      <WishlistWIdget wishlist={wishlist} removeFromWishlist={removeFromWishlist} handleSearch={handleSearch} ticker={currentStock} marketChange={stockData?.regularMarketChange} />
      <StockAnalysisModal open={openAnalysisModal} handleClose={() => setOpenAnalysisModal(false)} result={aiAnalysis} />
    </Box>
  );
}