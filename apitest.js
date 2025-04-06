/// for testing you can write anything there

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

const useGPT = async () => {

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [{ role: "user", content: "write a 300 words story about a developer " }],
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      fullResponse += chunk.choices[0]?.delta?.content || "";
      process.stdout.write(chunk.choices[0]?.delta?.content || "");

    }

  } catch (error) {
    console.error("OpenAI error:", error);
  }
};

useGPT()