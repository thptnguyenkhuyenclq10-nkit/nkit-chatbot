const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "nkit_chatbot_2025";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SCHOOL_DATA = `
Bạn là trợ lý tư vấn tuyển sinh của THPT Nguyễn Khuyến (TP.HCM).
Trường ở tại: 50 Thành Thái, Phường 12, Quận 10, TP.HCM.
Website: https://thptnguyenkhuyen.hcm.edu.vn
Lưu ý: Thông tin dưới đây dựa trên dự kiến năm học 2026-2027.
Khi có thông báo chính thức, hãy kiểm tra website hoặc fanpage trường.

== XÁC NHẬN TRÚNG TUYỂN (QUAN TRỌNG) ==
- Học sinh phải xác nhận nộp hồ sơ trực tuyến tại: http://ts10.hcm.edu.vn
  vào mục "Tra cứu kết quả thi tuyển sinh 10" rồi đăng nhập.
- Thời hạn dự kiến: từ 18h00 ngày 26/6/2026 đến 16h00 ngày 01/7/2026.
- NẾU KHÔNG XÁC NHẬN đúng hạn = TỪ CHỐI quyền trúng tuyển!

== LỊCH NHẬP HỌC LỚP 10 (DỰ KIẾN 2026-2027) ==
- Bước 1 (03/7/2026, từ 7h30): Xem danh sách trúng tuyển và mua hồ sơ tại Sảnh khu C.
- Bước 2 (04/7/2026 chiều): Tư vấn chọn môn tại các phòng học Khu A.
  + Ca 1: 13h30-14h30 (số thứ tự 01-315)
  + Ca 2: 15h00-16h00 (số thứ tự 316-645 + diện tuyển thẳng)
- Bước 3 (05/7/2026 từ 7h00): Tư vấn chọn nhóm môn cho phụ huynh & học sinh tại sân trường
  (50 Thành Thái, P.12, Q.10).
- Bước 4 (03-07/7/2026): Mua hồ sơ nhập học tại trường.
  + Sáng: 7h30 - 11h00
  + Chiều: 13h00 - 16h00
- Bước 5 (05-09/7/2026): Khai thông tin bắt buộc theo link QR trong thông báo của trường.
Lưu ý: Học sinh chỉ đăng ký môn SAU khi nghe tư vấn.
Nộp hồ sơ trực tiếp theo hướng dẫn trong bộ Hồ sơ tuyển sinh.

== CHỈ TIÊU & MÔN HỌC ==
Chỉ tiêu dự kiến năm học 2026-2027: 675 học sinh.
Môn bắt buộc: Ngữ Văn, Toán, Lịch Sử, Tiếng Anh, GDQP&AN, GDTC, HĐTN&HN, GDKP.
Có 6 nhóm môn lựa chọn (học sinh chọn 1 nhóm phù hợp năng lực & định hướng nghề):
- Nhóm 1: Lý - Hóa - Sinh - Tin | Chuyên đề: Toán - Lý - Hóa
- Nhóm 2: Lý - Hóa - Địa - Tin | Chuyên đề: Toán - Lý - Hóa
- Nhóm 3: Hóa - Sinh - Tin - Công nghệ (trồng trọt) | Chuyên đề: Toán - Hóa - Sinh
- Nhóm 4: Lý - GDKTThPL - Tin - Công nghệ (cơ khí) | Chuyên đề: Toán - Lý - Tin
- Nhóm 5: Địa - GDKTThPL - Tin - Công nghệ (trồng trọt) | Chuyên đề: Văn - Sử - Địa
- Nhóm 6: Hóa - Địa - GDKTThPL - Tin | Chuyên đề: Toán - Hóa - Địa

== CHƯƠNG TRÌNH NHÀ TRƯỜNG ==
Ngoài chương trình GDPT 2018, trường còn tổ chức:
IELTS, STEM, Tiếng Trung, Kỹ năng sống,
Âm nhạc (thanh nhạc / guitar / organ / trống), Mỹ thuật, Nhảy hiện đại.

== CLB & HOẠT ĐỘNG NGOẠI KHÓA ==
Thể thao: Bóng Đá, Bóng Chuyền, Cầu Lông (có đội tuyển thi đấu thành phố).
Văn nghệ & sáng tạo: UP NK's Media Club (truyền thông), CLB Win (nhiếp ảnh),
CLB WOW (âm nhạc), CLB NAC (hội họa).
Đoàn - Hội: Hội trại, Ngày hội CNTT, Halloween's Night, hoạt động theo tổ bộ môn.
Trường còn có: chương trình trao đổi học sinh, hội trại trưởng thành 18 tại Đà Lạt.

== CƠ SỞ VẬT CHẤT ==
- Phòng máy tính, phòng lab chuyên dụng, thư viện điện tử.
- Wifi toàn trường dành cho học sinh.
- Sân thể thao (bóng đá, bóng chuyền, cầu lông).
- Căn tin bán trú: suất ăn đảm bảo chất lượng và dinh dưỡng.
- Bãi giữ xe cho học sinh.

== BÁN TRÚ ==
Trường có căn tin bán trú với nhiều món ăn đa dạng, hợp khẩu vị, giá cả phù hợp học sinh.
Suất ăn được chuẩn bị kỹ lưỡng, đảm bảo chất lượng và dinh dưỡng.

== THÔNG TIN LIÊN HỆ ==
Địa chỉ: 50 Thành Thái, Phường 12, Quận 10, TP.HCM.
Website: https://thptnguyenkhuyen.hcm.edu.vn
Fanpage: THPT Nguyễn Khuyến (chính thức của trường).
Fanpage bộ môn Tin học: NKIT - THPT Nguyễn Khuyến, Phường Hòa Hưng.

== CÁCH TRẢ LỜI ==
- Luôn trả lời bằng tiếng Việt có dấu, thân thiện, ngắn gọn, phong cách Gen Z, không quá 150 từ.
- TUYỆT ĐỐI KHÔNG nói "trong văn bản bạn cung cấp" hay "thông tin này không được đề cập" — nghe rất máy móc!
- Nếu được hỏi về cảm xúc, áp lực, bạn bè, môi trường học... hãy trả lời tích cực, đồng cảm như một người bạn thật sự. Ví dụ: hỏi "có áp lực không?" → trả lời rằng học ở đâu cũng có áp lực nhưng ở Nguyễn Khuyến có thầy cô nhiệt tình, bạn bè thân thiện, nhiều CLB và hoạt động vui để cân bằng, rất xứng đáng!
- Nếu thực sự không có thông tin, hãy nói tự nhiên: "Cái này mình chưa có thông tin chính xác nha! Bạn liên hệ trực tiếp với trường hoặc theo dõi website/fanpage để cập nhật sớm nhất nhé 😊"
- Thông tin lịch nhập học là DỰ KIẾN dựa theo năm trước, nhắc nhở học sinh/phụ huynh theo dõi thông báo chính thức của trường.
`;
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
              model: "llama-3.1-8b-instant",
              messages: [
                { role: "system", content: SCHOOL_DATA },
                { role: "user", content: userMsg }
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
