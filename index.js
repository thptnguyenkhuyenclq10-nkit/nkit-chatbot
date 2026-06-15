const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "nkit_chatbot_2025";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SCHOOL_DATA = `Bạn là trợ lý tư vấn thông minh của trang NKIT - THPT Nguyễn Khuyến, Phường Hòa Hưng, TP.HCM.
Trang này là cộng đồng học Tin học và CNTT dành cho học sinh THPT Nguyễn Khuyến.
Website: https://nkit.nguyenkhuyenhcm.edu.vn
Hãy trả lời ngắn gọn, thân thiện, bằng tiếng Việt, phong cách Gen Z. Không quá 150 từ.
Nếu không biết, hướng học sinh vào website NKIT hoặc liên hệ giáo viên Tin học.`;

app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    for (const entry of body.entry) {
      const event = entry.messaging[0];
      if (event.message && event.message.text) {
        const senderId = event.sender.id;
        const userMsg = event.message.text;
        try {
          const aiRes = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama3-8b-8192",
              messages: [
                { role: "system", content: SCHOOL_DATA },
                { role: "user", content: userMsg }
              ]
            },
            {
              headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
              }
            }
          );
          const reply = aiRes.data.choices[0].message.content;
          await axios.post(
            `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            { recipient: { id: senderId }, message: { text: reply } }
          );
        } catch (e) {
          console.error(e.message);
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(3000, () => console.log("NKIT Chatbot running on

/* CODE NAY DUNG CHO API KEY CUA AI CLAUDE
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "nkit_chatbot_2025";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SCHOOL_DATA = `Bạn là trợ lý tư vấn thông minh của trang NKIT - THPT Nguyễn Khuyến, Phường Hòa Hưng, TP.HCM.
Trang này là cộng đồng học Tin học và CNTT dành cho học sinh THPT Nguyễn Khuyến.
Website: https://nkit.nguyenkhuyenhcm.edu.vn
Hãy trả lời ngắn gọn, thân thiện, bằng tiếng Việt, phong cách Gen Z. Không quá 150 từ.
Nếu không biết, hướng học sinh vào website NKIT hoặc liên hệ giáo viên Tin học.`;

app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    for (const entry of body.entry) {
      const event = entry.messaging[0];
      if (event.message && event.message.text) {
        const senderId = event.sender.id;
        const userMsg = event.message.text;
        try {
          const aiRes = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
              model: "claude-sonnet-4-6",
              max_tokens: 1000,
              system: SCHOOL_DATA,
              messages: [{ role: "user", content: userMsg }],
            },
            {
              headers: {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
              },
            }
          );
          const reply = aiRes.data.content[0].text;
          await axios.post(
            `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            { recipient: { id: senderId }, message: { text: reply } }
          );
        } catch (e) {
          console.error(e.message);
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(3000, () => console.log("NKIT Chatbot running on port 3000"));
*/
