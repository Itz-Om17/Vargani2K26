const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

function convertNumberToWords(num) {
  const ones = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ',
    'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस',
    'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस',
    'तीस', 'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस',
    'चाळीस', 'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास',
    'पन्नास', 'एकावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ',
    'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर',
    'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौर्‍याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्याहत्तर', 'अठ्याहत्तर', 'एकोणऐंशी',
    'ऐंशी', 'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'च्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्याऐंशी', 'अठ्याऐंशी', 'एकोणनव्वद',
    'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'च्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्याण्णव', 'अठ्याण्णव', 'नव्याण्णव'
  ];

  if (!num || num <= 0) return '';
  let result = '';

  if (num >= 10000000) {
    result += convertNumberToWords(Math.floor(num / 10000000)) + ' कोटी ';
    num %= 10000000;
  }
  if (num >= 100000) {
    result += convertNumberToWords(Math.floor(num / 100000)) + ' लाख ';
    num %= 100000;
  }
  if (num >= 1000) {
    result += convertNumberToWords(Math.floor(num / 1000)) + ' हजार ';
    num %= 1000;
  }
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' शे ';
    num %= 100;
  }
  if (num > 0) {
    result += ones[num] + ' ';
  }
  return result.trim();
}

// Convert number to Marathi words
function numberToMarathiWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'शून्य रुपये फक्त';
  if (n < 0) return 'उणे ' + convertNumberToWords(-n) + ' रुपये फक्त';
  return convertNumberToWords(n) + ' रुपये फक्त';
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getLogoDataUri() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  const logoCandidates = [
    { name: 'navratri_logo.png', mime: 'image/png' },
    { name: 'durga_mata.jpg', mime: 'image/jpeg' },
    { name: 'durga_logo.jpg', mime: 'image/jpeg' }
  ];

  for (const candidate of logoCandidates) {
    const fullPath = path.join(assetsDir, candidate.name);
    if (fs.existsSync(fullPath)) {
      const data = fs.readFileSync(fullPath).toString('base64');
      return `data:${candidate.mime};base64,${data}`;
    }
  }
  return '';
}

function generateReceiptHTML(receipt, logoSrc) {
  const amountWords = numberToMarathiWords(receipt.amount);
  const formattedDate = formatDate(receipt.donationDate);

  return `<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>वर्गणी पावती - ${receipt.receiptNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Marathi:ital@0;1&family=Noto+Sans+Devanagari:wght@400;600;700;900&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 210mm;
      min-height: 148mm;
      background: #fff;
      font-family: 'Noto Sans Devanagari', 'Tiro Devanagari Marathi', serif;
    }
    .receipt {
      width: 210mm;
      min-height: 148mm;
      position: relative;
      background: linear-gradient(135deg, #fffbf0 0%, #fff8e8 50%, #fffbf0 100%);
      overflow: hidden;
    }

    /* Outer gold border */
    .receipt::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #8B0000, #c8860a, #8B0000, #c8860a);
      z-index: 0;
    }

    /* Inner cream content area */
    .inner {
      position: absolute;
      inset: 8px;
      background: linear-gradient(160deg, #fffef5 0%, #fff8e8 40%, #fffef0 100%);
      border: 3px solid #c8860a;
      border-radius: 2px;
      z-index: 1;
      display: flex;
      flex-direction: column;
    }

    /* Decorative border pattern strip */
    .border-strip-top, .border-strip-bottom {
      height: 18px;
      background: repeating-linear-gradient(
        90deg,
        #8B0000 0px, #8B0000 10px,
        #c8860a 10px, #c8860a 20px,
        #fff3c0 20px, #fff3c0 25px,
        #c8860a 25px, #c8860a 35px,
        #8B0000 35px, #8B0000 45px
      );
      opacity: 0.85;
    }

    .content-area {
      flex: 1;
      display: flex;
      flex-direction: row;
      position: relative;
      padding: 8px 12px 6px 12px;
    }

    /* Watermark mandala */
    .watermark {
      position: absolute;
      bottom: 10px;
      left: 35%;
      transform: translateX(-50%);
      width: 140px;
      height: 140px;
      opacity: 0.05;
      background: radial-gradient(circle, #c8860a 0%, transparent 70%);
      border-radius: 50%;
      border: 20px solid #8B0000;
      pointer-events: none;
    }

    /* LEFT SIDE - Form Fields */
    .left-panel {
      flex: 0 0 58%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-right: 10px;
    }

    /* TOP badge */
    .serial-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .shri-circle {
      width: 38px;
      height: 38px;
      background: radial-gradient(circle, #8B0000, #c0392b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 15px;
      font-weight: 900;
      border: 2px solid #c8860a;
      flex-shrink: 0;
    }
    .receipt-num-box {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .receipt-num-label {
      font-size: 13px;
      font-weight: 700;
      color: #5c0000;
    }
    .receipt-num-value {
      font-size: 14px;
      font-weight: 900;
      color: #8B0000;
      border-bottom: 2px solid #8B0000;
      min-width: 120px;
      padding-bottom: 2px;
    }

    /* Form fields */
    .field-row {
      display: flex;
      align-items: flex-end;
      gap: 6px;
      margin-bottom: 2px;
    }
    .field-label {
      font-size: 12.5px;
      font-weight: 700;
      color: #4a0000;
      white-space: nowrap;
      min-width: 95px;
    }
    .field-value {
      flex: 1;
      border-bottom: 1.5px solid #8B0000;
      font-size: 13px;
      font-weight: 600;
      color: #1a0000;
      padding-bottom: 2px;
      min-height: 18px;
    }

    /* Decorative banner in the middle of left */
    .event-banner {
      margin: 8px 0 6px 0;
      background: linear-gradient(135deg, #2c0000, #5c0000, #8B0000, #5c0000, #2c0000);
      border: 2px solid #c8860a;
      border-radius: 4px;
      padding: 6px 12px;
      text-align: center;
      position: relative;
      box-shadow: 0 2px 8px rgba(139,0,0,0.3);
    }
    .event-banner::before, .event-banner::after {
      content: '✦';
      color: #c8860a;
      font-size: 14px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
    .event-banner::before { left: 6px; }
    .event-banner::after { right: 6px; }
    .event-banner-text {
      color: #ffd700;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 1px;
    }

    /* Amount words */
    .amount-words-row {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin-top: 2px;
    }
    .amount-words-label {
      font-size: 11px;
      font-weight: 700;
      color: #4a0000;
      white-space: nowrap;
      min-width: 95px;
      padding-top: 2px;
    }
    .amount-words-value {
      flex: 1;
      border-bottom: 1.5px solid #8B0000;
      font-size: 11.5px;
      font-weight: 600;
      color: #1a0000;
      padding-bottom: 2px;
      font-style: italic;
      line-height: 1.4;
    }

    /* Bottom of left panel */
    .left-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 8px;
    }
    .dhanyawad {
      font-family: 'Tiro Devanagari Marathi', serif;
      font-size: 24px;
      font-weight: 700;
      color: #8B0000;
      font-style: italic;
    }
    .signature-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 140px;
    }
    .digital-sign-box {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 3px;
      padding: 2px 8px;
      background: rgba(39, 174, 96, 0.08);
      border: 1px dashed #27ae60;
      border-radius: 4px;
    }
    .digital-check {
      color: #27ae60;
      font-size: 13px;
      font-weight: 900;
      line-height: 1;
    }
    .digital-text {
      color: #1e7e34;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .signature-line {
      width: 130px;
      border-bottom: 1.5px solid #8B0000;
      margin-bottom: 3px;
    }
    .signature-label {
      font-size: 11px;
      color: #4a0000;
      font-weight: 700;
      letter-spacing: 0.5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Divider between left and right */
    .divider {
      width: 1.5px;
      background: linear-gradient(to bottom, transparent, #c8860a 20%, #c8860a 80%, transparent);
      margin: 0 4px;
      align-self: stretch;
    }

    /* RIGHT SIDE - Title, Mandal info & Festive Logo in open space */
    .right-panel {
      flex: 0 0 42%;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      padding: 4px 6px 4px 8px;
    }

    .main-title {
      font-family: 'Tiro Devanagari Marathi', serif;
      font-size: 28px;
      font-weight: 900;
      color: #8B0000;
      text-align: center;
      line-height: 1.1;
      text-shadow: 1px 1px 2px rgba(139,0,0,0.2);
      margin-bottom: 4px;
    }

    .org-name {
      font-size: 14px;
      font-weight: 900;
      color: #5c0000;
      text-align: center;
      line-height: 1.3;
      margin-bottom: 3px;
    }

    .org-address {
      font-size: 9.5px;
      font-weight: 600;
      color: #7a3000;
      text-align: center;
      line-height: 1.35;
      max-width: 175px;
      margin-bottom: 6px;
    }

    .right-logo-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-top: 2px;
    }

    .festive-logo {
      width: 125px;
      height: 125px;
      object-fit: contain;
      border-radius: 12px;
      border: 2px solid #c8860a;
      box-shadow: 0 3px 10px rgba(139, 0, 0, 0.2);
      background: #fffef8;
    }

    .logo-blessing {
      font-size: 10px;
      color: #8B0000;
      font-weight: 700;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="inner">
      <div class="border-strip-top"></div>
      <div class="content-area">
        <div class="watermark"></div>

        <!-- LEFT PANEL -->
        <div class="left-panel">
          <div class="serial-badge">
            <div class="shri-circle">श्री</div>
            <div class="receipt-num-box">
              <span class="receipt-num-label">क्र.</span>
              <span class="receipt-num-value">${receipt.receiptNumber}</span>
            </div>
          </div>

          <div class="field-row">
            <span class="field-label">नाव :</span>
            <span class="field-value">${receipt.donorName}</span>
          </div>

          <div class="field-row">
            <span class="field-label">पत्ता / गाव :</span>
            <span class="field-value">${receipt.donorAddress || ''} ${receipt.donorVillage || ''}</span>
          </div>

          <div class="field-row">
            <span class="field-label">दिनांक :</span>
            <span class="field-value">${formattedDate}</span>
          </div>

          <div class="field-row">
            <span class="field-label">रक्कम रुपये :</span>
            <span class="field-value">₹ ${receipt.amount.toLocaleString('en-IN')}</span>
          </div>

          <div class="field-row">
            <span class="field-label">देणगीचा प्रकार :</span>
            <span class="field-value">${receipt.donationMode}</span>
          </div>

          <div class="field-row">
            <span class="field-label">संपर्क :</span>
            <span class="field-value">${receipt.donorPhone}</span>
          </div>

          <div class="event-banner">
            <span class="event-banner-text">नवरात्री उत्सव २०२५</span>
          </div>

          <div class="amount-words-row">
            <span class="amount-words-label">अक्षरी रक्कम :</span>
            <span class="amount-words-value">${amountWords}</span>
          </div>

          <div class="left-bottom">
            <div class="dhanyawad">धन्यवाद</div>
            <div class="signature-area">
              <div class="digital-sign-box">
                <span class="digital-check">✓</span>
                <span class="digital-text">Digitally Signed</span>
              </div>
              <div class="signature-line"></div>
              <div class="signature-label">Digitally Signed</div>
            </div>
          </div>
        </div>

        <!-- DIVIDER -->
        <div class="divider"></div>

        <!-- RIGHT PANEL -->
        <div class="right-panel">
          <div class="main-title">वर्गणी<br/>पावती</div>
          <div class="org-name">समर्थ मित्र मंडळ</div>
          <div class="org-address">बी कॅबिन रोड, वडवली विभाग,<br/>पुनरजीवन सोसायटी, अंबरनाथ पूर्व</div>

          ${logoSrc ? `
          <div class="right-logo-container">
            <img
              class="festive-logo"
              src="${logoSrc}"
              alt="नवरात्री उत्सव लोगो"
            />
            <div class="logo-blessing">॥ श्री जगदंब प्रसन्न ॥</div>
          </div>
          ` : ''}
        </div>
      </div>
      <div class="border-strip-bottom"></div>
    </div>
  </div>
</body>
</html>`;
}

async function generatePDF(receipt, outputDir) {
  let puppeteerModule;
  try {
    puppeteerModule = require('puppeteer');
  } catch (e1) {
    try {
      puppeteerModule = require('puppeteer-core');
    } catch (e2) {
      throw new Error('Puppeteer is not installed in this environment');
    }
  }

  // Load festive logo as base64
  const logoDataUri = getLogoDataUri();
  const html = generateReceiptHTML(receipt, logoDataUri);

  // Ensure output directory exists (fallback to os.tmpdir on read-only filesystems)
  let targetDir = outputDir;
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (fsErr) {
    const os = require('os');
    targetDir = os.tmpdir();
  }

  const safeNum = (receipt.receiptNumber || 'receipt').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `receipt_${safeNum}.pdf`;
  const filePath = path.join(targetDir, fileName);

  let browser;
  try {
    browser = await puppeteerModule.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    });
  } catch (launchErr) {
    console.warn('Puppeteer browser launch failed (expected in lightweight serverless):', launchErr.message);
    throw new Error('PDF browser engine unavailable: ' + launchErr.message);
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    await page.pdf({
      path: filePath,
      width: '210mm',
      height: '148mm',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return { filePath, fileName };
}

module.exports = { generatePDF, numberToMarathiWords, generateReceiptHTML, getLogoDataUri };
