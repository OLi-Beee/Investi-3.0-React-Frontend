import { AppBar, Box, Button, Drawer, IconButton, List, ListItem, ListItemText, Toolbar, Typography, Divider } from "@mui/material"
import { useState, useRef, useEffect } from "react"
import { FaChartLine, FaUserPlus, FaSignInAlt } from "react-icons/fa"
import { HiOutlineMenu } from "react-icons/hi"
import { Link } from "react-router-dom"
import { green, teal, grey } from '@mui/material/colors';

// Constants for colors matching home page
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const Navbar = () => { 
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  
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
    <Box>
      {/* Navbar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: darkGradient,
          borderBottom: `1px solid ${grey[900]}`,
          zIndex: 10,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            mx: "auto",
            width: "98%",
          }}
        >
          {/* Logo - Make it clickable to home page */}
          <Box 
            component={Link} 
            to="/"
            display="flex" 
            alignItems="center" 
            gap={1}
            sx={{ textDecoration: 'none' }}
          >
            <FaChartLine style={{ color: teal[400], fontSize: "24px" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: white }}>
              Investi
            </Typography>
          </Box>

          {/* Empty space where navigation used to be */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Auth Buttons */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/signin"
              startIcon={<FaSignInAlt />}
              sx={{
                color: grey[100],
                borderColor: green[900],
                borderRadius: '10px',
                textTransform: 'none',
                '&:hover': {
                  borderColor: green[700],
                  backgroundColor: 'rgba(0, 128, 0, 0.1)',
                },
                position: 'relative',
                zIndex: 20
              }}
            >
              Sign in
            </Button>
            <Button
              variant="contained"
              component={Link}
              to="/signup"
              startIcon={<FaUserPlus />}
              sx={{ 
                backgroundColor: green[700],
                color: white,
                borderRadius: '10px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: green[600],
                },
                position: 'relative',
                zIndex: 20
              }}
            >
              Sign up
            </Button>
          </Box>

          {/* Mobile Menu Button - Now only for auth options */}
          <IconButton 
            sx={{ 
              display: { md: "none" }, 
              color: teal[400],
              '&:hover': {
                backgroundColor: 'rgba(0, 128, 128, 0.1)',
              },
              position: 'relative',
              zIndex: 20
            }} 
            onClick={toggleDrawer(true)}
          >
            <HiOutlineMenu />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu - Now only shows auth buttons */}
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
          
          {/* Mobile Auth Buttons */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Button
              component={Link}
              to="/signin"
              variant="outlined"
              startIcon={<FaSignInAlt />}
              fullWidth
              onClick={toggleDrawer(false)} // Close drawer when clicked
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
              onClick={toggleDrawer(false)} // Close drawer when clicked
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
    </Box>
  )
}

export default Navbar;