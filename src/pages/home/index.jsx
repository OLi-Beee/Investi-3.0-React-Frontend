"use client";

import { useState, useEffect, useRef } from "react";
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
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import { FaChartLine, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { green, teal, grey, red } from '@mui/material/colors';

const rapidKey = process.env.REACT_APP_RAPID_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const cardBg = 'rgba(20, 30, 20, 0.4)';
const white = "#ffffff";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isSignedIn = false; // temp boolean until you hook in auth
  const [stockData, setStockData] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/yf/stockdata?ticker=NVDA,AAPL,TSLA,GOOGL,VOO,SPY,NFLX,META`);        
        const result = await response.json();

        if (!response.ok) {
          console.log(response.status, response.statusText, result.message);
        }

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

  // Handle clicks outside the drawer to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Box sx={{ 
      minWidth: "100vw", 
      minHeight: "100vh", 
      backgroundColor: darkBg, // #0d0d0d - very dark
      color: white,
      background: darkGradient // Linear gradient from dark to darker
    }}>
      {/* App Bar */}
      <Navbar />

      {/* Mobile Drawer Menu */}
      <Drawer 
        anchor="right" 
        open={menuOpen} 
        onClose={toggleDrawer(false)}
      >
        <Box 
          ref={drawerRef}
          sx={{ 
            width: 250, 
            background: darkGradient, 
            height: "100%",
            borderLeft: `1px solid ${grey[900]}`,
            position: 'relative',
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
          }}
        >
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FaChartLine style={{ color: teal[400] }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: teal[300] }}>
              Investi
            </Typography>
          </Box>
          
          <Divider sx={{ bgcolor: green[900], opacity: 0.5 }} />
          
          <List>
            {["Features", "About Us", "Solutions", "Help", "Contact"].map((text, i) => (
              <ListItem button key={i} sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(0, 128, 0, 0.1)',
                }
              }}>
                <ListItemText 
                  primary={text} 
                  sx={{ 
                    color: grey[300],
                    '.MuiListItemText-primary': {
                      fontSize: '0.95rem'
                    }
                  }} 
                />
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ bgcolor: green[900], opacity: 0.5, mt: 2 }} />
          
          {/* Mobile Auth Buttons */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Button
              component={Link}
              to="/signin"
              variant="outlined"
              startIcon={<FaSignInAlt />}
              fullWidth
              sx={{
                color: grey[100],
                borderColor: green[900],
                borderRadius: '10px',
                textTransform: 'none',
                py: 1,
                '&:hover': {
                  borderColor: green[700],
                  backgroundColor: 'rgba(0, 128, 0, 0.1)',
                }
              }}
            >
              Sign In
            </Button>
            
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              startIcon={<FaUserPlus />}
              fullWidth
              sx={{
                backgroundColor: green[700],
                color: white,
                borderRadius: '10px',
                textTransform: 'none',
                py: 1,
                '&:hover': {
                  backgroundColor: green[600],
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Container sx={{ 
        textAlign: "center", 
        mt: isMobile ? 5 : 8, 
        maxWidth: "lg",
        position: "relative",
        zIndex: 1,
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          left: "10%",
          right: "10%",
          height: "300px",
          background: `radial-gradient(circle, ${teal[900]}22 0%, transparent 70%)`,
          filter: "blur(40px)",
          zIndex: -1,
        }
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                backgroundColor: 'rgba(20, 30, 20, 0.5)',
                px: 2,
                py: 1.5,
                borderRadius: "80px",
                minWidth: isMobile ? "80%" : "16em",
                border: `1px solid ${grey[900]}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: teal[700],
                  color: white,
                  px: 2,
                  py: 0.5,
                  borderRadius: "40px",
                  fontSize: { xs: "10pt", sm: "11pt" },
                  mr: 1,
                }}
              >
                New
              </Typography>
              <Typography variant="body2" sx={{ 
                fontSize: { xs: "10pt", sm: "11pt" },
                color: grey[300]
              }}>
                Join the best platform for AI stock analysis
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            component="h2" 
            sx={{ 
              fontWeight: "bold", 
              mt: 3,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Grow your wealth with{" "}
            <span style={{ color: green[400] }}>real-time <br /> insights</span>
          </Typography>
          <Typography variant="body1" sx={{ 
            color: grey[400], 
            mt: 2,
            mx: 'auto',
            maxWidth: '600px',
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            Track your investments, make informed decisions, and watch your portfolio thrive—all in one app.
          </Typography>
          
          {/* Get started button */}
          <Box sx={{ display: "flex", justifyContent: "center", m: "1em 0" }}>
            <Link to={isSignedIn ? "/dashboard" : "/signup"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  marginTop: "24px",
                  padding: isMobile ? "10px 20px" : "12px 24px",
                  backgroundColor: green[600],
                  color: "white",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                  border: "none",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                Get Started <FiArrowRight style={{ marginLeft: "8px" }} />
              </motion.button>
            </Link>
          </Box>
        </motion.div>
      </Container>

      {/* Stock Cards Section */}
      <Container sx={{ mt: isMobile ? 6 : 10, mb: isMobile ? 6 : 10, maxWidth: "lg" }}>
        <Grid container spacing={2} justifyContent="center">
          {stockData ? stockData.map((stock, index) => (
            <Grid item key={index} xs={6} sm={6} md={4} lg={3}>
              <motion.div whileHover={{ scale: 1.03 }}>
                <Card
                  sx={{
                    backgroundColor: cardBg,
                    textAlign: "center",
                    p: 1,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: `1px solid ${green[900]}`,
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 8px 25px rgba(0,100,0,0.2)`,
                      borderColor: green[800],
                      background: 'rgba(20, 35, 20, 0.5)', // Slightly lighter on hover
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ 
                      fontWeight: "bold", 
                      color: white,
                      fontSize: { xs: "11pt", sm: "12pt" }
                    }}>
                      {stock.symbol}
                    </Typography>
                    <Typography variant="body2" color={grey[400]} sx={{ 
                      fontSize: { xs: "8pt", sm: "9pt" },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}>
                      {stock.shortName}
                    </Typography>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={1.5}>
                      <Typography variant="h6" color={white} sx={{ 
                        fontSize: { xs: "10pt", sm: "11pt" }
                      }}>
                        ${stock.regularMarketPrice.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: stock.regularMarketChange >= 0 ? green[400] : red[400],
                          fontWeight: "bold",
                          fontSize: { xs: "8pt", sm: "9pt" }
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
      <Box 
        component="footer"
        sx={{ 
          borderTop: `1px solid ${grey[900]}`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '1px',
            background: `linear-gradient(to right, transparent, ${green[900]}, transparent)`,
            opacity: 0.6,
          },
          background: 'rgba(10, 15, 10, 0.8)', // Slightly darker than the main background
          py: 4,
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
}
