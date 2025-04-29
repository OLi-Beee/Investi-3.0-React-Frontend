"use client";

import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { FaChartLine } from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

const rapidKey = process.env.REACT_APP_RAPID_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isSignedIn = false; // temp boolean until you hook in auth
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {

      try {
        const response = await fetch(`${API_URL}/yf/stockdata?ticker=NVDA,AAPL,TSLA,GOOGL,VOO,SPY,NFLX,META`);        

        const result = await response.json();

        if (!response.ok) {
          console.log(response.status, response.statusText, result.message);
        }

        console.log(result)
        setStockData(result.data.body);
        console.log(response.status, response.statusText, result.message);

      } catch (error){
        console.log(error);
      }


    };
    fetchData();
  }, []);

  const toggleDrawer = (open) => () => {
    setMenuOpen(open);
  };

  return (
    <Box sx={{ minWidth: "100vw", minHeight: "100vh", backgroundColor: "black", color: "white" }}>
      {/* App Bar */}
      <Navbar />

      {/* Mobile Drawer Menu */}
      <Drawer anchor="right" open={menuOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, backgroundColor: "#1a1a1a", height: "100%" }}>
          <List>
            {["Features", "About Us", "Solutions", "Help", "Contact"].map((text, i) => (
              <ListItem button key={i}>
                <ListItemText primary={text} sx={{ color: "white" }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      {/* Hero Section */}
      <Container sx={{ textAlign: "center", mt: 8, maxWidth: "lg" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                backgroundColor: "#1e2939",
                px: 2,
                py: 1.5,
                borderRadius: "80px",
                minWidth: "16em",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  px: 2,
                  py: 0.5,
                  borderRadius: "40px",
                  fontSize: "11pt",
                  mr: 1,
                }}
              >
                New
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "11pt" }}>
                Join the best platform for AI stock analysis
              </Typography>
            </Box>
          </Box>
          <Typography variant="h2" component="h2" sx={{ fontWeight: "bold", mt: 3 }}>
            Grow your wealth with{" "}
            <span style={{ color: "#05df72" }}>real-time <br /> insights</span>
          </Typography>
          <Typography variant="body1" sx={{ color: "#aaa", mt: 2 }}>
            Track your investments, make informed decisions, and watch your portfolio thrive—all in one app.
          </Typography>
          {/* Get started button */}
         <Box sx={{ display: "flex", justifyContent: "center", m: "1em 0", }}>
          <Link to={isSignedIn ? "/dashboard" : "/signup"}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: "24px",
                padding: "12px 24px",
                backgroundColor: "white",
                color: "black",
                borderRadius: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Get Started <FiArrowRight style={{ marginLeft: "8px" }} />
            </motion.button>
          </Link>
         </Box>
        </motion.div>
      </Container>

      {/* Stock Cards Section */}
      <Container sx={{ mt: 10, mb: 10, maxWidth: "lg" }}>
        <Grid container spacing={3} justifyContent="center">
          {stockData ? stockData.map((stock, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card
                  sx={{
                    backgroundColor: "#030712",
                    textAlign: "center",
                    p: 1,
                    borderRadius: 2,
                    boxShadow: 3,
                    minWidth: "15em",
                    maxHeight: "7em"
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "white",  fontSize: "12pt" }}>
                      {stock.symbol}
                    </Typography>
                    <Typography variant="body2" color="gray" sx={{ fontSize: "9pt"}}>
                      {stock.shortName}
                    </Typography>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={2}>
                      <Typography variant="h6" color="white" sx={{ fontSize: "11pt" }}>
                        ${stock.regularMarketPrice.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: stock.regularMarketChange >= 0 ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {stock.regularMarketChange >= 0
                          ? `+${stock.regularMarketChange.toFixed(2)}`
                          : stock.regularMarketChange.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )): null}
        </Grid>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
