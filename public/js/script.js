function generateQR() {
  const upi = document.querySelector("[name='upi']").value;
  const name = document.querySelector("[name='name']").value;
  const policy = document.querySelector("[name='policy']").value;
  const amount = document.querySelector("[name='amount']").value;

  if (!upi || !name || !policy || !amount) {
    alert("Please fill all fields before generating QR.");
    return;
  }

  const upiString = `upi://pay?pa=${upi}&pn=${name}&am=${amount}&tn=Policy-${policy}`;

  document.getElementById("qr").innerHTML = "";

  QRCode.toCanvas(upiString, function (err, canvas) {
    if (err) {
      console.error(err);
      return;
    }
    document.getElementById("qr").appendChild(canvas);
  });
}