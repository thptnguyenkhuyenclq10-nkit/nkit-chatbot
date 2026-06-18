const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "nkit_chatbot_2025";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Lưu lịch sử hội thoại theo từng người dùng (tối đa 5 cặp gần nhất)
const conversationHistory = {};
const MAX_HISTORY = 5;

// Đọc dữ liệu từ data.json và tạo SCHOOL_DATA
function loadSchoolData() {
  try {
    const raw = fs.readFileSync("./data.json", "utf8");
    const data = JSON.parse(raw);

    let prompt = `Bạn là trợ lý tư vấn tuyển sinh của ${data.truong.ten} (TP.HCM).\n`;
    prompt += `Địa chỉ: ${data.truong.dia_chi}\n`;
    prompt += `Website: ${data.truong.website}\n`;
    prompt += `Lưu ý: Thông tin dưới đây dựa trên dự kiến năm học 2026-2027. Khi có thông báo chính thức, hãy kiểm tra website hoặc fanpage trường.\n\n`;

    for (const cd of data.chu_de) {
      prompt += `== ${cd.tieu_de.toUpperCase()} ==\n${cd.noi_dung}\n\n`;
    }

    prompt += `== CÂU HỎI THƯỜNG GẶP ==\n`;
    for (const qa of data.qna) {
      prompt += `Hỏi: ${qa.cau_hoi}\nTrả lời: ${qa.tra_loi}\n\n`;
    }

    prompt += `== CÁCH TRẢ LỜI ==\n${data.cach_tra_loi}\n`;

    return prompt;
  } catch (e) {
    console.error("Lỗi đọc data.json:", e.message);
    return "Bạn là trợ lý tư vấn của THPT Nguyễn Khuyến. Hãy trả lời thân thiện bằng tiếng Việt.";
  }
}

// Tải dữ liệu lần đầu khi khởi động
let SCHOOL_DATA = loadSchoolData();
console.log("Đã tải dữ liệu từ data.json thành công!");

// Tự động reload data.json mỗi 10 phút (không cần restart server)
setInterval(() => {
  SCHOOL_DATA = loadSchoolData();
  console.log("Đã reload data.json:", new Date().toLocaleTimeString());
}, 10 * 60 * 1000);

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

        if (!conversationHistory[senderId]) {
          conversationHistory[senderId] = [];
        }

        conversationHistory[senderId].push({
          role: "user",
          content: userMsg
        });

        if (conversationHistory[senderId].length > MAX_HISTORY * 2) {
          conversationHistory[senderId] = conversationHistory[senderId].slice(-MAX_HISTORY * 2);
        }

        try {
          const aiRes = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: SCHOOL_DATA },
                ...conversationHistory[senderId]
              ]
            },
            {
              headers: {
                "Authorization": "Bearer " + GROQ_API_KEY,
                "Content-Type": "application/json"
              }
            }
          );

          const reply = aiRes.data.choices[0].message.content;

          conversationHistory[senderId].push({
            role: "assistant",
            content: reply
          });

          await axios.post(
            "https://graph.facebook.com/v19.0/me/messages?access_token=" + PAGE_ACCESS_TOKEN,
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
