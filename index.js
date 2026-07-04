
/
Claude finished the response
DS_HS_TUYEN_THANG_LOP_10_2026-2027_RUTGON.pdf
pdf

DS_TRUNG_TUYEN_LOP_10_2026-2027_RUTGON.pdf
pdf

Danh sách học sinh là do nhà trường yêu cầu phụ huynh cần biết số thứ tự tương ứng với tên của mình để biết được thời gian nộp hồ sơ tương ứng. Nếu không thể đưa thông tin ngày sinh của thí sinh tôi có file rút gọn này


Architected efficient lookup system bypassing AI hallucination risks
Architected efficient lookup system bypassing AI hallucination risks
Hiểu rồi — danh sách rút gọn (chỉ Họ tên + Trường, không có ngày sinh/nơi sinh) để phụ huynh tra STT của con mình là mục đích hợp lý và trường vốn đã công bố công khai. Mình sẽ giúp bạn xây tính năng tra cứu này.

Lưu ý về cách làm: Với 828 học sinh, nếu để AI (Groq) tự đọc và trả lời tên từng em sẽ vừa chậm, tốn API, vừa dễ trả sai/nhầm tên (AI có thể "đoán" nhầm học sinh). Cách đúng là làm một hàm tra cứu chính xác bằng code (so khớp tên) trong index.js, không qua AI — đảm bảo trả đúng 100%.

Mình sẽ:

Parse 2 danh sách thành file dữ liệu JSON (STT + tên + trường)
Gắn thêm khung giờ nộp hồ sơ tương ứng với từng STT (theo lịch đã có)
Viết sẵn đoạn code hàm tra cứu để bạn dán vào index.js

Opted để lưu tài liệu vào file thay vì dùng bash
Opted để lưu tài liệu vào file thay vì dùng bash
Giờ mình viết script để parse thành JSON có gắn khung giờ nộp hồ sơ:


Created a file, ran a command
Created a file, ran a command
Parse thành công cả 828 + 15 học sinh. Kiểm tra vài trường hợp trùng tên để đảm bảo tra cứu chính xác:


Phát hiện trùng lặp dữ liệu, chuẩn bị mã tìm kiếm
Phát hiện trùng lặp dữ liệu, chuẩn bị mã tìm kiếm
Có 16 tên bị trùng (2 học sinh cùng tên) — quan trọng để hàm tra cứu phải phân biệt bằng tên trường THCS đi kèm, không chỉ dựa vào tên.


Copy ra outputs và kiểm tra kích thước
Copy ra outputs và kiểm tra kích thước
Giờ mình viết đoạn code Node.js hàm tra cứu để bạn tích hợp vào index.js:


Created a file, ran a command, read a file
Created a file, ran a command, read a file
Đã xong 2 file
1. danh_sach_tra_cuu.json — 828 học sinh trúng tuyển + 15 tuyển thẳng, mỗi em có: stt, ho_ten, truong_cuoi_cap, và khung giờ nộp hồ sơ đã tự động gắn sẵn theo lịch STT (VD: STT 45 → "07/7/2026, buổi Chiều 13h30-15h00").

2. tra_cuu_stt_snippet.js — hàm tra cứu bằng code (không qua AI) để đảm bảo trả đúng 100%, có xử lý:

Chuẩn hóa tiếng Việt (không phân biệt hoa/thường, dấu cách thừa)
⚠️ Xử lý 16 cặp tên trùng nhau — nếu trùng, chatbot sẽ liệt kê kèm tên trường THCS để phụ huynh tự chọn đúng con mình
Diện tuyển thẳng (TT01-TT15) không có khung giờ cụ thể trong lịch đã công bố → chatbot sẽ báo phụ huynh liên hệ trực tiếp trường
Cách tích hợp vào GitHub
Upload danh_sach_tra_cuu.json vào repo nkit-chatbot (cùng cấp với data.json)
Mở index.js, dán nội dung tra_cuu_stt_snippet.js vào đầu file
Tìm đoạn code nơi bot nhận tin nhắn (event.message.text hay tương tự), thêm đoạn gọi xuLyTraCuuSTT() trước khi gọi Groq API — theo hướng dẫn ở cuối file snippet
Commit → đợi Render reload
Cú pháp phụ huynh dùng để tra cứu: tra cứu: NGUYỄN VĂN A (bot sẽ nhận diện và trả lời trực tiếp bằng code, không tốn API AI).

Vì mình không có sẵn index.js hiện tại của bạn để chỉnh trực tiếp, nếu bạn upload file đó lên, mình sẽ tích hợp sẵn và trả bạn bản hoàn chỉnh luôn thay vì phải tự dán.


Danh sach tra cuu
Code · JSON 

Tra cuu stt snippet
JS 
Tôi không biết thêm đoạn này 
// ============================================================
// CÁCH GẮN VÀO LUỒNG XỬ LÝ TIN NHẮN (ví dụ minh họa):
//
// app.post('/webhook', async (req, res) => {
//   ...
//   const tinNhan = event.message.text;
//
//   // Ưu tiên tra cứu STT trước, không qua AI để đảm bảo chính xác 100%
//   const ketQuaTraCuu = xuLyTraCuuSTT(tinNhan);
//   if (ketQuaTraCuu) {
//     await guiTinNhan(senderId, ketQuaTraCuu);
//     return;
//   }
//
//   // Nếu không phải câu hỏi tra cứu, xử lý bình thường qua Groq AI như cũ
//   ...
// });
// ============================================================

Show more

Xác định cần xem file index.js thực tế để tích hợp
Xác định cần xem file index.js thực tế để tích hợp
Hiểu rồi — đoạn đó chỉ là ví dụ minh họa, không phải code để copy y nguyên, vì mình không biết chính xác index.js hiện tại của bạn đặt tên hàm gửi tin nhắn là gì, webhook xử lý ra sao.

Cách dễ nhất: bạn upload file index.js hiện tại lên đây, mình sẽ:

Đọc code thật của bạn
Tự tay chèn đoạn tra cứu STT vào đúng chỗ
Trả lại bạn file index.js hoàn chỉnh, chỉ cần copy đè lên GitHub là xong — không cần bạn tự ghép code nữa
Bạn có thể lấy file này bằng cách:

Vào GitHub → repo nkit-chatbot → mở file index.js → nhấn nút "Raw" hoặc icon tải xuống → lưu về máy → upload lại đây
Bạn upload lên nhé, mình xử lý phần còn lại cho bạn.


// ============================================================ // TÍNH NĂNG TRA CỨU STT NỘP HỒ SƠ THEO TÊN HỌC SINH // Dán đoạn này vào index.js, phía trên phần xử lý tin nhắn Messenger // Yêu cầu: thêm file danh_sach_tra_cuu.json vào cùng repo GitHub // ============================================

pasted

Đây là code file index.js


Thinking about analyzing an index.js file's code structure and functionality
Thinking about analyzing an index.js file's code structure and functionality
Rõ rồi, mình đã đọc file index.js thật của bạn. Giờ mình sẽ chèn tính năng tra cứu STT vào đúng chỗ và trả bạn file hoàn chỉnh.


Ran 2 commands, created a file
Ran 2 commands, created a file
Cú pháp hợp lệ. Kiểm tra nhanh logic tra cứu hoạt động đúng trước khi giao cho bạn:


Xác định và loại bỏ import không cần thiết
Xác định và loại bỏ import không cần thiết
Tất cả 5 tình huống test đều chạy đúng — kết quả 1 người, trùng tên, không tìm thấy, tin nhắn thường (bỏ qua tra cứu), và diện tuyển thẳng đều chính xác.


Ran a command, read a file
Ran a command, read a file
Đã xong — file index.js hoàn chỉnh, đã test kỹ
Mình đã chèn tính năng tra cứu STT vào đúng chỗ trong code thật của bạn, và test thử 5 tình huống:

Tình huống	Kết quả
Tra 1 tên duy nhất	✅ Trả đúng STT + giờ nộp hồ sơ
Tra tên bị trùng (2 em)	✅ Liệt kê cả 2 kèm tên trường để phân biệt
Tra tên không có	✅ Báo không tìm thấy, hướng dẫn liên hệ trường
Tin nhắn hỏi bình thường	✅ Bỏ qua, để AI Groq xử lý như cũ
Tra học sinh diện tuyển thẳng	✅ Báo đúng diện TT, hướng dẫn liên hệ trường
Việc bạn cần làm
Upload 2 file này lên GitHub repo nkit-chatbot:
index.js (đè lên file cũ)
danh_sach_tra_cuu.json (file mới, đã gửi ở lượt trước — nếu bạn chưa upload thì tải lại từ tin nhắn trước)
Commit changes → Render tự động deploy lại
Test bằng cách nhắn cho Fanpage: tra cứu: Đặng Trần Minh An
Lưu ý về cú pháp: để tránh AI đoán nhầm ý định phụ huynh, bot chỉ nhận diện tra cứu khi tin nhắn có dạng tra cứu: TÊN HỌC SINH. Bạn nên đăng thông báo/hướng dẫn phụ huynh gõ đúng cú pháp này khi cần tra STT (VD: đăng lên Fanpage: "Để tra số thứ tự nộp hồ sơ, nhắn: tra cứu: Họ và tên con").

Nếu muốn bot nhận diện linh hoạt hơn (không cần gõ đúng "tra cứu:"), mình có thể nâng cấp thêm, nhưng sẽ cần cẩn thận hơn để tránh nhầm câu hỏi thường thành lệnh tra cứu.


Index
JS 

{ "trung_tuyen": [ { "stt": "01", "ho_ten": "ĐẶNG TRẦN MINH AN", "truong_cuoi_cap": "THCS Nguyễn Tri Phương", "thoi_gian_nop_ho_so": "07/7/2026, buổi Chiều 13h30-15h00" }, { "stt": "02", "ho_ten": "DƯƠNG THANH AN", "truong_cuoi_cap":

pasted

Danh sách tra cứu mình đã có file json này rồi mà


Xác minh tệp JSON đã tồn tại và sẵn sàng tiếp tục
Xác minh tệp JSON đã tồn tại và sẵn sàng tiếp tục
Đúng rồi, đây chính là file danh_sach_tra_cuu.json mình đã tạo cho bạn ở bước trước — bạn đã có sẵn rồi, không cần tạo lại.

Vậy giờ bạn đã có đủ 2 file cần thiết:

✅ danh_sach_tra_cuu.json (file này)
✅ index.js (đã tích hợp tính năng tra cứu, mình gửi ở tin nhắn trước)
Việc còn lại — chỉ cần upload lên GitHub
Vào GitHub → repo nkit-chatbot
Thêm file mới: danh_sach_tra_cuu.json (Add file → Create new file → paste nội dung → Commit)
Thay file cũ: mở index.js → Edit (bút chì) → xóa hết nội dung cũ → paste nội dung index.js mới → Commit
Đợi Render tự động deploy lại (vài phút)
Cách test sau khi deploy xong
Nhắn tin cho Fanpage:

tra cứu: Đặng Trần Minh An
Bot sẽ trả lời ngay: "Em ĐẶNG TRẦN MINH AN (THCS Nguyễn Tri Phương) có STT: 01. Thời gian nộp hồ sơ: 07/7/2026, buổi Chiều 13h30-15h00..."

Bạn cứ upload xong rồi test thử, nếu có lỗi gì (VD: log báo lỗi trên Render) thì gửi mình đoạn log đó, mình sẽ giúp debug tiếp.








Claude is AI and can make mistakes. Please double-check responses.
Index · JS
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
 
// Nhận diện câu hỏi tra cứu STT và trích tên học sinh.
// Cú pháp yêu cầu: "tra cứu: TÊN HỌC SINH" (để tránh đoán nhầm ý người dùng)
function trichTenTuCauHoi(tinNhan) {
  const match = tinNhan.match(/tra c[ứu]u[:\s]+(.+)/i);
  if (match) return match[1].trim();
  return null;
}
 
// Hàm xử lý chính: gọi hàm này TRƯỚC khi gọi Groq API.
// Nếu trả về khác null, gửi thẳng kết quả này cho người dùng, KHÔNG cần gọi AI.
function xuLyTraCuuSTT(tinNhanNguoiDung) {
  const ten = trichTenTuCauHoi(tinNhanNguoiDung);
  if (!ten) return null;
 
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
 
