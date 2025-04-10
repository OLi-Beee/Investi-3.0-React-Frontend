import { Box, Paper, Typography } from "@mui/material";
import { RxCross2 } from "react-icons/rx";
import { red, green, blue, lightBlue, cyan, teal, lightGreen, grey } from '@mui/material/colors';
const black = "#000000";
const white = "#ffffff";

const WishlistWIdget = ({ wishlist, removeFromWishlist, handleSearch }) => {
    return (
      <Paper 
        sx={{ 
          d: "flex", 
          flexDirection: "column", 
          gap: 0, 
          width: "19%", 
          p: 1, 
          minHeight: 340, 
          right: 0, 
          top: 10, 
          position: "fixed", 
          background: black, 
          color: white, 
  
        }}
      >
        <Box sx={{ border:"solid", borderColor: grey[900], borderWidth: ".1px", py:1, px:1, minWidth: "90%" }}>
          <Typography variant="body1" fontWeight="bold" textAlign="center">Wishlist</Typography>
        </Box>
  
        {wishlist && wishlist.length > 0 ? (
          wishlist.map((ticker, index) => (
            <Box key={ticker} sx={{ justifyContent: "space-between", border:"solid", borderColor: grey[900], borderWidth: "0.5px", p:1, minWidth: "90%",
              "&:hover": {
                backgroundColor: grey[900],
                cursor: "pointer"
              }}}
              onClick={() => handleSearch(ticker)}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb:1.5 }}>
                <Typography variant="body2" fontWeight="bold">{ticker}</Typography>
                <Typography
                  sx={{ cursor: "pointer" }}
                  onClick={() => removeFromWishlist(ticker)}
                >
                  <RxCross2 fontSize={14}/>
                </Typography>
              </Box>
              {/* <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>price</Typography>
                <Typography>Analysis</Typography>
              </Box> */}
            </Box>
          ))
        ) : (
          <Typography sx={{ mt: 2, textAlign: "center", color: "gray" }}>
            No stocks in wishlist.
          </Typography>
        )}
      </Paper>
    );
  };

  export default WishlistWIdget;