import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Box, Typography, TextField, Button, CircularProgress, Paper } from "@mui/material";
import { red, green, blue, lightBlue, cyan, teal, lightGreen, grey } from '@mui/material/colors';

export default function AIChat() {
  const [question, setQuestion] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiReponse, setAiResponse] = useState("");

  const sendQuestion = async (prompt) => {
    const url = "http://localhost:3001/openai/question";
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ prompt }), // Fixed
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(`Status ${response.status} ${response.statusText}: ${result.message}`);
      }
  
      console.log(response.status, response.statusText, result.data);
      setAiResponse(prev => prev + "\n" + result.data);
    } catch (error) {
      console.error("Error from OpenAI:", error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleAskAI = async () => {
    if (!question) return;
    console.log("question", question)
    setLoading(true);
    sendQuestion(question);
    setQuestion("");
  }

  const black = "#000000";

  return (
    <Box m={.5} sx={{borderRadius: 2, color: "white", background: black, minWidth: "80%" }}>
      <Box sx={{ minHeight: "23em", background: black,}} >
        
      </Box>
      <Box sx={{ minHeight: "20em", px:2, background: black}} >
        <Typography textOverflow="wrap">
          {aiReponse ? aiReponse : null }
        </Typography>
      </Box>
      {/* Input */}
      <Box display="flex" gap={1} alignItems="center">
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Ask AI about stock trends..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          InputProps={{
            style: {
              color: "white",
              backgroundColor: "#111827",
              borderRadius: 8,
            }
          }}
          InputLabelProps={{
            style: {
              color: "#aaa"
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleAskAI}
          disabled={loading}
          sx={{
            bgcolor: lightBlue[500] ,
            color: "black",
            px: 3,
            py: 2.5,
            borderRadius: 1,
            "&:hover": { bgcolor: "#facc15" }
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : <FaPaperPlane />}
        </Button>
      </Box>

      {/* Chart */}
      {chartData && (
        <Box sx={{ height: 300 }}>
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </Box>
      )}
    </Box>
  );
}
