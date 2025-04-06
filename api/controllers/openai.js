const OpenAI = require("openai");
require("dotenv").config();

const ORG_ID = process.env.REACT_APP_OPENAI_ORG_ID;
const PROJ_ID = process.env.REACT_APP_OPENAI_PROJECT_ID;
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: API_KEY,
  organization: ORG_ID,
  project: PROJ_ID,
});

const useGPT = async (req, res) => {
  const { prompt } = req.body;
  console.log(prompt)

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      fullResponse += chunk.choices[0]?.delta?.content || "";
    }

    res.status(200).json({ message: "success", data: fullResponse });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ message: "OpenAI error", error: error.message });
  }
};

module.exports = useGPT;
