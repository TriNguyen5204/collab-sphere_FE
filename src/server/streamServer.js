// import express from "express";
// import cors from "cors";
// import { StreamChat } from "stream-chat";
// import dotenv from "dotenv";

// dotenv.config(); // ✅ load biến môi trường từ file .env

// const app = express();
// app.use(cors());
// app.use(express.json());

// // const apiKey = "a88bgap8nav6"; // ✅ dùng process.env
// // const apiSecret = "c2t4zhvmp44jtwcy2tgygw6age7n7fw4awktmfbjr7d2722nzmrkygbjujxpdc2t";

// if (!apiKey || !apiSecret) {
//   console.error("❌ Missing Stream API key or secret. Check your .env file.");
// //   process.exit(1);
// }

// const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// app.post("/token", (req, res) => {
//   const { userId } = req.body;
//   if (!userId) return res.status(400).json({ error: "Missing userId" });
//   const token = serverClient.createToken(userId);
//   res.json({ token });
// });

// app.listen(3001, () => console.log("✅ Server running on http://localhost:3001"));

