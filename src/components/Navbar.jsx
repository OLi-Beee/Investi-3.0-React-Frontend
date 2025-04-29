import { AppBar, Box, Button, Drawer, IconButton, List, ListItem, ListItemText, Toolbar, Typography } from "@mui/material"
import { useState } from "react"
import { FaChartLine } from "react-icons/fa"
import { HiOutlineMenu } from "react-icons/hi"
import { Link } from "react-router-dom"


const Navbar = () => { 
      const [menuOpen, setMenuOpen] = useState(false);
      const toggleDrawer = (open) => () => {
        setMenuOpen(open);
      };
    
    return (
        <Box>
            {/* Navbar */}
            <AppBar position="static" sx={{ backgroundColor: "black" }}>
                <Toolbar
                sx={{
                    justifyContent: "space-between",
                    mx: "auto",
                    width: "98%",
                }}
                >
                {/* Logo */}
                <Box display="flex" alignItems="center" gap={1}>
                    <FaChartLine style={{ color: "#05df72", fontSize: "24px" }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Investi
                    </Typography>
                </Box>

                {/* Desktop Navigation */}
                <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
                    {["Features", "About-Us", "Solutions", "Help", "Contact"].map((item, i) => (
                    <Button key={i} color="inherit" component={Link} to={`/${item.replaceAll("-", "-").toLowerCase()}`}>
                        {item.replaceAll("-", " ")}
                    </Button>
                    ))}
                </Box>

                {/* Auth Buttons */}
                <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
                    <Button variant="outlined" color="inherit" component={Link} to="/signin">
                    Sign in
                    </Button>
                    <Button
                    variant="contained"
                    sx={{ backgroundColor: "white", color: "black" }}
                    component={Link}
                    to="/signup"
                    >
                    Sign up
                    </Button>
                </Box>

                {/* Mobile Menu Button */}
                <IconButton sx={{ display: { md: "none" }, color: "white" }} onClick={toggleDrawer(true)}>
                    <HiOutlineMenu />
                </IconButton>
                </Toolbar>
            </AppBar>

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
        </Box>
    )
}

export default Navbar;