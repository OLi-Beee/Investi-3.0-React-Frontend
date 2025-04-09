import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Grid, Paper, Divider, Link } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend} from "chart.js";
import { FaSearch, FaPlus, FaRegCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { red, green, blue, lightBlue, cyan, teal, lightGreen, grey } from '@mui/material/colors';
import { ref, set, get, child } from "firebase/database";
import { database } from "../../firebaseConfig";
import DashboardSidebar from "../../components/DashboardSidebar";
import { RxCross2 } from "react-icons/rx";
import { onAuthStateChanged } from "firebase/auth";

// Register chart.js modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ------------------ Color Variables ------------------
const darkGray = "#0f172a";
const white = "#ffffff";
const gray = "#1e293b";
const black = "#000000"

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


  // ------------------ Config ------------------
  const navigate = useNavigate();
  const tiingoToken = process.env.REACT_APP_TIINGO_API_KEY;
  const rapidKey = process.env.REACT_APP_RAPID_API_KEY;

  // ------------------ Search ------------------
  const handleSearch = async (stock) => {
    if (!stock) return;

    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 360);
    const startDate = pastDate.toISOString().split("T")[0];


    //write save last searched stock
    if (!userId) {
      console.log("no user id found");
      return;
    }
    
    saveLastSearch(userId)

    // Fetch metadata and stock data
    getCompanyMetadata(stock, tiingoToken);
    getStockData(stock, rapidKey);
    getNews(stock, undefined, tiingoToken)

    setCurrentStock(stock);
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
  const saveLastSearch = async (userId) => {
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
  const getCompanyMetadata = async (ticker, token) => {
    try {
      const response = await fetch(`http://localhost:3001/tiingo/company-metadata?ticker=${ticker}&token=${token}`);
      const result = await response.json();

      if (!response.ok){
        console.log("Status:", response.status, response.statusText);
      }

      console.log("Status:", response.status, response.statusText, result.message);
      setCompanyMetadata(result.data);

    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // ------------------ Stock Data ------------------
  const getStockData = async (ticker, key) => {
    try {
      const response = await fetch(`http://localhost:3001/yf/stockdata?key=${key}&ticker=${ticker}`);
      const result = await response.json();

      if (!response.ok) {
        console.log(response.status, response.statusText, result.message);
      }

      console.log(result);
      setStockData(result.data.body[0]);
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
  
  // ------------------ Dummy Chart Data ------------------
  const stockPerformanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Stock Price",
        data: [120, 135, 150, 170, 165, 180, 200],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // ------------------ Get News ------------------
  const getNews = async (ticker, tags, token) => {
    const url = ticker ? `http://localhost:3001/tiingo/news?ticker=${ticker}&token=${token}` 
                : tags ? `http://localhost:3001/tiingo/news?tags=${tags}&token=${token}` 
                : `http://localhost:3001/tiingo/news?token=${token}`
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


  //----------------- useEffects ------------------

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
    const fetchLastSearch = async () => {
      if (!userId) return;
  
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `/lastSearch/${userId}`));
  
        if (snapshot.exists()) {
          const ticker = snapshot.val();
          setCurrentStock(ticker);
          console.log("Last searched ticker:", ticker);
          getStockData(ticker, rapidKey);
          getNews(ticker, undefined, tiingoToken);
          getCompanyMetadata(ticker, tiingoToken);
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
              px: 4,
              py: 2.3,
              borderRadius: 0,
              "&:hover": { backgroundColor: "#22c55e" },
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
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography fontWeight="bold" color="#cbd5e1">
                      {companyMetadata?.name || "Stock Chart"}
                    </Typography>
                    <Typography fontWeight="bold" color="#cbd5e1">
                      {companyMetadata?.exchangeCode || ""}
                    </Typography>
                  </Box>

                 {/* action buttons */}
                 <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                      variant="outlined"
                      sx={{ color: black, borderColor: grey[700], textTransform: "none", background: lightBlue[500] }}
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
                </Box>

                <Typography mt={2} color="#cbd5e1">
                  Stock Sentiment: {" "}
                  <span style={{ color: isBullish ? "#10b981" : "#ef4444" }}>
                    {isBullish ? "Bullish 🟢" : "Bearish 🔴"}
                  </span>
                </Typography>

                <Box mt={4} height={250}>
                  <Line
                    data={stockPerformanceData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </Box>
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
      <WishlistWIdget wishlist={wishlist} removeFromWishlist={removeFromWishlist} handleSearch={handleSearch}/>
    </Box>
  );
}


const WishlistWIdget = ({ wishlist, removeFromWishlist, handleSearch }) => {
  return (
    <Paper sx={{ d: "flex", flexDirection: "column", gap: 0, width: "19.5%", p: 1, minHeight: 340, right: 0, top: 10, position: "fixed", background: black, color: white, }}>
      <Box sx={{ border:"solid", borderColor: grey[900], borderWidth: ".1px", py:1, px:1, minWidth: "90%" }}>
        <Typography variant="body1" fontWeight="bold" textAlign="center">Wishlist</Typography>
      </Box>

      {wishlist && wishlist.length > 0 ? (
        wishlist.map((ticker, index) => (
          <Box key={index} sx={{ justifyContent: "space-between", border:"solid", borderColor: grey[900], borderWidth: "0.5px", p:1, minWidth: "90%",
            "&:hover": {
              backgroundColor: grey[900],
              cursor: "pointer"
            }}}
            onClick={() => handleSearch(ticker)}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb:1.5 }}>
              <Typography variant="body2" fontWeight="bold">{ticker}</Typography>
              <Typography
                sx={{ cursor: "pointer" }}
                onClick={() => removeFromWishlist(ticker)}
              >
                <RxCross2 />
              </Typography>
            </Box>
            {/* <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>price</Typography>
              <Typography>Analysis</Typography>
            </Box> */}
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