const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimit = require('express-rate-limit');
require("dotenv").config();
 
const app = express();
app.use(cors());
app.use(express.json());
 
const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const limiter = rateLimit({
  windowMs:7*24*60*60*1000,
  max:5,
  message:{
    error:'You have all 5 allowed requests.Please try angain after 7 days.',
    status:429,
  }
})

app.use("/generate",limiter);
 
app.post("/generate", async (req, res) => {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(req.body.prompt);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error("Error during API call:", error);
    res.status(500).json({ error: "An error occurred.",status:500 });
  }
});
 
const port = 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
 
 
