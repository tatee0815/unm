/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - CÔNG CỤ GỬI TÍN HIỆU NHANH QUA EMAIL (LOVE WEB)
 * ============================================================================
 * HƯỚNG DẪN TRIỂN KHAI NHANH:
 * 1. Truy cập https://script.google.com -> Chọn "New project" (Dự án mới).
 * 2. Xóa code mặc định trong Code.gs và dán toàn bộ nội dung file này vào.
 * 3. Cập nhật email thật của 2 người trong mục CONFIG.RECIPIENTS bên dưới
 *    (và APP_URL nếu muốn hiện nút mở nhanh trang web trong email).
 * 4. Nhấn "Deploy" (Triển khai) -> "New deployment" (Tệp triển khai mới):
 *    - Select type (Chọn loại): Web app (Ứng dụng web)
 *    - Execute as (Thực thi dưới tên): Me (Tôi)
 *    - Who has access (Ai có quyền truy cập): Anyone (Bất kỳ ai)
 * 5. Cấp quyền gửi email khi Google hỏi (chỉ cần làm 1 lần).
 * 6. Copy "Web app URL" vừa tạo và dán vào biến VITE_GAS_WEBHOOK_URL trong file .env.
 *    (Mỗi khi sửa Code.gs: Deploy -> Manage deployments -> Edit -> New version -> Deploy).
 * ============================================================================
 */

var CONFIG = {
  // Email nhận thông báo tương ứng với từng vai trò trong Love Web
  RECIPIENTS: {
    em: {
      email: 'email-cua-em@gmail.com',
      defaultName: 'Em'
    },
    anh: {
      email: 'email-cua-anh@gmail.com',
      defaultName: 'Anh'
    }
  },

  // Tên ứng dụng hiển thị ở header & footer của thiệp email
  APP_NAME: 'Poetic Love Web',

  // Đường dẫn trang web của 2 bạn (để trống '' nếu không muốn hiển thị nút mở web)
  APP_URL: 'https://your-love-web-domain.com',

  // Múi giờ Việt Nam để format thời gian gửi trong email
  TIMEZONE: 'Asia/Ho_Chi_Minh'
};

/**
 * Endpoint GET đơn giản để kiểm tra Web App đã hoạt động chưa khi mở trực tiếp trên trình duyệt.
 */
function doGet() {
  return buildJsonResponse({
    ok: true,
    service: CONFIG.APP_NAME + ' Email Signal Webhook',
    status: 'ready'
  });
}

/**
 * Endpoint POST nhận dữ liệu JSON từ src/lib/signalService.ts (mode: 'no-cors').
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return buildJsonResponse({ ok: false, error: 'Missing request body' });
    }

    var data = JSON.parse(e.postData.contents);

    // 1. Phân biệt chính xác người gửi và người nhận
    var senderRole = data.senderRole === 'anh' ? 'anh' : 'em';
    var recipientRole = senderRole === 'em' ? 'anh' : 'em';

    var recipientConfig = CONFIG.RECIPIENTS[recipientRole];
    if (!recipientConfig || !recipientConfig.email || recipientConfig.email.indexOf('@') === -1) {
      return buildJsonResponse({ ok: false, error: 'Invalid recipient email in CONFIG' });
    }

    var senderDefaultName = CONFIG.RECIPIENTS[senderRole].defaultName;
    var senderName = sanitizeText(data.senderName, 60) || senderDefaultName;
    var recipientName = sanitizeText(data.recipientName, 60) || recipientConfig.defaultName;
    var sticker = sanitizeText(data.sticker, 16);
    var notices = resolveNoticeTexts(data.notices, data.noticeLabels);

    // Định dạng thời gian gửi dễ đọc theo giờ Việt Nam
    var sentDate = data.sentAt ? new Date(data.sentAt) : new Date();
    if (isNaN(sentDate.getTime())) {
      sentDate = new Date();
    }
    var formattedTime = Utilities.formatDate(sentDate, CONFIG.TIMEZONE, 'HH:mm • dd/MM/yyyy');

    // 2. Tiêu đề tự nhiên, không emoji để tránh lỗi mã hóa & bộ lọc Spam
    var subject = 'Lời nhắn từ ' + senderName + ' gửi ' + recipientName;

    // 3. Chọn ngẫu nhiên một câu ngọt ngào theo tên người gửi & người nhận
    var defaultMessage = pickRandomDefaultMessage(senderName, recipientName);

    // 4. Tạo nội dung Plain-Text (bắt buộc có song song với htmlBody để giảm điểm Spam)
    var plainLines = [
      'Chào ' + recipientName + ',',
      '',
      senderName + ' vừa gửi cho bạn một tín hiệu từ ' + CONFIG.APP_NAME + ' (' + formattedTime + ').'
    ];
    for (var i = 0; i < notices.length; i++) {
      plainLines.push('- ' + notices[i]);
    }
    if (sticker) {
      plainLines.push('Sticker gửi kèm: ' + sticker);
    }
    plainLines.push('');
    plainLines.push(defaultMessage);
    if (CONFIG.APP_URL && CONFIG.APP_URL.indexOf('your-love-web-domain') === -1) {
      plainLines.push('');
      plainLines.push('Mở góc nhỏ của tụi mình: ' + CONFIG.APP_URL);
    }
    var plainBody = plainLines.join('\n');

    // 5. Render giao diện thiệp Email HTML chuẩn UTF-8 (giữ đúng giao diện đẹp & không lỗi emoji)
    var htmlBody = buildRomanticEmailHtml({
      senderRole: senderRole,
      senderName: senderName,
      recipientName: recipientName,
      defaultMessage: defaultMessage,
      sticker: sticker,
      notices: notices,
      formattedTime: formattedTime
    });

    // 6. Dùng MailApp.sendEmail để bảo toàn 100% mã hóa UTF-8 cho emoji/sticker
    MailApp.sendEmail({
      to: recipientConfig.email,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: senderName + ' (' + CONFIG.APP_NAME + ')'
    });
    console.log('Sent signal email to ' + recipientConfig.email + ' (role: ' + recipientRole + ')');

    return buildJsonResponse({
      ok: true,
      recipientRole: recipientRole,
      sentAt: sentDate.toISOString()
    });
  } catch (err) {
    console.error('doPost error:', err && err.stack ? err.stack : err);
    return buildJsonResponse({
      ok: false,
      error: err && err.message ? err.message : 'Unknown error'
    });
  }
}

/**
 * Tạo HTML Email dạng thiệp bo tròn mềm mại (giống phiên bản đầu) kèm <meta charset="UTF-8">.
 */
function buildRomanticEmailHtml(params) {
  var isFromHer = params.senderRole === 'em';
  var accentColor = isFromHer ? '#ec4899' : '#6366f1';
  var softBg = isFromHer ? '#fdf2f8' : '#eef2ff';
  var borderColor = isFromHer ? '#fbcfe8' : '#c7d2fe';

  var safeSender = escapeHtml(params.senderName);
  var safeRecipient = escapeHtml(params.recipientName);
  var safeSticker = escapeHtml(params.sticker);
  var safeTime = escapeHtml(params.formattedTime);
  var safeAppName = escapeHtml(CONFIG.APP_NAME);

  var safeMessageHtml =
    '<span style="color:#78716c;font-style:italic;">' +
    escapeHtml(params.defaultMessage) +
    '</span>';

  var stickerBlock = safeSticker
    ? '<div style="margin:14px 0 8px 0;text-align:center;">' +
      '<div style="display:inline-block;padding:14px 22px;background-color:' +
      softBg +
      ';border:1px solid ' +
      borderColor +
      ';border-radius:20px;font-size:52px;line-height:1.1;">' +
      safeSticker +
      '</div></div>'
    : '';

  var noticesBlock = '';
  if (params.notices && params.notices.length > 0) {
    var badges = [];
    for (var i = 0; i < params.notices.length; i++) {
      badges.push(
        '<div style="margin:8px 0 0 0;text-align:center;">' +
          '<span style="display:inline-block;padding:6px 14px;background-color:#fff1f2;border:1px solid #fecdd3;border-radius:999px;font-size:12px;color:#be123c;font-weight:600;">' +
          escapeHtml(params.notices[i]) +
          '</span></div>'
      );
    }
    noticesBlock = '<div style="margin-top:8px;">' + badges.join('') + '</div>';
  }

  var ctaButtonBlock =
    CONFIG.APP_URL && CONFIG.APP_URL.indexOf('your-love-web-domain') === -1
      ? '<div style="margin-top:24px;text-align:center;">' +
        '<a href="' +
        escapeHtml(CONFIG.APP_URL) +
        '" target="_blank" style="display:inline-block;padding:12px 26px;background-color:' +
        accentColor +
        ';color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:700;">' +
        'Mở góc nhỏ của tụi mình' +
        '</a></div>'
      : '';

  return (
    '<!DOCTYPE html>' +
    '<html lang="vi">' +
    '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>' +
    '<body style="margin:0;padding:0;background-color:#fff7f9;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#443333;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fff7f9;padding:28px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:24px;border:1px solid ' +
    borderColor +
    ';overflow:hidden;box-shadow:0 12px 30px rgba(236,72,153,0.08);">' +
    // Header
    '<tr><td style="padding:26px 28px 18px 28px;background-color:' +
    softBg +
    ';border-bottom:1px solid ' +
    borderColor +
    ';text-align:center;">' +
    '<div style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:' +
    accentColor +
    ';font-weight:700;margin-bottom:6px;">' +
    safeAppName +
    '</div>' +
    '<h1 style="margin:0;font-size:22px;line-height:1.35;color:#3f2e33;font-weight:700;">' +
    safeSender +
    ' gửi tín hiệu đến ' +
    safeRecipient +
    '</h1>' +
    '<div style="margin-top:8px;font-size:12px;color:#78716c;">' +
    safeTime +
    '</div>' +
    '</td></tr>' +
    // Body
    '<tr><td style="padding:24px 28px 28px 28px;">' +
    stickerBlock +
    noticesBlock +
    '<div style="margin-top:18px;padding:18px 20px;background-color:#fffafb;border:1px solid #fce7f3;border-radius:16px;font-size:15px;line-height:1.65;color:#443333;">' +
    safeMessageHtml +
    '</div>' +
    ctaButtonBlock +
    '</td></tr>' +
    // Footer
    '<tr><td style="padding:14px 24px;background-color:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a8a29e;">' +
    'Thư được gửi riêng tư từ không gian kỷ niệm ' +
    safeAppName +
    '.' +
    '</td></tr>' +
    '</table>' +
    '</td></tr></table>' +
    '</body></html>'
  );
}

/**
 * Chuyển danh sách mã thông báo từ Frontend sang câu thông báo rõ ràng trong email.
 */
function resolveNoticeTexts(notices, noticeLabels) {
  var map = {
    memories_updated: 'Đang có thay đổi mới ở tab Kỉ niệm để bạn xem nè.',
    private_corner_share: 'Đang có kỉ niệm muốn chia sẻ với bạn ở góc riêng đó.'
  };
  var result = [];

  if (Object.prototype.toString.call(notices) === '[object Array]') {
    for (var i = 0; i < notices.length; i++) {
      var key = notices[i];
      if (map[key]) {
        result.push(map[key]);
      }
    }
  }

  if (result.length === 0 && Object.prototype.toString.call(noticeLabels) === '[object Array]') {
    for (var j = 0; j < noticeLabels.length; j++) {
      var text = sanitizeText(noticeLabels[j], 160);
      if (text) result.push(text);
    }
  }

  return result;
}

/**
 * Chọn ngẫu nhiên một câu nhắn mặc định ngọt ngào khi gửi tín hiệu.
 * Tên người gửi (senderName) và người nhận (recipientName) được thay đổi linh hoạt.
 */
function pickRandomDefaultMessage(senderName, recipientName) {
  var templates = [
    senderName + ' vừa chạm nhẹ để gửi một cái ôm và nhắc rằng đang nhớ ' + recipientName + ' thật nhiều.',
    senderName + ' tự dưng nhớ ' + recipientName + ' quá chừng nên gửi tín hiệu qua đây nè.',
    senderName + ' ghé qua gửi cho ' + recipientName + ' một chút thương nhớ của ngày hôm nay.',
    senderName + ' đang nghĩ về ' + recipientName + ' đó, nhớ giữ gìn sức khỏe và cười thật tươi nha.',
    'Một cái ôm từ xa mà ' + senderName + ' muốn gửi riêng đến cho ' + recipientName + ' ngay lúc này.',
    senderName + ' chỉ muốn nhắc nhỏ là hôm nay vẫn thương ' + recipientName + ' rất nhiều.',
    'Nếu ' + recipientName + ' đang bận thì đọc xong nhớ nhắn lại cho ' + senderName + ' một chút nha.',
    senderName + ' vừa thả một chút nắng ấm và lời chúc bình yên đến với ' + recipientName + '.'
  ];

  var randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

function sanitizeText(value, maxLen) {
  if (typeof value !== 'string') return '';
  var trimmed = value.trim();
  if (maxLen && trimmed.length > maxLen) {
    return trimmed.slice(0, maxLen);
  }
  return trimmed;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
