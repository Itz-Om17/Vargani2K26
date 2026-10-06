const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

function getApiConfig() {
  return {
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v19.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    accountId: process.env.WHATSAPP_ACCOUNT_ID
  };
}

/**
 * Upload a document (PDF) to Meta Media API and get a media ID
 */
async function uploadMedia(filePath, mimeType = 'application/pdf') {
  const { apiVersion, phoneNumberId, accessToken } = getApiConfig();

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), {
    contentType: mimeType,
    filename: path.basename(filePath)
  });
  form.append('messaging_product', 'whatsapp');
  form.append('type', mimeType);

  const response = await axios.post(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/media`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  return response.data.id;
}

/**
 * Send a WhatsApp message with a PDF document via Meta Cloud API
 */
async function sendReceiptOnWhatsApp(toPhone, receipt, pdfPath) {
  const { apiVersion, phoneNumberId, accessToken } = getApiConfig();

  if (!accessToken || accessToken.includes('YOUR_META_WHATSAPP_TOKEN')) {
    console.warn('[WhatsApp] ⚠️  Token not configured. Skipping WhatsApp send.');
    return { success: false, reason: 'WhatsApp token not configured in .env' };
  }

  // Format phone: remove spaces and non-digits, ensure 91 country code
  let phone = toPhone.toString().replace(/\s+/g, '').replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) phone = '91' + phone.substring(1);
  if (phone.length === 10) phone = '91' + phone;

  try {
    // Step 1: Upload PDF to Meta servers
    console.log(`[WhatsApp] Uploading PDF for ${receipt.receiptNumber}...`);
    const mediaId = await uploadMedia(pdfPath);
    console.log(`[WhatsApp] PDF uploaded successfully, Media ID: ${mediaId}`);

    // Step 2: Send document message
    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'document',
      document: {
        id: mediaId,
        caption: `🙏 *समर्थ मित्र मंडळ, अंबरनाथ*\n\nनमस्कार *${receipt.donorName}* जी,\nआपली *नवरात्री उत्सव २०२५* साठी वर्गणी रक्कम *₹${receipt.amount.toLocaleString('en-IN')}* यशस्वीरित्या प्राप्त झाली आहे.\n\n📄 *पावती क्रमांक:* ${receipt.receiptNumber}\n🗓 *दिनांक:* ${new Date(receipt.donationDate).toLocaleDateString('en-GB')}\n💳 *प्रकार:* ${receipt.donationMode}\n\nआपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद! 🙏\n_॥ श्री जगदंब प्रसन्न ॥_`,
        filename: `वर्गणी_पावती_${receipt.receiptNumber}.pdf`
      }
    };

    const response = await axios.post(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      messageBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`[WhatsApp] ✅ Sent successfully to ${phone}:`, response.data);
    return { success: true, data: response.data, phone };
  } catch (err) {
    const metaError = err.response?.data?.error;
    let friendlyMessage = metaError?.message || err.message;

    // Provide friendly context for common Meta Sandbox errors
    if (metaError?.code === 131030) {
      friendlyMessage = `हा नंबर (${phone}) Meta Developer Console मधील 'To' यादीत जोडलेला नाही. Meta Console मध्ये नंबर Verify करा.`;
    } else if (metaError?.code === 131047) {
      friendlyMessage = `24 तासांची कस्टमर विंडो संपली आहे. कृपया या नंबरवरून मंडळाच्या नंबरवर 'Hi' मेसेज पाठवा किंवा Template मेसेज वापरा.`;
    }

    console.error('[WhatsApp] ❌ Failed to send:', metaError || err.message);
    return {
      success: false,
      reason: friendlyMessage,
      metaCode: metaError?.code,
      details: metaError
    };
  }
}

module.exports = { sendReceiptOnWhatsApp, uploadMedia };
