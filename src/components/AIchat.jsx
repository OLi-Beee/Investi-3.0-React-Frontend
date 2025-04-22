import { useEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { lightBlue, grey } from '@mui/material/colors';
import OpenAI from "openai";

export default function AIChat() {
  const [question, setQuestion] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiReponse, setAiResponse] = useState(""); // Streaming response
  const [messages, setMessages] = useState([]); // Full chat history

  const messagesEndRef = useRef(null);

  const ORG_ID = process.env.REACT_APP_OPENAI_ORG_ID;
  const PROJ_ID = process.env.REACT_APP_OPENAI_PROJECT_ID;
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const client = new OpenAI({
    apiKey: API_KEY,
    organization: ORG_ID,
    project: PROJ_ID,
    dangerouslyAllowBrowser: true
  });

  const sendQue = async (prompt) => {
    setLoading(true);
    setAiResponse("");

    const newUserMessage = { role: "user", content: prompt };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      const stream = await client.chat.completions.create({
        model: "gpt-4o",
        messages: updatedMessages,
        stream: true,
      });

      let assistantReply = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          assistantReply += content;
          setAiResponse((prev) => prev + content);
        }
      }

      // Finalize assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: assistantReply }]);
    } catch (error) {
      console.error("Streaming error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async () => {
    if (!question.trim()) return;
    const prompt = question;
    setQuestion("");
    sendQue(prompt);
  };

  const black = "#000000";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiReponse]);

  return (
    <Box m={0.5} sx={{ borderRadius: 2, color: "white", background: black, minWidth: "80%" }}>
      {/* Messages Display */}
      <Box sx={{ minHeight: "40em", maxHeight: "40em", overflowY: "scroll", maxWidth: "90%", px: 2, py: 2, background: black }}>
        {messages.map((msg, i) => (
          <Typography key={i} sx={{ whiteSpace: "pre-wrap", color: msg.role === "user" ? lightBlue[300] : grey[300], mb: 1 }}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
          </Typography>
        ))}
        {loading && (
          <Typography sx={{ whiteSpace: "pre-wrap", color: grey[500] }}>
            <strong>AI:</strong> {aiReponse}
          </Typography>
        )}
        <div ref={messagesEndRef} />
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
            bgcolor: lightBlue[500],
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



