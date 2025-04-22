import { Box, Button, Typography } from "@mui/material";
import { FaRegCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { blueGrey, grey, lightBlue } from "@mui/material/colors";

function DashboardSidebar() {
  const navigate = useNavigate();

   // ------------------ Sign Out ------------------
   const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Box
      sx={{
        minWidth: "10.43em",
        borderRight: `solid 1px ${grey[900]}`,
        backgroundColor: "#000",
        px: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ position: "fixed" }}>
        <Typography variant="h5" fontWeight="bold" sx={{ pb: 3, pl:1,  pt: 2, color: lightBlue[400], "&:hover": { cursor: "pointer"} }} onClick={() => navigate("/dashboard")}>
          Investi
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            onClick={() => navigate("/dashboard/chat")}
            sx={{ justifyContent: "flex-start", color: "#cbd5e1" }}
          >
            Chat
          </Button>
          <Button
            onClick={() => navigate("/dashboard/news")}
            sx={{ justifyContent: "flex-start", color: "#cbd5e1" }}
          >
            News
          </Button>
          <Button sx={{ justifyContent: "flex-start", color: "#cbd5e1" }}>
            Settings
          </Button>
        </Box>

        <Button
          variant="text"
          color="error"
          onClick={handleSignOut}
          sx={{
            mt: 4,
            justifyContent: "flex-start",
            color: "#ef4444",
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardSidebar;
