import { Box, Typography } from "@mui/material";

const PublicFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 16,
        py: 3,
        textAlign: "center",
        backgroundColor: "#000000",
      }}
    >
      <Typography variant="body2" color="gray">
        &copy; {new Date().getFullYear()} Investi. All rights reserved.
      </Typography>
    </Box>
  );
};

export default PublicFooter;
