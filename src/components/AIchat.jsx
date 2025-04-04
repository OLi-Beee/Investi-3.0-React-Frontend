import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper
} from "@mui/material";

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AIChat() {
  const [question, setQuestion] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!question) return;
    setLoading(true);

    // Simulated AI response
    setTimeout(() => {
      setChartData({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
          {
            label: "AI Prediction",
            data: [120, 130, 125, 140, 150, 160, 170],
            borderColor: "#facc15",
            backgroundColor: "rgba(250, 204, 21, 0.2)",
            tension: 0.4,
          },
        ],
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <Paper sx={{ bgcolor: "inherit", borderRadius: 2, color: "white" }}>
      {/* Input */}
      <Box display="flex" gap={1} alignItems="center" mb={0}>
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
            bgcolor: "#22c55e",
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
    </Paper>
  );
}
