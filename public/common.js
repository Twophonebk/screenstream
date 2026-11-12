// Shared helpers for all pages: config/branding, language, icons, signaling, SDP tuning, chat UI.
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const REACTIONS = ['👍', '😂', '🔥', '❤️', '👏', '😮'];

// ------------------------------------------------------------------ language
const I18N = {
  en: {
    tagline: 'Share your screen in Full HD or higher. Talk by voice, chat, and let a friend take control.',
    hero_badge: 'Free · No install · Runs in your browser', hero_h1a: 'Stream your screen,', hero_h1b: 'smooth as honey.',
    feat_title: 'Everything in one box',
    feat1_t: 'Up to 4K · 144 fps', feat1_d: 'Auto quality follows your connection, so the picture stays sharp and smooth.',
    feat2_t: 'Voice + stereo PC sound', feat2_d: 'Talk both ways while your game or music plays in full stereo.',
    feat3_t: 'Remote control', feat3_d: 'Let a friend use your mouse and keyboard. You approve first and can take it back any time.',
    feat4_t: 'Chat & reactions', feat4_d: 'Messages and emoji fly across the stream for everyone in the room.',
    feat5_t: 'Phones welcome', feat5_d: 'Send a link or a QR code. Viewers join from any browser, nothing to install.',
    feat6_t: 'Private rooms', feat6_d: 'Every room has a password, and video goes directly between you and your viewers.',
    how_title: 'Live in three steps',
    step1_t: 'Open your box', step1_d: 'Set a password, pick a quality and share your screen.',
    step2_t: 'Send the link', step2_d: 'Copy the link or show the QR code to your friends.',
    step3_t: 'Enjoy together', step3_d: 'Watch, talk, chat, and hand over control when you want.',
    cta_title: 'Ready to buzz?', cta_sub: 'Start a room in seconds. It is free.',
    mock_msg1: 'So sharp! 🔥', mock_msg2: 'Welcome to the hive 🐝', footer: 'Made for streaming with friends',
    host_btn: 'Host a stream', join_btn: 'Join a stream',
    f_quality: 'Up to 4K · 144 fps', f_voice: 'Two-way voice', f_control: 'Remote control', f_chat: 'Chat & reactions',
    host_tag: 'Host', server: 'Server', server_on: 'Server connected', server_off: 'Server offline',
    agent_on: 'Control helper on', agent_off: 'Control helper off',
    agent_on_t: 'Viewers can control this PC when you allow them', agent_off_t: 'Run start-agent.bat on this PC to allow remote control',
    idle_title: 'Ready to go live', idle_sub: 'Pick a quality, set a password, then share your screen.',
    go_live: 'Go live', end_stream: 'End stream', live: 'LIVE',
    surface_warn: 'You are sharing a window or tab. For remote control, share your Entire screen.',
    invite: 'Invite', room_code: 'Room code', password: 'Password', password_ph: 'Set a password', copy: 'Copy', copied: 'Link copied',
    qr_hint: 'Scan to open on a phone. Viewers also need the password.',
    quality: 'Quality', p_auto: 'Auto', p_auto_d: 'Adapts to your connection', p_smooth: 'Smooth', p_smooth_d: 'Games & video · 60 fps',
    p_balanced: 'Balanced', p_balanced_d: 'Everyday mix', p_sharp: 'Sharp', p_sharp_d: 'Text & detail · full res',
    advanced: 'Advanced settings', resolution: 'Resolution', native: 'Native', framerate: 'Frame rate', bitrate: 'Max bitrate',
    content: 'Content type', c_mixed: 'Mixed', c_detail: 'Text / desktop', c_motion: 'Games / video',
    codec: 'Video codec', codec_auto: 'Auto (best for this PC)', pc_sound: 'Share PC sound',
    fps_note: '120/144 fps needs a high-refresh screen and a fast upload.',
    viewers: 'Viewers', no_viewers: 'No one has joined yet. Share the link!', monitor_label: 'Monitor that viewers control',
    allow: 'Allow control', deny: 'Deny', take_back: 'Take back', kick: 'Kick', wants_control: 'wants control',
    controlling: 'controlling', start_helper_first: 'Start the control helper (start-agent.bat) first',
    chat: 'Chat', chat_empty: 'No messages yet.', chat_ph: 'Say something…', send: 'Send',
    joined: '{name} joined', left: '{name} left', you: 'You', host_name: 'Host',
    mic_on: 'Mic on', mic_off: 'Mic off', mic: 'Microphone',
    no_mic: 'No microphone access – your voice is off',
    need_password: 'Please set a password', bad_room: 'Room code: 3-32 letters or numbers',
    share_cancelled: 'Screen sharing was cancelled', live_in: 'Live in room {room}', viewer_joined: '{name} joined',
    wants_control_toast: '{name} is asking to control your PC',
    conn_failed: '{name}: connection failed (a TURN server may be needed, see README)',
    cap_info: 'Capturing {w}×{h} · {sound} · {codec}', sound_on: 'PC sound on (stereo)', sound_off: 'no PC sound',
    gpu: 'graphics card', cpu: 'CPU – no hardware encoder found',
    h_good: 'Good connection', h_ok: 'Fair connection', h_bad: 'Poor connection', h_wait: 'Measuring…',
    tip_cpu: 'Your PC is struggling to encode. Lower the frame rate or resolution, or pick Auto.',
    tip_bw: 'Upload is too slow for this quality. Pick Auto or lower the bitrate.',
    tip_loss: 'Packets are being lost. A wired connection usually fixes this.',
    tip_rtt: 'High delay between you. Remote control will feel slow.',
    tip_auto_down: 'Auto lowered quality to {tier} to keep it smooth.', tip_auto_up: 'Auto raised quality to {tier}.',
    join_title: 'Join the stream', name: 'Your name', name_ph: 'Viewer', join: 'Join',
    join_note: 'Your browser will ask for the microphone so you can talk. You can mute any time.',
    enter_room: 'Enter the room code', wrong_pw: 'Wrong password.', room_missing: 'Room not found or host is offline.',
    room_taken: 'That room is already being hosted.', cannot_reach: 'Cannot reach the server',
    connecting: 'Connecting…', reconnecting: 'Reconnecting…', conn_lost: 'Connection failed', disconnected: 'Disconnected',
    host_ended: 'Host ended the stream',
    request_control: 'Request control', waiting_host: 'Waiting for host…', control_on: 'Controlling', control_paused: 'Control paused',
    control_granted: 'Host allowed control. Move over the video to control.', control_ended: 'Control ended',
    no_helper: 'Host has not started the control helper yet',
    actual_size: 'Actual size (sharpest text)', fit: 'Fit to window', smooth: 'Smooth playback (hides stutter, adds ~0.15 s delay)',
    fullscreen: 'Fullscreen', exit_fs: 'Exit fullscreen', leave: 'Leave', volume: 'Volume', reactions: 'Reactions',
    click_sound: 'Tap anywhere to turn on sound', mic_blocked: 'Microphone access was blocked',
    vtip_net: 'Your connection is unstable. Try Smooth playback or a wired connection.',
    stats: 'Stats',
    echo_note: 'PC sound is on. Wear headphones, otherwise your mic picks up the speakers and viewers hear an echo.',
    echo_warn: 'This browser cannot remove the voices of viewers from the PC sound, so they may hear themselves. Update Chrome or Edge to the latest version, and wear headphones.',
    same_pc: 'You are watching on the PC that is streaming. Sound is muted here to stop a feedback loop.',
  },
  vi: {
    tagline: 'Chia sẻ màn hình Full HD trở lên. Nói chuyện, nhắn tin và cho bạn bè điều khiển máy.',
    hero_badge: 'Miễn phí · Không cần cài đặt · Chạy trên trình duyệt', hero_h1a: 'Phát màn hình,', hero_h1b: 'mượt như mật ong.',
    feat_title: 'Tất cả trong một chiếc hộp',
    feat1_t: 'Tới 4K · 144 fps', feat1_d: 'Chất lượng tự điều chỉnh theo mạng, hình luôn nét và mượt.',
    feat2_t: 'Đàm thoại + âm thanh stereo', feat2_d: 'Nói chuyện hai chiều trong khi game hay nhạc vẫn phát stereo đầy đủ.',
    feat3_t: 'Điều khiển từ xa', feat3_d: 'Cho bạn bè dùng chuột và bàn phím của bạn. Bạn duyệt trước và lấy lại bất cứ lúc nào.',
    feat4_t: 'Chat & biểu cảm', feat4_d: 'Tin nhắn và emoji bay trên màn hình cho mọi người trong phòng.',
    feat5_t: 'Xem trên điện thoại', feat5_d: 'Gửi liên kết hoặc mã QR. Người xem vào bằng trình duyệt, không cần cài gì.',
    feat6_t: 'Phòng riêng tư', feat6_d: 'Mỗi phòng có mật khẩu, video truyền trực tiếp giữa bạn và người xem.',
    how_title: 'Lên sóng trong ba bước',
    step1_t: 'Mở hộp của bạn', step1_d: 'Đặt mật khẩu, chọn chất lượng rồi chia sẻ màn hình.',
    step2_t: 'Gửi liên kết', step2_d: 'Sao chép liên kết hoặc đưa mã QR cho bạn bè.',
    step3_t: 'Cùng thưởng thức', step3_d: 'Xem, nói chuyện, nhắn tin và trao quyền điều khiển khi bạn muốn.',
    cta_title: 'Sẵn sàng lên sóng?', cta_sub: 'Tạo phòng trong vài giây. Hoàn toàn miễn phí.',
    mock_msg1: 'Nét quá! 🔥', mock_msg2: 'Chào mừng vào tổ 🐝', footer: 'Dành cho những buổi phát cùng bạn bè',
    host_btn: 'Phát trực tiếp', join_btn: 'Tham gia xem',
    f_quality: 'Tới 4K · 144 fps', f_voice: 'Đàm thoại hai chiều', f_control: 'Điều khiển từ xa', f_chat: 'Chat & biểu cảm',
    host_tag: 'Chủ phòng', server: 'Máy chủ', server_on: 'Đã kết nối máy chủ', server_off: 'Mất kết nối máy chủ',
    agent_on: 'Trình điều khiển: bật', agent_off: 'Trình điều khiển: tắt',
    agent_on_t: 'Người xem có thể điều khiển máy này khi bạn cho phép', agent_off_t: 'Chạy start-agent.bat trên máy này để cho phép điều khiển từ xa',
    idle_title: 'Sẵn sàng phát', idle_sub: 'Chọn chất lượng, đặt mật khẩu rồi chia sẻ màn hình.',
    go_live: 'Bắt đầu phát', end_stream: 'Kết thúc', live: 'TRỰC TIẾP',
    surface_warn: 'Bạn đang chia sẻ một cửa sổ hoặc tab. Để điều khiển từ xa, hãy chia sẻ Toàn bộ màn hình.',
    invite: 'Mời người xem', room_code: 'Mã phòng', password: 'Mật khẩu', password_ph: 'Đặt mật khẩu', copy: 'Sao chép', copied: 'Đã sao chép liên kết',
    qr_hint: 'Quét để mở trên điện thoại. Người xem cũng cần mật khẩu.',
    quality: 'Chất lượng', p_auto: 'Tự động', p_auto_d: 'Tự điều chỉnh theo mạng', p_smooth: 'Mượt', p_smooth_d: 'Game & video · 60 fps',
    p_balanced: 'Cân bằng', p_balanced_d: 'Dùng hằng ngày', p_sharp: 'Sắc nét', p_sharp_d: 'Chữ & chi tiết · độ phân giải gốc',
    advanced: 'Cài đặt nâng cao', resolution: 'Độ phân giải', native: 'Gốc', framerate: 'Tốc độ khung hình', bitrate: 'Bitrate tối đa',
    content: 'Loại nội dung', c_mixed: 'Hỗn hợp', c_detail: 'Chữ / màn hình làm việc', c_motion: 'Game / video',
    codec: 'Codec video', codec_auto: 'Tự động (tốt nhất cho máy này)', pc_sound: 'Chia sẻ âm thanh máy tính',
    fps_note: '120/144 fps cần màn hình tần số quét cao và mạng tải lên nhanh.',
    viewers: 'Người xem', no_viewers: 'Chưa có ai tham gia. Hãy gửi liên kết!', monitor_label: 'Màn hình người xem điều khiển',
    allow: 'Cho điều khiển', deny: 'Từ chối', take_back: 'Lấy lại', kick: 'Mời ra', wants_control: 'muốn điều khiển',
    controlling: 'đang điều khiển', start_helper_first: 'Hãy chạy trình điều khiển (start-agent.bat) trước',
    chat: 'Trò chuyện', chat_empty: 'Chưa có tin nhắn.', chat_ph: 'Nhập tin nhắn…', send: 'Gửi',
    joined: '{name} đã vào', left: '{name} đã rời đi', you: 'Bạn', host_name: 'Chủ phòng',
    mic_on: 'Mic bật', mic_off: 'Mic tắt', mic: 'Micro',
    no_mic: 'Không truy cập được micro – giọng của bạn đang tắt',
    need_password: 'Vui lòng đặt mật khẩu', bad_room: 'Mã phòng: 3-32 chữ cái hoặc số',
    share_cancelled: 'Đã hủy chia sẻ màn hình', live_in: 'Đang phát ở phòng {room}', viewer_joined: '{name} đã vào',
    wants_control_toast: '{name} muốn điều khiển máy của bạn',
    conn_failed: '{name}: kết nối thất bại (có thể cần máy chủ TURN, xem README)',
    cap_info: 'Đang ghi {w}×{h} · {sound} · {codec}', sound_on: 'có âm thanh máy (stereo)', sound_off: 'không có âm thanh máy',
    gpu: 'card đồ họa', cpu: 'CPU – không tìm thấy bộ mã hóa phần cứng',
    h_good: 'Kết nối tốt', h_ok: 'Kết nối khá', h_bad: 'Kết nối kém', h_wait: 'Đang đo…',
    tip_cpu: 'Máy đang quá tải khi mã hóa. Giảm fps hoặc độ phân giải, hoặc chọn Tự động.',
    tip_bw: 'Tốc độ tải lên không đủ cho chất lượng này. Chọn Tự động hoặc giảm bitrate.',
    tip_loss: 'Đang mất gói tin. Dùng dây mạng thường sẽ khắc phục được.',
    tip_rtt: 'Độ trễ giữa hai bên cao. Điều khiển từ xa sẽ chậm.',
    tip_auto_down: 'Tự động giảm chất lượng xuống {tier} để giữ mượt.', tip_auto_up: 'Tự động tăng chất lượng lên {tier}.',
    join_title: 'Tham gia xem', name: 'Tên của bạn', name_ph: 'Người xem', join: 'Vào xem',
    join_note: 'Trình duyệt sẽ xin quyền micro để bạn có thể nói chuyện. Bạn có thể tắt mic bất cứ lúc nào.',
    enter_room: 'Nhập mã phòng', wrong_pw: 'Sai mật khẩu.', room_missing: 'Không tìm thấy phòng hoặc chủ phòng đã offline.',
    room_taken: 'Phòng này đang có người phát.', cannot_reach: 'Không kết nối được máy chủ',
    connecting: 'Đang kết nối…', reconnecting: 'Đang kết nối lại…', conn_lost: 'Kết nối thất bại', disconnected: 'Mất kết nối',
    host_ended: 'Chủ phòng đã kết thúc buổi phát',
    request_control: 'Xin điều khiển', waiting_host: 'Đang chờ chủ phòng…', control_on: 'Đang điều khiển', control_paused: 'Tạm dừng điều khiển',
    control_granted: 'Chủ phòng đã cho phép. Di chuột trên video để điều khiển.', control_ended: 'Đã dừng điều khiển',
    no_helper: 'Chủ phòng chưa bật trình điều khiển',
    actual_size: 'Kích thước thật (chữ nét nhất)', fit: 'Vừa cửa sổ', smooth: 'Phát mượt (giảm giật, trễ thêm ~0,15 giây)',
    fullscreen: 'Toàn màn hình', exit_fs: 'Thoát toàn màn hình', leave: 'Rời phòng', volume: 'Âm lượng', reactions: 'Biểu cảm',
    click_sound: 'Chạm vào màn hình để bật âm thanh', mic_blocked: 'Quyền micro bị chặn',
    vtip_net: 'Mạng của bạn không ổn định. Thử bật Phát mượt hoặc dùng dây mạng.',
    stats: 'Thông số',
    echo_note: 'Đang chia sẻ âm thanh máy. Hãy đeo tai nghe, nếu không mic sẽ thu lại tiếng loa và người xem nghe bị vọng.',
    echo_warn: 'Trình duyệt này không tách được giọng người xem khỏi âm thanh máy nên họ có thể nghe lại giọng mình. Hãy cập nhật Chrome hoặc Edge bản mới nhất và đeo tai nghe.',
    same_pc: 'Bạn đang xem trên chính máy đang phát. Âm thanh ở đây đã được tắt để tránh tiếng lặp vô hạn.',
  },
};
const SERVER_ERRORS = {
  'Wrong password.': 'wrong_pw', 'Room not found or host is offline.': 'room_missing',
  'That room is already being hosted.': 'room_taken',
};
let LANG = (() => {
  try { const s = localStorage.getItem('ss-lang'); if (s === 'en' || s === 'vi') return s; } catch {}
  return (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en';
})();
function t(key, vars = {}) {
  const s = (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));
}
function applyI18n() {
  document.documentElement.lang = LANG;
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); });
  $$('.lang-toggle').forEach((b) => { b.textContent = LANG === 'vi' ? 'EN' : 'VI'; b.title = LANG === 'vi' ? 'English' : 'Tiếng Việt'; });
}
function setLang(l) {
  LANG = l;
  try { localStorage.setItem('ss-lang', l); } catch {}
  applyI18n();
  document.dispatchEvent(new Event('langchange'));
}
document.addEventListener('click', (e) => {
  if (e.target.closest('.lang-toggle')) setLang(LANG === 'vi' ? 'en' : 'vi');
});

// ------------------------------------------------------------------ icons
const ICON_PATHS = {
  logo: '<rect x="2" y="4" width="20" height="14" rx="3"/><path d="M10 8.5v5l4.5-2.5z" fill="currentColor"/><path d="M8 21h8"/>',
  play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/>',
  micOff: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/><path d="M3 3l18 18"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  volumeOff: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/>',
  cursor: '<path d="M4 3l7 17 2.5-7.5L21 10z"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
  expand: '<path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/>',
  shrink: '<path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"/>',
  zoom: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M11 8v6M8 11h6"/>',
  wave: '<path d="M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-3 5-2"/>',
  leave: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  screen: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  auto: '<path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4zM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9z"/>',
  game: '<rect x="2" y="7" width="20" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4M15.5 11.5h.01M18 14h.01"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
};
function icon(name) {
  return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}
function renderIcons(root = document) {
  $$('[data-icon]', root).forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
}

// ------------------------------------------------------------------ config + branding
let _cfg;
function loadConfig() {
  if (!_cfg) {
    _cfg = fetch('/config', { cache: 'no-store' }).then((r) => r.json())
      .catch(() => ({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], brand: {} }));
  }
  return _cfg;
}
async function getIceServers() { return (await loadConfig()).iceServers; }
function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return l > 0.6 ? '#141006' : '#ffffff';
}
// BeeBox logo: a honey cube (seen from the corner it is a honeycomb cell) with bee stripes
const LOGO_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 28 9 16 16 4 9z" fill="#ffd95a"/><path d="M4 9l12 7v14L4 23z" fill="#ffb703"/><path d="M28 9v14l-12 7V16z" fill="#f08c00"/><path d="M4 13l12 7v3.2l-12-7zM4 19.4l12 7V29.6l-12-7z" fill="#1a1200"/><path d="M20 17.6v7.2l5.4-6.6z" fill="#1a1200"/></svg>';
const BEE_SVG = '<svg viewBox="0 0 40 28"><ellipse cx="14" cy="8" rx="8" ry="5" fill="#fff" opacity=".45"/><ellipse cx="24" cy="7" rx="7" ry="4.5" fill="#fff" opacity=".3"/><ellipse cx="20" cy="17" rx="12" ry="8" fill="#ffb703"/><path d="M15 10.5v13M21 9.5v15M27 11.5v11" stroke="#1a1200" stroke-width="3"/><circle cx="31" cy="15" r="1.3" fill="#1a1200"/></svg>';
// Animated background. Only transform/opacity are animated, so the graphics card does the work
// and the stream encoder is not affected. It is paused while live (see style.css).
function mountBg() {
  if (document.querySelector('.bg-fx')) return;
  const fx = document.createElement('div');
  fx.className = 'bg-fx';
  fx.setAttribute('aria-hidden', 'true');
  let h = '<div class="comb-mask"><div class="comb"></div></div><i class="glow g1"></i><i class="glow g2"></i>';
  const hx = [[5, 70, 26, 0], [17, 34, 34, -12], [30, 90, 30, -5], [45, 44, 38, -20], [57, 110, 28, -9], [69, 52, 36, -27], [81, 76, 31, -15], [92, 40, 40, -3]];
  for (const a of hx) h += '<i class="hx" style="--x:' + a[0] + '%;--s:' + a[1] + 'px;--d:' + a[2] + 's;--dl:' + a[3] + 's"></i>';
  const bees = [[20, 38, -4], [56, 52, -30], [78, 45, -18]];
  for (const b of bees) h += '<span class="bee" style="--y:' + b[0] + '%;--d:' + b[1] + 's;--dl:' + b[2] + 's">' + BEE_SVG + '</span>';
  fx.innerHTML = h;
  document.body.prepend(fx);
}
async function applyBrand(pageKey) {
  const { brand = {} } = await loadConfig();
  const name = brand.name || 'BeeBox';
  $$('.brand-name').forEach((e) => { e.textContent = name; });
  document.title = pageKey ? `${name} · ${t(pageKey)}` : name;
  if (brand.color) {
    document.documentElement.style.setProperty('--accent', brand.color);
    document.documentElement.style.setProperty('--accent-ink', inkFor(brand.color));
  }
  $$('.logo').forEach((e) => {
    if (brand.logo) { e.innerHTML = ''; const img = new Image(); img.src = brand.logo; img.alt = ''; e.appendChild(img); }
    else e.innerHTML = LOGO_SVG;
  });
}
function initPage(pageKey) {
  renderIcons();
  applyI18n();
  applyBrand(pageKey);
  document.addEventListener('langchange', () => applyBrand(pageKey));
  mountBg();
}

// ------------------------------------------------------------------ signaling
class Signal {
  constructor(onMessage, onStatus) {
    this.onMessage = onMessage;
    this.onStatus = onStatus || (() => {});
  }
  connect() {
    return new Promise((resolve, reject) => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      this.ws = new WebSocket(`${proto}://${location.host}/ws`);
      this.ws.onopen = () => {
        this.onStatus('online');
        this.ping = setInterval(() => this.send({ type: 'ping' }), 20000);
        resolve();
      };
      this.ws.onerror = () => reject(new Error(t('cannot_reach')));
      this.ws.onclose = () => { clearInterval(this.ping); this.onStatus('offline'); };
      this.ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'error' && SERVER_ERRORS[msg.message]) msg.message = t(SERVER_ERRORS[msg.message]);
        if (msg.type !== 'pong') this.onMessage(msg);
      };
    });
  }
  send(msg) { if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(msg)); }
}

// ------------------------------------------------------------------ UI bits
function toast(text, kind = '') {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = text;
  box.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3800);
}
function fmtBitrate(bps) {
  if (!bps) return '0 kbps';
  return bps >= 1e6 ? `${(bps / 1e6).toFixed(1)} Mbps` : `${Math.round(bps / 1e3)} kbps`;
}
function healthHTML(level) {
  return `<span class="bars ${level || 'wait'}"><i></i><i></i><i></i></span>`;
}
function setHealth(el, level, tipKey) {
  if (!el) return;
  el.innerHTML = healthHTML(level) + `<span>${t(level ? 'h_' + level : 'h_wait')}</span>`;
  el.title = tipKey ? t(tipKey) : t(level ? 'h_' + level : 'h_wait');
}
function spawnReaction(layer, emoji) {
  if (!layer || !REACTIONS.includes(emoji)) return;
  const el = document.createElement('span');
  el.className = 'float-react';
  el.textContent = emoji;
  el.style.left = `${8 + Math.random() * 20}%`;
  el.style.setProperty('--drift', `${Math.round(Math.random() * 60 - 30)}px`);
  layer.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
function addChatLine(list, { name, text, self, sys }) {
  if (!list) return;
  list.querySelector('.empty')?.remove();
  const row = document.createElement('div');
  row.className = 'msg' + (self ? ' self' : '') + (sys ? ' sys' : '');
  if (sys) row.textContent = text;
  else {
    const n = document.createElement('b'); n.textContent = name;
    const tx = document.createElement('span'); tx.textContent = text;
    row.append(n, tx);
  }
  const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
  list.appendChild(row);
  while (list.children.length > 200) list.firstChild.remove();
  if (atBottom || self) list.scrollTop = list.scrollHeight;
}
function buildReactionButtons(container, onPick) {
  container.innerHTML = '';
  for (const e of REACTIONS) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'react-btn'; b.textContent = e;
    b.onclick = () => onPick(e);
    container.appendChild(b);
  }
}

// ------------------------------------------------------------------ WebRTC tuning
// Applied by the host to the viewer's answer:
//  - video: start at a high bitrate (sharp from the first second), floor of 1 Mbps, ceiling 50 Mbps
//  - PC sound (mid 1): stereo Opus at 160 kbps (default is mono ~32 kbps)
//  - voice (mid 2): Opus at 48 kbps
function tuneAnswer(sdp, startKbps) {
  const lines = sdp.split('\r\n');
  const sections = [];
  let cur = { kind: null, lines: [] };
  for (const l of lines) {
    if (l.startsWith('m=')) { sections.push(cur); cur = { kind: l.slice(2).split(' ')[0], lines: [] }; }
    cur.lines.push(l);
  }
  sections.push(cur);
  for (const s of sections) {
    const mid = (s.lines.find((l) => l.startsWith('a=mid:')) || '').slice(6);
    if (s.kind === 'video') {
      addFmtp(s.lines, /^(H264|VP8|VP9|AV1)$/i, `x-google-start-bitrate=${startKbps};x-google-min-bitrate=1000;x-google-max-bitrate=50000`);
    } else if (s.kind === 'audio') {
      addFmtp(s.lines, /^opus$/i, mid === '1' ? 'stereo=1;sprop-stereo=1;maxaveragebitrate=160000' : 'maxaveragebitrate=48000');
    }
  }
  return sections.flatMap((s) => s.lines).join('\r\n');
}
function addFmtp(lines, codecRe, extra) {
  const pts = [];
  for (const l of lines) {
    const m = l.match(/^a=rtpmap:(\d+) ([^/]+)\//);
    if (m && codecRe.test(m[2])) pts.push(m[1]);
  }
  for (const pt of pts) {
    const i = lines.findIndex((l) => l.startsWith(`a=fmtp:${pt} `));
    if (i >= 0) { if (!lines[i].includes(extra.split('=')[0])) lines[i] += ';' + extra; }
    else {
      const r = lines.findIndex((l) => l.startsWith(`a=rtpmap:${pt} `));
      lines.splice(r + 1, 0, `a=fmtp:${pt} ${extra}`);
    }
  }
}

// Pick the best codec this PC can encode on the graphics card: AV1 > H.264 > VP9.
// Without hardware encoding, H.264 is the lightest on the CPU.
async function pickBestCodec(w, h, fps, bps) {
  const have = (RTCRtpReceiver.getCapabilities('video')?.codecs || []).map((c) => c.mimeType.toLowerCase());
  for (const mime of ['video/AV1', 'video/H264', 'video/VP9']) {
    if (!have.includes(mime.toLowerCase())) continue;
    try {
      const r = await navigator.mediaCapabilities.encodingInfo({
        type: 'webrtc', video: { contentType: mime, width: w, height: h, bitrate: bps, framerate: fps },
      });
      if (r.supported && r.powerEfficient) return { mime, hw: true };
    } catch {}
  }
  return { mime: 'video/H264', hw: false };
}
function preferCodec(transceiver, mime) {
  if (!mime || mime === 'auto' || !transceiver.setCodecPreferences) return;
  const caps = RTCRtpReceiver.getCapabilities('video');
  if (!caps) return;
  const first = caps.codecs.filter((c) => c.mimeType.toLowerCase() === mime.toLowerCase());
  if (!first.length) return;
  const rest = caps.codecs.filter((c) => c.mimeType.toLowerCase() !== mime.toLowerCase());
  try { transceiver.setCodecPreferences([...first, ...rest]); } catch (e) { console.warn('codec pref failed', e); }
}
