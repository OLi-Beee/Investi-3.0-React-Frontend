import { useEffect, useState } from "react";
import DashboardSidebar from "../../../components/DashboardSidebar";
import { Box, Divider, Link, Typography } from "@mui/material";
import { grey, lightBlue } from "@mui/material/colors";

const white = "#ffffff";
const black = "#000000";
const API_URL = process.env.REACT_APP_API_URL;


const News = () => {
    const [marketNews, setMarketNews] = useState([]);

    useEffect(() => {
        // ------------------ Get News ------------------
        const getNews = async () => {
            const url = `${API_URL}/tiingo/market-news`
            try {
                const response = await fetch(url);
                const result = await response.json();

                if (!response.ok) {
                    console.log(response.status, response.statusText, result.message);
                    return;
                }

                console.log(response.status, response.statusText, result.message, result);
                setMarketNews(result.data.slice(0, 100));

            } catch(error) {
                console.log(error);
            }
        }
        getNews();

    },[])

    return (
        <Box display="flex"  backgroundColor={black}>
            <DashboardSidebar />
            <Box mt={4}>
                <Box justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold" color="white" px={3} mb={2}>
                    Market News
                </Typography>
                <Divider color={white} />
                </Box>
            
                { marketNews && marketNews.map((news, index) => (
                    <Link key={news.id} href={news?.url} target="_blank" underline="none" color={white}>
                        <Box key={index} py={4} px={3} 
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
                    ))
                }
            </Box>
        </Box>
    )

}

export default News;