import { Box } from "@mui/material";
import AIChat from "../../../components/AIchat"
import DashboardSidebar from "../../../components/DashboardSidebar";

const ChatPage = () => {
    const black = "#000000"
    return (
        <Box sx={{ display: "flex", justifyContent: "start", alignItems: "end", maxHeight: "100vh", background: black}}>
            <DashboardSidebar />
            <AIChat />
        </Box>
    )
}

export default ChatPage;