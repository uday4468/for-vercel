const express = require("express");
const bodyParser = require("body-parser");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

let storedData = {};

// Homepage route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Submit route
app.post("/submit", async (req, res) => {
  try {
    const { upi, name, policy, amount } = req.body;

    const id = uuidv4();

    const upiString = `upi://pay?pa=${upi}&pn=${name}&am=${amount}&tn=Policy-${policy}`;
    const qrImage = await QRCode.toDataURL(upiString);

    storedData[id] = {
      upi,
      name,
      policy,
      amount,
      qrImage
    };

    res.redirect(`/verify/${id}`);
  } catch (error) {
    console.error(error);
    res.send("Something went wrong");
  }
});

// Verification page
app.get("/verify/:id", (req, res) => {
  res.render("verify", { id: req.params.id, error: null });
});

// Verification logic
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