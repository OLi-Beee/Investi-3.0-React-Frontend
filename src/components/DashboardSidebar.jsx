import { Box, Button, Typography } from "@mui/material";
import { FaRegCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

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
        // width: 200,
        backgroundColor: "black",
        px: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight="bold" sx={{ pb: 3, pt: 2, color: "#fff", "&:hover": { cursor: "pointer"} }} onClick={() => navigate("/dashboard")}>
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
