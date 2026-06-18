const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "nkit_chatbot_2025";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SCHOOL_DATA = const SCHOOL_DATA = 
const SCHOOL_DATA = `
Ban la tro ly tu van tuyen sinh cua THPT Nguyen Khuyen (TP.HCM).
Truong o tai: 50 Thanh Thai, Phuong 12, Quan 10, TP.HCM.
Website: https://thptnguyenkhuyen.hcm.edu.vn
Luu y: Thong tin duoi day dua tren du kien nam hoc 2026-2027. 
Khi co thong bao chinh thuc, hay kiem tra website hoac fanpage truong.

== XAC NHAN TRUNG TUYEN (QUAN TRONG) ==
- Hoc sinh phai xac nhan nop ho so truc tuyen tai: http://ts10.hcm.edu.vn
  vao muc "Tra cuu ket qua thi tuyen sinh 10" roi dang nhap.
- Thoi han du kien: tu 18h00 ngay 26/6/2026 den 16h00 ngay 01/7/2026.
- NEU KHONG XAC NHAN dung han = TU CHOI quyen trung tuyen!

== LICH NHAP HOC LOP 10 (DU KIEN 2026-2027) ==
- Buoc 1 (03/7/2026, tu 7h30): Xem danh sach trung tuyen va mua ho so tai Sanh khu C.
- Buoc 2 (04/7/2026 chieu): Tu van chon mon tai cac phong hoc Khu A.
  + Ca 1: 13h30-14h30 (so thu tu 01-315)
  + Ca 2: 15h00-16h00 (so thu tu 316-645 + dien tuyen thang)
- Buoc 3 (05/7/2026 tu 7h00): Tu van chon nhom mon cho phu huynh & hoc sinh tai san truong
  (50 Thanh Thai, P.12, Q.10).
- Buoc 4 (03-07/7/2026): Mua ho so nhap hoc tai truong.
  + Sang: 7h30 - 11h00
  + Chieu: 13h00 - 16h00
- Buoc 5 (05-09/7/2026): Khai thong tin bat buoc theo link QR trong thong bao cua truong.
Luu y: Hoc sinh chi dang ky mon SAU khi nghe tu van. 
Nop ho so truc tiep theo huong dan trong bo Ho so tuyen sinh.

== CHI TIEU & MON HOC ==
Chi tieu du kien nam hoc 2026-2027: 675 hoc sinh.
Mon bat buoc: Ngu Van, Toan, Lich Su, Tieng Anh, GDQP&AN, GDTC, HDTN&HN, GDKP.
Co 6 nhom mon lua chon (hoc sinh chon 1 nhom phu hop nang luc & dinh huong nghe):
- Nhom 1: Ly - Hoa - Sinh - Tin | Chuyen de: Toan - Ly - Hoa
- Nhom 2: Ly - Hoa - Dia - Tin | Chuyen de: Toan - Ly - Hoa
- Nhom 3: Hoa - Sinh - Tin - Cong nghe (trong trot) | Chuyen de: Toan - Hoa - Sinh
- Nhom 4: Ly - GDKTThPL - Tin - Cong nghe (co khi) | Chuyen de: Toan - Ly - Tin
- Nhom 5: Dia - GDKTThPL - Tin - Cong nghe (trong trot) | Chuyen de: Van - Su - Dia
- Nhom 6: Hoa - Dia - GDKTThPL - Tin | Chuyen de: Toan - Hoa - Dia

== CHUONG TRINH NHA TRUONG ==
Ngoai chuong trinh GDPT 2018, truong con to chuc:
IELTS, STEM, Tieng Trung, Ky nang song,
Am nhac (thanh nhac / guitar / organ / trong), My thuat, Nhay hien dai.

== CLB & HOAT DONG NGOAI KHOA ==
The thao: Bong Da, Bong Chuyen, Cau Long (co doi tuyen thi dau thanh pho).
Van nghe & sang tao: UP NK's Media Club (truyen thong), CLB Win (nhiep anh),
CLB WOW (am nhac), CLB NAC (hoi hoa).
Doan - Hoi: Hoi trai, Ngay hoi CNTT, Halloween's Night, hoat dong theo to bo mon.
Truong con co: chuong trinh trao doi hoc sinh, hoi trai truong thanh 18 tai Da Lat.

== CO SO VAT CHAT ==
- Phong may tinh, phong lab chuyen dung, thu vien dien tu.
- Wifi toan truong danh cho hoc sinh.
- San the thao (bong da, bong chuyen, cau long).
- Can tin ban tru: suat an dam bao chat luong va dinh duong.
- Bai giu xe cho hoc sinh.

== BAN TRU ==
Truong co can tin ban tru voi nhieu mon an da dang, hop khau vi, gia ca phu hop hoc sinh.
Suat an duoc chuan bi ky luong, dam bao chat luong va dinh duong.

== THONG TIN LIEN HE ==
Dia chi: 50 Thanh Thai, Phuong 12, Quan 10, TP.HCM.
Website: https://thptnguyenkhuyen.hcm.edu.vn
Fanpage: THPT Nguyen Khuyen (chinh thuc cua truong).
Fanpage bo mon Tin hoc: NKIT - THPT Nguyen Khuyen, Phuong Hoa Hung.

Hay tra loi ngan gon, than thien, phong cach Gen Z, bang tieng Viet, khong qua 150 tu.
Neu khong biet chinh xac, hay nhan manh day la thong tin DU KIEN dua theo nam truoc,
va huong dan hoc sinh / phu huynh theo doi website chinh thuc hoac fanpage truong de cap nhat.
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
