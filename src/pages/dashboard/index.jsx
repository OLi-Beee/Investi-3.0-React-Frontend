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

// Register chart.js modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DashboardPage() {

  // ------------------ State ------------------
  const [stock, setStock] = useState("");
  const [stockData, setStockData] = useState([]);
  const [stockMetaData, setStockMetaData] = useState([]);
  const [isBullish, setIsBullish] = useState(true);
  const [companyMetadata, setCompanyMetadata] = useState([]);
  const [stockNews, setStockNews] = useState([]);

  // ------------------ Config ------------------
  const navigate = useNavigate();
  const tiingoToken = process.env.REACT_APP_TIINGO_API_KEY;
  const rapidKey = process.env.REACT_APP_RAPID_API_KEY;

  // ------------------ Search ------------------
  const handleSearch = async () => {
    if (!stock) return;

    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 360);
    const startDate = pastDate.toISOString().split("T")[0];

    //write save last searched stock
    try {
      await set(ref(database, "lastSearch"), {
        ticker: stock
      });
      console.log("last searched stock saved to firebase real time db");
    } catch(error) {
      throw new Error(error);
    }

    // Fetch metadata and stock data
    getCompanyMetadata(stock, tiingoToken);
    getStockData(stock, rapidKey);
    getNews(stock, undefined, tiingoToken)

    setStock("");
  };

  // ------------------ Automatically search stock if a ticker found in firebase db ------------------
  useEffect(() => {
    const fetchLastSearch = async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `lastSearch/ticker`));
  
        if (snapshot.exists()) {
          const ticker = snapshot.val();
          getStockData(ticker, rapidKey);
          getNews(ticker, undefined, tiingoToken);
          getCompanyMetadata(ticker, tiingoToken);
          console.log("Data:", ticker);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error getting data:", error);
      }
    };
  
    fetchLastSearch();
  }, []);  

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
      console.log("Company metadata:", result);

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
      throw new Error(error);
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

      console.log("News =>",result.data);
      console.log(response.status, response.statusText, result.message);
      setStockNews(result.data);

    } catch (error) {
      throw new Error(error);
    }
  }


  // ------------------ Color Variables ------------------
  const darkGray = "#0f172a";
  const white = "#ffffff";
  const gray = "#1e293b";
  const black = "#000000"

  // ------------------ JSX ------------------
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: black, p: 0.5, color: "white" }}>

      {/* Sidebar */}
     <DashboardSidebar />

      {/* Main Content */}
      <Box sx={{ flex: 1, px: 0.5, background: black }}>

        {/* Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
          <TextField
            fullWidth
            placeholder="Search for a stock (e.g., TSLA, AAPL)"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
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
            onClick={handleSearch}
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
              <Paper sx={{ p: 3, backgroundColor: black, minHeight: "26em", borderRadius: 0 }}>
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
    </Box>
  );
}
