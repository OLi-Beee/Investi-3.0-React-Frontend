import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import Navbar from "../../components/Navbar";


const Features = () => {
    return (
        <Box backgroundColor="#000000" color="#FFFFFF" minHeight="100vh" padding={2}>
            <Navbar />
            <Typography variant="h3" gutterBottom sx={{ textAlign: "start", marginTop: 4 }}>
                App Features
            </Typography>
            <Typography variant="body1" sx={{ textAlign: "start", width: "100%", marginBottom: 4 }}>
                Welcome to Investi, your go-to research app for stock analysis. Our application leverages cutting-edge
                generative AI to provide detailed insights into whether a stock is bullish or bearish. Additionally, we
                provide key statistics to help you make informed investment decisions.
            </Typography>
            <List sx={{ width: "100%"}}>
                <ListItem>
                    <ListItemText
                        primary="AI-Powered Stock Analysis"
                        secondary="Our app uses generative AI to analyze market trends and provide predictions on whether a stock is bullish or bearish."
                        sx={{ "& .MuiTypography-body2": { color: "#FFFFFF" } }}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="Key Stock Statistics"
                        secondary="Access detailed statistics such as price-to-earnings ratio, market cap, dividend yield, and more."
                        sx={{ "& .MuiTypography-body2": { color: "#FFFFFF" } }}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="User-Friendly Interface"
                        secondary="Easily navigate through stock data and analysis with our intuitive and clean interface."
                        sx={{ "& .MuiTypography-body2": { color: "#FFFFFF" } }}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="Real-Time Updates"
                        secondary="Stay updated with real-time stock data and analysis to make timely investment decisions."
                        sx={{ "& .MuiTypography-body2": { color: "#FFFFFF" } }}
                    />
                </ListItem>
            </List>
        </Box>
    );
};

export default Features;