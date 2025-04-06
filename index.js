// const OpenAI = require("openai");
// require("dotenv").config()

// const ORG_ID = process.env.REACT_APP_OPENAI_ORG_ID;
// const PROJ_ID = process.env.REACT_APP_OPENAI_PROJECT_ID;
// const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// const openai = new OpenAI({
//   apiKey: API_KEY,
//   organization: ORG_ID,
//   project: PROJ_ID,
// });

// const useGPT = async (req, res) => {
//     const { prompt } = req.body;
    
//     try {
//         const stream = await openai.chat.completions.create({
//             model: "gpt-4o-mini",
//             temperature: 0,
//             messages: [{ role: "user", content: "write a 100 words story about a developer" }],
//             store: true,
//             stream: true,
//         });
//         for await (const chunk of stream) {
//             const response = chunk.choices[0]?.delta?.content || "";
//             // process.stdout.write(response);
//             res.status(200).json({ message: "succus", data: response })
//         }

//     } catch(error) {
//         throw new Error(error);
//     }
// }