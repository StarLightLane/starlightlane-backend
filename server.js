const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://starlightlane.org",
  "https://www.starlightlane.org",
];

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:5500");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ["POST", "OPTIONS"],
  })
);

app.use(express.json());

// ── NODEMAILER ────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendEmail(data) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #111827; margin-top: 0;">New Contact Form Submission</h2>
      <p style="color: #6b7280; font-size: 14px;">Received via starlightlane.org</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 180px; font-size: 14px;">First Name</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;"><strong>${data.firstName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Last Name</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;"><strong>${data.lastName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Company</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">${data.company || "—"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Monthly Volume</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;"><strong>${data.monthlyVolume}</strong></td>
        </tr>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: `"Starlight Lane Contact" <${process.env.GMAIL_USER}>`,
    to: "info@starlightlane.org",
    replyTo: data.email,
    subject: `New Contact: ${data.firstName} ${data.lastName} — ${data.company || "No Company"}`,
    html,
  });
}

// ── VALIDATION ────────────────────────────────────────────────────────────────
const VALID_VOLUMES = [
  "Under $10k",
  "$10k–$50k",
  "$50k–$250k",
  "$250k–$1M",
  "Over $1M",
  "Not sure yet",
];

function validate(body) {
  const { firstName, lastName, email, monthlyVolume } = body;
  if (!firstName?.trim()) return "First name is required.";
  if (!lastName?.trim()) return "Last name is required.";
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "A valid email is required.";
  if (!monthlyVolume || !VALID_VOLUMES.includes(monthlyVolume))
    return "A valid monthly processing volume is required.";
  return null;
}

// ── ROUTE ─────────────────────────────────────────────────────────────────────
app.post("/contact", async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  const data = {
    firstName: req.body.firstName.trim(),
    lastName: req.body.lastName.trim(),
    email: req.body.email.trim().toLowerCase(),
    company: req.body.company?.trim() || "",
    monthlyVolume: req.body.monthlyVolume,
  };

  try {
    await sendEmail(data);
    res.json({ success: true, message: "Thanks! We'll be in touch soon." });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Submission failed. Please try again." });
  }
});

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
