const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const url = 'http://localhost:5173/terminator.html';
const outputPath = path.join(__dirname, '../public/terminator-qr.png');

QRCode.toFile(outputPath, url, {
  color: {
    dark: '#D4AF37',  // Gold
    light: '#000000'  // Black
  }
}, function (err) {
  if (err) throw err;
  console.log('QR code saved to public/terminator-qr.png');
});
