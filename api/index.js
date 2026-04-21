const express = require("express");
const bodyParser = require("body-parser");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Static folder
app.use(express.static(path.join(process.cwd(), "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

let storedData = {};

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/index.html"));
});

// Submit
app.post("/submit", async (req, res) => {
  try {
    const { upi, name, policy, amount } = req.body;

    const id = uuidv4();

    const upiString = `upi://pay?pa=${upi}&pn=${name}&am=${amount}&tn=Policy-${policy}`;
    const qrImage = await QRCode.toDataURL(upiString);

    storedData[id] = { upi, name, policy, amount, qrImage };

    res.redirect(`/verify/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Verify page
app.get("/verify/:id", (req, res) => {
  const data = storedData[req.params.id];
  if (!data) return res.send("Invalid link");

  res.render("verify", { id: req.params.id, error: null });
});

// Verify logic
app.post("/verify/:id", (req, res) => {
  const data = storedData[req.params.id];

  if (!data) return res.send("Invalid Link");

  if (req.body.policy !== data.policy) {
    return res.render("verify", {
      id: req.params.id,
      error: "Please enter the correct policy number."
    });
  }

  res.render("details", { data });
});

module.exports = app;