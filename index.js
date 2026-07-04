const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "nkit_chatbot_2025";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Lưu lịch sử hội thoại theo từng người dùng (tối đa 5 cặp gần nhất)
const conversationHistory = {};
const MAX_HISTORY = 5;

// ============================================================
// TÍNH NĂNG TRA CỨU STT NỘP HỒ SƠ THEO TÊN HỌC SINH
// Cần có file danh_sach_tra_cuu.json trong cùng repo GitHub
// ============================================================

let DANH_SACH_TRA_CUU = { trung_tuyen: [], tuyen_thang: [] };
function loadDanhSachTraCuu() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "danh_sach_tra_cuu.json"), "utf8");
    DANH_SACH_TRA_CUU = JSON.parse(raw);
    console.log(
      "Đã tải danh sách tra cứu STT thành công! Tổng:",
      DANH_SACH_TRA_CUU.trung_tuyen.length + DANH_SACH_TRA_CUU.tuyen_thang.length,
      "học sinh"
    );
  } catch (err) {
    console.error("Lỗi đọc danh_sach_tra_cuu.json:", err.message);
  }
}
loadDanhSachTraCuu();

// Chuẩn hóa tiếng Việt để so khớp không phân biệt hoa/thường, dấu cách thừa
function chuanHoa(str) {
  return str.normalize("NFC").trim().toUpperCase().replace(/\s+/g, " ");
}

// Tìm học sinh theo tên. Trả về mảng kết quả (có thể nhiều nếu trùng tên).
function timHocSinhTheoTen(tenCanTim) {
  const tenChuanHoa = chuanHoa(tenCanTim);
  const ketQua = [];

  for (const hs of DANH_SACH_TRA_CUU.trung_tuyen) {
    if (chuanHoa(hs.ho_ten) === tenChuanHoa) {
      ketQua.push({ ...hs, loai: "trung_tuyen" });
    }
  }
  for (const hs of DANH_SACH_TRA_CUU.tuyen_thang) {
    if (chuanHoa(hs.ho_ten) === tenChuanHoa) {
      ketQua.push({ ...hs, loai: "tuyen_thang" });
    }
  }
  return ketQua;
}

// Nhận diện ý định tra cứu STT dựa trên từ khóa (không đoán tên lỏng lẻo).
function coYDinhTraCuu(tinNhan) {
  const tuKhoa = [
    "số thứ tự",
    "stt",
    "tra cứu",
    "nộp hồ sơ lúc",
    "thứ tự nộp",
    "con tôi tên",
    "em tên",
    "con tên"
  ];
  const tinNhanLower = tinNhan.toLowerCase();
  return tuKhoa.some((tk) => tinNhanLower.includes(tk));
}

// Trích tên học sinh CHỈ khi đúng cú pháp: "tra cứu: TÊN HỌC SINH"
function trichTenDungCuPhap(tinNhan) {
  const match = tinNhan.match(/tra c[ứu]u\s*:\s*(.+)/i);
  if (match) return match[1].trim();
  return null;
}

const HUONG_DAN_CU_PHAP = `Để tra số thứ tự nộp hồ sơ, bạn nhắn đúng cú pháp sau nhé:\n"tra cứu: Họ và tên học sinh"\n\nVí dụ: tra cứu: Nguyễn Văn A`;

// Hàm xử lý chính: gọi hàm này TRƯỚC khi gọi Groq API.
// Nếu trả về khác null, gửi thẳng kết quả này cho người dùng, KHÔNG cần gọi AI.
function xuLyTraCuuSTT(tinNhanNguoiDung) {
  const ten = trichTenDungCuPhap(tinNhanNguoiDung);

  // Trường hợp 1: đúng cú pháp "tra cứu: TÊN" -> tra cứu bình thường
  if (ten) {
    const ketQua = timHocSinhTheoTen(ten);

    if (ketQua.length === 0) {
      return `Xin lỗi, mình không tìm thấy học sinh tên "${ten}" trong danh sách trúng tuyển/tuyển thẳng lớp 10 năm học 2026-2027. Bạn kiểm tra lại chính tả họ tên (có dấu đầy đủ) giúp mình nhé, hoặc liên hệ trực tiếp Phòng Học vụ - Lầu 1, Khu C để được hỗ trợ.`;
    }

    if (ketQua.length === 1) {
      const hs = ketQua[0];
      if (hs.loai === "tuyen_thang") {
        return `Em ${hs.ho_ten} (${hs.truong_cuoi_cap}) thuộc diện TUYỂN THẲNG, STT: ${hs.stt}. Diện tuyển thẳng có quy trình nộp hồ sơ riêng, phụ huynh vui lòng liên hệ trực tiếp trường để biết thời gian cụ thể nhé!`;
      }
      return `Em ${hs.ho_ten} (${hs.truong_cuoi_cap}) có STT: ${hs.stt}. Thời gian nộp hồ sơ: ${
        hs.thoi_gian_nop_ho_so || "chưa xác định, vui lòng liên hệ trường"
      }. Địa điểm: Phòng học Dãy A (từ 08-10/7) hoặc Phòng Học vụ - Lầu 1, Khu C (từ 13-15/7 nếu nộp trễ).`;
    }

    // Trùng tên - liệt kê để phụ huynh tự chọn theo trường THCS
    let phanHoi = `Mình tìm thấy ${ketQua.length} học sinh trùng tên "${ten}", bạn xem trường THCS nào đúng là con mình nhé:\n`;
    ketQua.forEach((hs, i) => {
      phanHoi += `${i + 1}. ${hs.ho_ten} - ${hs.truong_cuoi_cap} - STT: ${hs.stt}${
        hs.thoi_gian_nop_ho_so ? " - " + hs.thoi_gian_nop_ho_so : ""
      }\n`;
    });
    return phanHoi.trim();
  }

  // Trường hợp 2: có ý định tra cứu (dùng từ khóa liên quan) nhưng SAI cú pháp
  // -> hướng dẫn cách gõ đúng, không đoán tên, không gọi AI
  if (coYDinhTraCuu(tinNhanNguoiDung)) {
    return HUONG_DAN_CU_PHAP;
  }

  // Trường hợp 3: không liên quan gì đến tra cứu -> để AI xử lý bình thường
  return null;
}

// ============================================================
// PHẦN CHATBOT AI (GROQ) - GIỮ NGUYÊN NHƯ CŨ
// ============================================================

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

// Tự động reload data.json và danh_sach_tra_cuu.json mỗi 10 phút (không cần restart server)
setInterval(() => {
  SCHOOL_DATA = loadSchoolData();
  loadDanhSachTraCuu();
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

        // ----------------------------------------------------
        // BƯỚC 1: Ưu tiên kiểm tra tra cứu STT trước, không qua AI
        // ----------------------------------------------------
        const ketQuaTraCuu = xuLyTraCuuSTT(userMsg);
        if (ketQuaTraCuu) {
          try {
            await axios.post(
              "https://graph.facebook.com/v19.0/me/messages?access_token=" + PAGE_ACCESS_TOKEN,
              { recipient: { id: senderId }, message: { text: ketQuaTraCuu } }
            );
          } catch (e) {
            console.error("Lỗi gửi tin nhắn tra cứu STT:", e.message);
          }
          continue; // bỏ qua, không gọi AI cho tin nhắn này
        }

        // ----------------------------------------------------
        // BƯỚC 2: Nếu không phải câu hỏi tra cứu, xử lý qua Groq AI như cũ
        // ----------------------------------------------------
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
