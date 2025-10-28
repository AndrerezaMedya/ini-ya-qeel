/***** KONFIGURASI *****/
// Placeholder IDs – ganti dengan milikmu saat deploy.
const FOLDER_ID = "REPLACE_WITH_DRIVE_FOLDER_ID";
const SHEET_NAME = "Sheet1";
const GACHA_ITEM_LOG_SHEET_NAME = "GachaItemLog";
const PUBLIC_SHEET_ID  = "REPLACE_WITH_PUBLIC_SHEET_ID";
const PRIVATE_SHEET_ID = "REPLACE_WITH_PRIVATE_SHEET_ID";

/***** UTIL *****/
// Mengubah payload JS menjadi respons JSON standar.
function _ok(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
// Mengirimkan respons error terformat ke client.
function _err(message, extra) {
  return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message,
      ...(extra || {})
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
// Mengambil sheet (atau membuat baru) di spreadsheet target.
function _mustSheet(ssId, name) {
  const ss = SpreadsheetApp.openById(ssId);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
      sheet = ss.insertSheet(name);
      if (name === GACHA_ITEM_LOG_SHEET_NAME) {
          // Header sesuai data yang ditulis (dengan sessionId & MemberName)
          sheet.appendRow(['timestamp', 'browserId', 'sessionId', 'reqId', 'itemName', 'rarity', 'MemberName']);
      }
  }
  return sheet;
}
// Menambahkan baris ke sheet dengan penanganan error yang jelas.
function _appendRowSafe(sheet, row) {
  try { sheet.appendRow(row); }
  catch (e) { throw new Error(`Gagal appendRow ke "${sheet.getName()}": ${e && e.message}`); }
}

// Sanitasi string untuk mencegah formula injection dan karakter kontrol di Sheets
// Membersihkan teks sebelum disimpan di Spreadsheet.
function safeCell_(v) {
  let s = String(v == null ? '' : v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // cegah formula
  s = s.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
  return s;
}

// Tentukan ekstensi dari MIME (untuk penamaan file audio)
// Memetakan MIME audio ke ekstensi file.
function mimeToExt_(mime) {
  const m = String(mime || '').toLowerCase();
  if (m.includes('audio/webm')) return 'webm';
  if (m.includes('audio/ogg')) return 'ogg';
  if (m.includes('audio/mpeg')) return 'mp3';
  if (m.includes('audio/wav')) return 'wav';
  return 'bin';
}

// Signature sederhana untuk de-dup (hindari row ganda saat retry cepat)
// Membuat hash signature agar submit ganda dapat ditolak.
function buildSubmitSig_(data) {
  try {
    const s = normalizeScores_((data && data.scores) || data || {});
    const parts = [
      String(data.coach||''),
      String(data.anggota||''),
      String(data.sessionId||''),
      String(data.happyStory||'').trim(),
      String(data.sadStory||'').trim(),
      'scores:' + COL_KEYS.map(k => String(s[k]||0)).join('-')
    ].join('|');
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, parts, Utilities.Charset.UTF_8);
    return digest.map(function(b){
      const h = (b & 0xff).toString(16);
      return h.length === 1 ? '0'+h : h;
    }).join('');
  } catch (e) {
    return String(Math.random()).slice(2);
  }
}
// Menyimpan audio base64 ke Google Drive dan mengembalikan metadata.
function _saveAudioIfAny(folderId, base64, mime, filenameHint) {
  if (!base64) return null;
  const folder = DriveApp.getFolderById(folderId);
  let bytes;
  try {
    bytes = Utilities.base64Decode(base64);
  } catch (_) {
    throw new Error('Audio base64 tidak valid');
  }
  // Batas ukuran aman (20MB) untuk Apps Script
  const sizeMB = bytes.length / (1024 * 1024);
  if (sizeMB > 20) throw new Error('Audio terlalu besar (>20MB)');

  const ext = mimeToExt_(mime);
  const safeName = (filenameHint || 'voice').replace(/[^\w.-]/g,'_');
  const blob  = Utilities.newBlob(bytes, mime || 'application/octet-stream', `${safeName}_${Date.now()}.${ext}`);
  const f = folder.createFile(blob);
  try {
    const audioPublic = (PropertiesService.getScriptProperties().getProperty('AUDIO_PUBLIC') || '').toLowerCase() === 'true';
    if (audioPublic) {
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }
  } catch (e) {
    // abaikan error setSharing (mis. quota/policy)
  }
  return { fileId: f.getId(), name: f.getName(), url: `https://drive.google.com/file/d/${f.getId()}/view` };
}

// ===== FUNGSI BARU UNTUK GACHA ITEM LOG =====
// Mencatat hasil gacha pemain ke sheet privat untuk analitik.
function handleGachaLog(data) {
  const { browserId, sessionId, reqId, itemName, rarity } = data;
  if (!browserId || !sessionId || !itemName) {
    return;
  }
  // Langsung tulis ke PRIVATE sheet
  const sheet = _mustSheet(PRIVATE_SHEET_ID, GACHA_ITEM_LOG_SHEET_NAME);
  _ensureGachaMemberColumn_(sheet);
  
  // Tentukan MemberName: payload.memberName -> by reqId -> cache by sessionId -> ''
  let memberName = '';
  try {
    if (data.memberName) {
      memberName = String(data.memberName || '');
    } else if (reqId) {
      memberName = _findMemberNameByReqId_(reqId) || '';
    } else {
      const cache = CacheService.getScriptCache();
      memberName = cache.get('memberBySession:' + String(sessionId)) || '';
    }
  } catch (e) {}

  const row = [
    new Date(),
    browserId,
    sessionId, // Kolom C (sessionId)
    reqId || '',
    safeCell_(itemName),
    safeCell_(rarity || ''),
    safeCell_(memberName)
  ];
  _appendRowSafe(sheet, row);
}

// Menambahkan reqId ke log gacha setelah submission utama sukses.
function _backfillReqIdInGachaLog(sessionId, reqId) {
  if (!sessionId || !reqId) return;
  try {
    const sheet = _mustSheet(PRIVATE_SHEET_ID, GACHA_ITEM_LOG_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const sessionIdColIndex = 2; // Kolom C (sessionId) -> index 2
    const reqIdColIndex = 3;     // Kolom D (reqId) -> index 3
    
    for (let i = 1; i < data.length; i++) {
      // Jika sessionId cocok DAN kolom reqId masih kosong
      if (data[i][sessionIdColIndex] === sessionId && data[i][reqIdColIndex] === '') {
        sheet.getRange(i + 1, reqIdColIndex + 1).setValue(reqId);
      }
    }
  } catch (e) {
    // Diamkan saja agar tidak bocor di versi berbagi.
  }
}

// Pastikan kolom MemberName ada (migrasi dari skema lama 6 kolom)
// Memastikan sheet log memiliki kolom nama member.
function _ensureGachaMemberColumn_(sheet) {
  try {
    const lastCol = sheet.getLastColumn();
    const header = (lastCol > 0) ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    const hasMember = header.some(h => String(h || '').toLowerCase() === 'membername');
    if (!hasMember) {
      sheet.insertColumnAfter(lastCol);
      sheet.getRange(1, lastCol + 1).setValue('MemberName');
    }
  } catch (e) {}
}

// Backfill MemberName di GachaItemLog berdasarkan sessionId
// Mengisi nama member jika log gacha dibuat sebelum submit utama.
function _backfillMemberInGachaLog(sessionId, memberName) {
  if (!sessionId || !memberName) return;
  try {
    const sheet = _mustSheet(PRIVATE_SHEET_ID, GACHA_ITEM_LOG_SHEET_NAME);
    _ensureGachaMemberColumn_(sheet);
    const data = sheet.getDataRange().getValues();
    const sessionIdColIndex = 2; // Kolom C (sessionId) -> index 2
    const memberColIndex = 6;    // Kolom G (MemberName) -> index 6
    for (let i = 1; i < data.length; i++) {
      if (data[i][sessionIdColIndex] === sessionId && String(data[i][memberColIndex] || '') === '') {
        sheet.getRange(i + 1, memberColIndex + 1).setValue(memberName);
      }
    }
  } catch (e) {
    // Di versi shareable, tidak perlu logging.
  }
}

// Cari MemberName berdasarkan reqId di Sheets
// Menemukan nama anggota menggunakan reqId yang tersimpan di sheet.
function _findMemberNameByReqId_(joinReqId) {
  if (!joinReqId) return null;
  // Private lebih lengkap; jika tidak ketemu, coba Public
  const tryFind = function(ssId) {
    const map = _getColMap_(ssId);
    const sheet = _mustSheet(ssId, SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const memberCol = 3; // kolom 'anggota'
    let startRow = 0;
    if (values.length && String(values[0][map.REQID-1]).toLowerCase() === 'reqid') startRow = 1;
    for (let r = startRow; r < values.length; r++) {
      if (String(values[r][map.REQID-1]) === String(joinReqId)) {
        const name = values[r][memberCol - 1];
        if (name) return String(name);
      }
    }
    return null;
  };
  return tryFind(PRIVATE_SHEET_ID) || tryFind(PUBLIC_SHEET_ID);
}

/***** Circle of Life (CoL) — keys & descriptions *****/
const COL_KEYS = [
  "Health", "Academic", "Family", "Friends", "Religion",
  "Organization", "SelfLove", "Learning", "Finances", "Spirit"
];

// Deskripsi singkat per parameter (konteks Asrama Salman)
const COL_DESC = {
  Health:       "Seberapa bugar dan sehat fisik sebulan ini (makan, tidur, olahraga).",
  Academic:     "Progres kuliah: paham materi, disiplin kelas, tugas tepat waktu.",
  Family:       "Keharmonisan dengan keluarga; komunikasi tetap nyambung walau di asrama.",
  Friends:      "Kualitas hubungan sosial di asrama/kampus: konflik? teman baru? saling support?",
  Religion:     "Kondisi ruhiyah: semangat ibadah/ngaji/dzikir atau sedang futur.",
  Organization: "Peran dan kontribusi di organisasi (internal/eksternal) dan perkembangannya.",
  SelfLove:     "Menerima dan menghargai diri: self-care di ritme asrama yang padat.",
  Learning:     "Belajar di luar kuliah (kajian, pelatihan, buku, skill baru) untuk pengembangan diri.",
  Finances:     "Kelola uang bulanan/beasiswa: kecukupan, pencatatan, kontrol ‘bocor’.",
  Spirit:       "Motivasi/energi buat jalani hari & kejar target; lagi on-fire atau drop/bimbang?"
};

// Nama tampilan (bilingual) untuk prompt/teks jika perlu
const COL_LABEL = {
  Health: "Health (Kesehatan)",
  Academic: "Academic (Akademik)",
  Family: "Family (Keluarga)",
  Friends: "Friends (Teman)",
  Religion: "Religion (Ruhiyah)",
  Organization: "Organization (Organisasi)",
  SelfLove: "Self-Love (Cinta Diri)",
  Learning: "Learning (Pembelajaran)",
  Finances: "Finances (Keuangan)",
  Spirit: "Spirit (Semangat)"
};

// Menggabungkan deskripsi tiap parameter CoL untuk dimasukkan ke prompt AI.
function buildColContextString_() {
  const lines = [
    "Konteks Parameter Circle of Life yang diisi oleh anggota asrama (nilai selama sebulan terakhir):"
  ];
  for (const k of COL_KEYS) {
    lines.push(`${COL_LABEL[k]}: ${COL_DESC[k]}`);
  }
  return lines.join("\n");
}

// Menstandarkan nama kategori skor agar cocok dengan kunci resmi.
function coerceColKey_(k) {
  const t = String(k||"").toLowerCase().replace(/[\s\-_]/g,"");
  const map = {
    health:"Health", kesehatan:"Health",
    academic:"Academic", akademik:"Academic",
    family:"Family", keluarga:"Family",
    friends:"Friends", friend:"Friends", teman:"Friends",
    religion:"Religion", ruhiyah:"Religion", spiritual:"Religion", agama:"Religion",
    organization:"Organization", organisasi:"Organization", org:"Organization",
    selflove:"SelfLove", cintadiri:"SelfLove", selflovecintadiri:"SelfLove",
    learning:"Learning", pembelajaran:"Learning",
    finances:"Finances", finance:"Finances", keuangan:"Finances",
    spirit:"Spirit", semangat:"Spirit"
  };
  return map[t] || null;
}

// Menghasilkan objek skor yang bersih dan sudah dikurung 0-10.
function normalizeScores_(scoresObj) {
  const out = {};
  COL_KEYS.forEach(k => out[k] = 0);

  const src = scoresObj || {};
  for (const k in src) {
    const canon = coerceColKey_(k);
    if (canon) {
      const n = Number(src[k] || 0);
      const clamped = Math.max(0, Math.min(10, isFinite(n) ? n : 0));
      out[canon] = clamped;
    }
  }
  return out;
}


// Merender skor menjadi string "Health: 7, Academic: 8, ...".
function renderScoreDetails_(scoresObj) {
  const s = normalizeScores_(scoresObj);
  return COL_KEYS.map(k => `${k}: ${s[k]}`).join(", ");
}


const CONTEXT_COL = buildColContextString_();


/***** TONE PROFILE (global, aman dipakai di mana saja) *****/
const TONE_PROFILE = [
  "Bahasa Indonesia santai dan akrab ala chat teman asrama.",
  "Gunakan 'aku/kamu', kata ajakan 'yuk/ayo', dan bentuk santai 'ga/nggak', 'biar', 'makin'.",
  "Hangat, suportif, to the point. Hindari nada menggurui/terlalu formal.",
  "Boleh emoji secukupnya, tanpa spam tanda seru.",
  "Kadang boleh pakai gaya kasual dengan double huruf akhir (contoh: 'yaa', 'siapp', 'makasii').",
  "Jangan menyebut diri sebagai AI/robot, jangan bahas 'prompt' atau meta.",
  "Jangan pakai heading/teks tebal markdown.",
  "Jangan pakai italic markdown (_teks_ atau *teks*).",
  "Jika ada istilah tak dikenal atau terindikasi asal ketik (mis. 'qfadsgwfs'), jangan sok mendefinisikan—fokus ke langkah praktis."
].join(' ');

// Menormalkan teks AI agar konsisten dengan gaya yang diinginkan.
function normalizeCoachText_(s, name) {
  if (!s) return s;
  let out = String(s);

  // hapus heading/judul yang kadang dibikin model
  out = out.replace(/(^|\n)pesan coach untukmu.*\n?/gi, "$1");
  // hapus **bold** markdown
  out = out.replace(/\*\*(.+?)\*\*/g, "$1");
  // konsistensi sapaan
  out = out.replace(/\b[Hh]allo\b/g, "Halo");
  // rapikan spasi & baris
  out = out.replace(/[ \t]{2,}/g, " ");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/(\S)[ \t]+\n/g, "$1\n");
  out = out.replace(/(^|\s)_(.+?)_(?=\s|$)/g, "$1$2");                  // _teks_
  out = out.replace(/(^|[^\S\r\n])\*([^\*\n]+)\*(?=[^\S\r\n]|$)/g, "$1$2"); // *teks*
  // buang penutup bertanda tangan (UI sudah punya signature)
  out = out.trim();

  // Opsional: prefix "Bismillah." bila diaktifkan lewat Script Properties
  try {
    const wantB = (PropertiesService.getScriptProperties().getProperty('BISMILLAH_PREFIX') || "")
      .toLowerCase() === "true";
    if (wantB && !/^ *bismillah\b/i.test(out)) {
      out = "Bismillah.\n" + out;
    }
  } catch (e) {}

  // Pastikan ada sapaan "Halo {name},"
//  const hasGreeting = /(^|\n) *(halo|hai)\b/i.test(out);
//  if (!hasGreeting && name) {
//    if (/^ *bismillah\b/i.test(out)) {
//      out = out.replace(/^(.*\n)/i, `$1Halo ${name},\n`);
//    } else {
//      out = `Halo ${name},\n` + out;
//    }
//  }

  return out.trim();
}

// Template manual ketika Gemini tidak tersedia.
function coachTemplate_(member, scores, depth) {
  member = member || "Anak Asrama";
  const cats = Object.keys(scores || {});
  if (!cats.length) {
    return "Halo " + member + "! Coach belum dapat data skor kamu, tapi semangat terus ya. Mulai hari ini coba tulis 1 langkah kecil yang mau kamu lakukan.";
  }
  const arr = cats.map(k => ({ k, v: Number(scores[k])||0 })).sort((a,b)=>b.v-a.v);
  const top = arr.slice(0,2).map(x=>`${x.k} (${x.v})`).join(", ");
  const low = arr.slice(-2).map(x=>`${x.k} (${x.v})`).join(", ");

  const ringan =
"Halo " + member + "! Coach bangga sama kamu. Area kuatmu: " + top + ".\n" +
"Yang perlu dirawat pelan-pelan: " + low + ".\n" +
"Ambil satu langkah kecil hari ini ya—cukup 15-30 menit. Kamu nggak sendirian 💪";

  const panjang =
"Halo " + member + "! Terima kasih sudah jujur isi Circle of Life.\n" +
"Kekuatanmu ada di: " + top + ". Pertahankan dengan rutinitas singkat (15 menit-1 jam) tiap hari.\n\n" +
"Area yang butuh perhatian: " + low + ".\n" +
"Rencana 4 minggu ke depan:\n" +
"• Minggu 1 (Fondasi harian): pilih 1–2 kebiasaan mini yang paling berdampak (mis. 10–15 menit gerak ringan + 1 momen hening/tafakur). Tandai selesai tiap hari.\n" +
"• Minggu 2 (Akademik & Learning): 3x sesi fokus 25–30 menit untuk 1 mata kuliah/tema tersulit. Setelah tiap sesi, catat 1 hal yang kamu pahami lebih baik.\n" +
"• Minggu 3 (Relasi & Spirit): kontak keluarga/teman minimal 2x (obrolan bermakna), lanjutkan syukur harian (3 poin). Sisipkan dzikir/jurnal singkat 10-20 menit.\n" +
"• Minggu 4 (Review & scale up): evaluasi 3 hal yang paling membantu, pertahankan 1 kebiasaan terbaik, tambah 1 level kecil (durasi/frekuensi) yang realistis.\n\n" +
"Jaga ritme, jangan kejar sempurna. Coach percaya kamu bisa.";


  return (String(depth).toLowerCase() === "long") ? panjang : ringan;
}

// ===== Entry point utama untuk Apps Script Web App =====
function doPost(e) {
  const reqId = Utilities.getUuid();
  const t0 = Date.now();
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return _err('Body kosong atau tidak valid', { reqId });
    }

    const data = JSON.parse(e.postData.contents);

    // De-dup cache untuk submission utama (hindari double append saat retry)
    // Hanya berlaku untuk request tanpa 'action' (main submit)
    const isMainSubmit = !data.action;
    let submitSig = null;
    let submitCache = null;
    if (isMainSubmit) {
      submitSig = 'submit:' + buildSubmitSig_(data);
      submitCache = CacheService.getScriptCache();
      const prev = submitCache.get(submitSig);
      if (prev) {
        // Balikkan hasil sebelumnya (idempotent 2 menit)
        try {
          const p = JSON.parse(prev);
          return _ok({ status: 'success', reqId: p.reqId, ms: p.ms || 0, dedup: true });
        } catch (_) {
          return _ok({ status: 'success', dedup: true });
        }
      }
    }

    // ===== ROUTING BARU =====
    if (data.action === 'geminiFeedback') {
      return handleGeminiFeedback(data, reqId, t0);
    }

    if (data.action === 'logGachaPull') {
      handleGachaLog(data); // Panggil fungsi log (hanya untuk private)
      return _ok({ status: 'gacha_item_logged' });
    }
    // ===== AKHIR ROUTING BARU =====

    // Proses submission form utama
    const required = ['coach', 'anggota', 'happyStory'];
    for (const k of required) {
      if (!data[k] || String(data[k]).trim() === '') {
        throw new Error(`Field wajib "${k}" tidak boleh kosong`);
      }
    }
    
    // (Kode normalisasi skor, simpan audio, dll. tetap sama)
    const coachName = safeCell_(data.coach);
    const memberName = safeCell_(data.anggota);
    const happy = safeCell_(String(data.happyStory || '').trim());
    const sad = safeCell_(String(data.sadStory || '').trim());
    const scoresObj = normalizeScores_((data && data.scores) || data || {});
    const scoreList = COL_KEYS.map(k => scoresObj[k]);
    const audioMeta = _saveAudioIfAny(FOLDER_ID, data.audioData, data.audioMimeType, memberName);
    const audioUrl = (audioMeta && audioMeta.url) ? audioMeta.url : '';

    // Tulis ke Sheet Publik (tanpa perubahan)
    const publicRow = [new Date(), coachName, memberName, audioUrl].concat(scoreList, [happy, sad, reqId, '', '']);
    _appendRowSafe(_mustSheet(PUBLIC_SHEET_ID, SHEET_NAME), publicRow);

    // Tulis ke Sheet Private (tanpa perubahan)
    const privateRow = [new Date(), coachName, memberName, data.browserId || '', data.ipAddress || '', audioUrl].concat(scoreList, [happy, sad, reqId, '', '']);
    _appendRowSafe(_mustSheet(PRIVATE_SHEET_ID, SHEET_NAME), privateRow);

    // ===== LANGKAH BARU: Backfill reqId =====
    _backfillReqIdInGachaLog(data.sessionId, reqId);
    // Simpan cache untuk membantu log gacha tanpa reqId
    try {
      const cache = CacheService.getScriptCache();
      if (data.sessionId) cache.put('memberBySession:' + String(data.sessionId), memberName, 21600);
      cache.put('memberByReq:' + String(reqId), memberName, 21600);
    } catch (_) {}
    // Backfill MemberName ke log Gacha
    _backfillMemberInGachaLog(data.sessionId, memberName);
    // ===== AKHIR LANGKAH BARU =====

    const ms = Date.now() - t0;
    if (isMainSubmit && submitCache && submitSig) {
      try { submitCache.put(submitSig, JSON.stringify({ reqId, ms }), 120); } catch (_) {}
    }
    return _ok({ status: 'success', reqId, ms, audio: audioMeta });

  } catch (err) {
    const ms = Date.now() - t0;
    return _err(err && err.message ? String(err.message) : 'Unknown error', { reqId, ms });
  }
}

/***** Kolom & Write-back AI (PUBLIC vs PRIVATE beda posisi) *****/
// PUBLIC:  [date, coach, anggota, audioUrl, (10 skor=5..14), happy=15, sad=16, reqId=17, aiShort=18, aiLong=19]
// PRIVATE: [date, coach, anggota, browserId, ip, audioUrl, (10 skor=7..16), happy=17, sad=18, reqId=19, aiShort=20, aiLong=21]
// Memberikan mapping kolom khusus per spreadsheet (publik vs privat).
function _getColMap_(ssId) {
  if (String(ssId) === String(PRIVATE_SHEET_ID)) {
    return { REQID:19, SHORT:20, LONG:21 };
  }
  // default → PUBLIC
  return { REQID:17, SHORT:18, LONG:19 };
}
// Menambahkan kolom AI jika belum tersedia di sheet target.
function _ensureAiColumns(sheet, ssId) {
  const map = _getColMap_(ssId);
  const need = map.LONG - sheet.getLastColumn();
  if (need > 0) sheet.insertColumnsAfter(sheet.getLastColumn(), need);
}
// Menulis feedback AI (short/long) ke baris dengan reqId tertentu.
function _updateAiFeedbackByReqId(ssId, sheetName, joinReqId, which, text) {
  if (!joinReqId || !text) return false;
  const sheet = _mustSheet(ssId, sheetName);
  _ensureAiColumns(sheet, ssId);

  const map = _getColMap_(ssId);
  const values = sheet.getDataRange().getValues();

  // Jika baris pertama header dan berisi 'reqId', lewati baris 0
  let startRow = 0;
  if (values.length && String(values[0][map.REQID-1]).toLowerCase() === 'reqid') startRow = 1;

  for (let r = startRow; r < values.length; r++) {
    if (String(values[r][map.REQID-1]) === String(joinReqId)) {
      const col = (String(which).toLowerCase() === 'long') ? map.LONG : map.SHORT;
      sheet.getRange(r + 1, col).setValue(text);
      return true;
    }
  }
  return false;
}

// Baca AI feedback yang sudah ada berdasarkan reqId (cache lembar)
// Mengambil feedback dari sheet jika sudah pernah ditulis sebelumnya.
function _readAiFeedbackByReqId(ssId, sheetName, joinReqId, which) {
  if (!joinReqId) return null;
  const sheet = _mustSheet(ssId, sheetName);
  _ensureAiColumns(sheet, ssId);
  const map = _getColMap_(ssId);
  const values = sheet.getDataRange().getValues();
  const col = (String(which).toLowerCase() === 'long') ? map.LONG : map.SHORT;
  let startRow = 0;
  if (values.length && String(values[0][map.REQID-1]).toLowerCase() === 'reqid') startRow = 1;
  for (let r = startRow; r < values.length; r++) {
    if (String(values[r][map.REQID-1]) === String(joinReqId)) {
      const val = values[r][col-1];
      return (val == null ? '' : String(val)).trim() || null;
    }
  }
  return null;
}

// ===== Handler Gemini (AI Coach) =====
// Menghasilkan feedback motivasi via Gemini atau template fallback.
function handleGeminiFeedback(data, traceId, t0) {
  // Helper panggil Gemini (local)
  // Memanggil endpoint Gemini untuk model tertentu dan mengembalikan teks atau error.
  function callGemini_(model, payload, API_KEY) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
                model + ":generateContent?key=" + API_KEY;
    const res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    const code = res.getResponseCode();
    const body = res.getContentText();

    if (code >= 400) {
      try {
        const je = JSON.parse(body);
        const msg = (je && je.error && je.error.message) ? je.error.message : body.slice(0, 400);
        return { ok: false, err: "HTTP " + code + " " + msg };
      } catch (e1) {
        return { ok: false, err: "HTTP " + code + " " + body.slice(0, 400) };
      }
    }

    try {
      const j = JSON.parse(body);
      const rawText = j && j.candidates && j.candidates[0] &&
                      j.candidates[0].content && j.candidates[0].content.parts &&
                      j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text || "";
      const text = String(rawText || "").trim();
      if (!text) return { ok: false, err: "Empty candidates from Gemini" };
      return { ok: true, text };
    } catch (e2) {
      return { ok: false, err: "Invalid JSON from Gemini: " + body.slice(0, 300) };
    }
  }

  const started = t0 || Date.now();
  let text = "", modeUsed = "live";
  const triedModels = [];

  try {
    // Ambil input
    const depth  = String(data && data.depth || 'short').toLowerCase() === 'long' ? 'long' : 'short';
    const member = (data && data.memberNickName) || "Anak Asrama";
    const coach  = (data && data.coachNickName)  || "Coach";
    // Pakai helper agar urutan & format konsisten
    const scores = normalizeScores_((data && data.scores) || data || {});
  const scoreDetails = renderScoreDetails_(scores);
    const happy = String((data && data.happyStory) || '').trim();
    const sad   = String((data && data.sadStory)   || '').trim();

    // Dummy toggle (Script Properties atau flag request)
    const dummyFlagProp  = (PropertiesService.getScriptProperties().getProperty('GEMINI_DUMMY') || "").toLowerCase() === "true";
    const dummyFlagInput = !!(data && (data.forceDummy === true || data.dummy === true));
    const useDummy = dummyFlagProp || dummyFlagInput;

    // Bangun prompt (EXTRA/BISMILLAH via Script Properties)
    const EXTRA = (PropertiesService.getScriptProperties().getProperty('TONE_PROFILE_EXTRA') || "").trim();
    const BISMILLAH = (PropertiesService.getScriptProperties().getProperty('BISMILLAH_PREFIX') || "")
      .toLowerCase() === "true";

    const FORMAT_HINT_SHORT = BISMILLAH
      ? "Mulai dengan 'Bismillah.' di baris 1 + apresiasi singkat."
      : "Baris 1: sapaan + apresiasi singkat.";
    const FORMAT_HINT_LONG = BISMILLAH
      ? "Mulai dengan 'Bismillah.' di baris 1. Buat rencana 4 minggu (Minggu 1–4) dengan butir • yang realistis (15-45 menit/hari)."
      : "Buat rencana 4 minggu (Minggu 1–4) dengan butir • yang realistis (15-45 menit/hari).";
      
    const styleShort = TONE_PROFILE + (EXTRA ? (" " + EXTRA) : "") +
      " Format: 3–6 baris. Baris 1: sapaan + apresiasi singkat; " +
      "Baris 2–4: soroti area yang terasa paling menantang dengan kata-kata dukungan dan afirmasi positif; " +
      "baris akhir: ajakan ringan penuh semangat, jangan lupa panggil dengan nama panggilannya.";

    const styleLong = TONE_PROFILE + (EXTRA ? (" " + EXTRA) : "") +
      " Format: " + FORMAT_HINT_LONG + 
      " Setiap minggu: soroti fokus utama dengan kata-kata dukungan dan afirmasi positif, " +
      "lalu sisipkan 1–2 langkah konkret yang ringan dan realistis (≤15–45 menit/hari). " +
      "Hindari heading dan tanda tangan.";

    const systemPrompt = CONTEXT_COL + "\n\n" + "Kamu adalah coach asrama bernama Coach " + coach + ". " +
      (depth === 'long' ? styleLong : styleShort);

    const userPrompt =
      "Nama panggilan: " + member + ".\n" +
      "Skor Circle of Life (1–10): " + scoreDetails + ".\n" +
      "Yang lagi bikin seneng: " + (happy || "-") + ".\n" +
      "Yang lagi berat: " + (sad   || "-") + ".\n" +
      "Mode: " + depth.toUpperCase() + ".\n" +
      "Ingat: jangan mulai dengan heading/basa-basi; langsung hangat, akrab, dan praktis.";

    const payload = { contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }] };

    // Cek cache lembar: jika aiShort/aiLong sudah ada untuk reqId, kembalikan langsung
    const joinReqId = (data && (data.reqId || data.joinReqId || data.reqIdOriginal)) || null;
    if (joinReqId) {
      const existing = _readAiFeedbackByReqId(PUBLIC_SHEET_ID, SHEET_NAME, joinReqId, depth) ||
                       _readAiFeedbackByReqId(PRIVATE_SHEET_ID, SHEET_NAME, joinReqId, depth);
      if (existing) {
        const ms0 = Date.now() - (t0 || started);
        return _ok({ status: "success", reqId: traceId, depth, joinReqId, ms: ms0, feedbackText: existing, debug: { mode: "sheet-cache" } });
      }
    }

    if (useDummy) {
      // Mode DUMMY → tidak panggil API
      modeUsed = "dummy";
      Utilities.sleep(200 + Math.floor(Math.random() * 400));
      text = coachTemplate_(member, scores, depth);
    } else {
      // Mode LIVE → panggil Gemini dengan fallback
      const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
      if (!API_KEY) {
        modeUsed = "template";
        text = coachTemplate_(member, scores, depth);
      } else {
        const candidates = [
          "gemini-2.5-pro",
          "gemini-2.5-flash-preview-05-20",
          "gemini-1.5-flash-latest",
          "gemini-1.5-flash-8b-latest"
        ];
        let lastErr = "";
        for (let i = 0; i < candidates.length; i++) {
          const mdl = candidates[i];
          triedModels.push(mdl);
          const r = callGemini_(mdl, payload, API_KEY);
          if (r.ok) { text = r.text; modeUsed = "live"; break; }
          lastErr = r.err;
        }
        if (!text) {
          modeUsed = "template";
          text = coachTemplate_(member, scores, depth);
        }
      }
    }

    // Normalisasi output agar gaya konsisten
    if (typeof normalizeCoachText_ === "function") {
      text = normalizeCoachText_(text, member);
    }
    text = String(text || "").trim();

    // Write-back ke Sheets
    try {
      if (joinReqId) {
        _updateAiFeedbackByReqId(PUBLIC_SHEET_ID,  SHEET_NAME, joinReqId, depth, text);
        _updateAiFeedbackByReqId(PRIVATE_SHEET_ID, SHEET_NAME, joinReqId, depth, text);
      }
    } catch (wbErr) {
      // Abaikan penulisan ulang yang gagal pada versi edukasi.
    }

    const ms = Date.now() - (t0 || started);
    return _ok({
      status: "success",
      reqId: traceId,
      depth: depth,
      joinReqId: joinReqId,
      ms: ms,
      feedbackText: text,
      debug: {
        mode: modeUsed,
        dummy: useDummy,
        apiKeyPresent: !!PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY'),
        tried: triedModels,
        happyLen: (happy || "").length,
        sadLen: (sad || "").length
      }
    });

  } catch (err) {
    // Worst case: tetap pulangkan template agar UI tidak menggantung
    const depth2 = String(data && data.depth || 'short').toLowerCase() === 'long' ? 'long' : 'short';
    const member2 = (data && data.memberNickName) || "Anak Asrama";
    const scores2 = normalizeScores_((data && data.scores) || data || {});
    const fallback = coachTemplate_(member2, scores2, depth2);
    return _ok({
      status: "success",
      reqId: traceId,
      depth: depth2,
      joinReqId: (data && (data.reqId || data.joinReqId || null)),
      ms: 0,
      feedbackText: fallback,
      debug: { mode: "template-catch", dummy: false }
    });
  }
}

// Menjalankan self-test konektivitas Gemini dari editor Apps Script.
function geminiFeedbackSelfTestAll() {
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const started = Date.now();
  const models = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-8b-latest"
  ];

  const payload = {
    contents: [{ role: "user", parts: [{ text: "Say \"pong\" if you can read this. (Connectivity self-test)"}] }]
  };

  const results = [];
  if (!API_KEY) {
    const miss = { ok:false, model:"(n/a)", code:0, ms:0, error:"GEMINI_API_KEY not found in Script Properties." };
    return { ok: false, anySuccess: false, apiKeyPresent: false, totalMs: Date.now() - started, tried: [], results: [miss] };
  }

  models.forEach(function(model){
    const t0 = Date.now();
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + API_KEY;
    let res, code, body;
    const out = { ok:false, model:model, code:0, ms:0 };
    try {
      res = UrlFetchApp.fetch(url, { method:"post", contentType:"application/json", payload: JSON.stringify(payload), muteHttpExceptions:true });
      code = res.getResponseCode(); body = res.getContentText();
      out.code = code; out.ms = Date.now() - t0;

      if (code >= 400) {
        try { const je = JSON.parse(body); out.error = (je && je.error && je.error.message) ? je.error.message : body.slice(0, 400); }
        catch(e) { out.error = body.slice(0, 400); }
      } else {
        try {
          const j = JSON.parse(body);
          const txt = j && j.candidates && j.candidates[0] && j.candidates[0].content &&
                      j.candidates[0].content.parts && j.candidates[0].content.parts[0] &&
                      j.candidates[0].content.parts[0].text || "";
          out.ok = !!txt;
          out.textSnippet = (txt || "").slice(0, 300);
          if (!out.ok) out.error = "Empty candidates from Gemini";
        } catch(e2) { out.error = "Invalid JSON from Gemini: " + body.slice(0, 300); }
      }
    } catch (err) { out.ms = Date.now() - t0; out.error = String(err && err.message || err); }
    out.hint = classifyGeminiErrorHint_(out);
    results.push(out);
  });

  const anySuccess = results.some(r => r.ok);
  const summary = { ok: anySuccess, anySuccess, apiKeyPresent: true, totalMs: Date.now() - started, tried: models, results };
  return summary;
}
// Menjalankan quick-test Gemini untuk satu model.
function geminiFeedbackSelfTest(model, message) {
  const mdl = model || "gemini-2.5-pro";
  const msg = message || "Say \"pong\" if you can read this.";
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!API_KEY) throw new Error("GEMINI_API_KEY not found in Script Properties.");

  const payload = { contents: [{ role: "user", parts: [{ text: msg }] }] };
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + mdl + ":generateContent?key=" + API_KEY;

  const t0 = Date.now();
  const res = UrlFetchApp.fetch(url, { method:"post", contentType:"application/json", payload: JSON.stringify(payload), muteHttpExceptions:true });
  const code = res.getResponseCode();
  const body = res.getContentText();
  const out = { model: mdl, code, ms: Date.now() - t0, ok: false };

  if (code >= 400) {
    try { const je = JSON.parse(body); out.error = (je && je.error && je.error.message) ? je.error.message : body.slice(0, 400); }
    catch(e) { out.error = body.slice(0, 400); }
  } else {
    try {
      const j = JSON.parse(body);
      const txt = j && j.candidates && j.candidates[0] && j.candidates[0].content &&
                  j.candidates[0].content.parts && j.candidates[0].content.parts[0] &&
                  j.candidates[0].content.parts[0].text || "";
      out.ok = !!txt;
      out.textSnippet = (txt || "").slice(0, 300);
      if (!out.ok) out.error = "Empty candidates from Gemini";
    } catch(e2) { out.error = "Invalid JSON from Gemini: " + body.slice(0, 300); }
  }
  out.hint = classifyGeminiErrorHint_(out);
  return out;
}
// Memberikan hint troubleshooting berdasarkan respon Gemini.
function classifyGeminiErrorHint_(res) {
  if (!res) return "";
  if (res.code === 401 || /API key/i.test(res.error||"")) return "🔑 Cek GEMINI_API_KEY atau project API access.";
  if (res.code === 403) return "🚫 Forbidden (quotas/permissions). Cek enable API & akses key.";
  if (res.code === 404 || /not found|unknown model/i.test(res.error||"")) return "🔎 Model tidak tersedia untuk key/region.";
  if (res.code === 429 || /rate limit|quota/i.test(res.error||"")) return "⏱️ Rate limit/kuota. Coba retry / model lain.";
  if (res.code >= 500 || /internal error/i.test(res.error||"")) return "🛠️ Server internal error (coba model stabil).";
  if (/Empty candidates/i.test(res.error||"")) return "💬 Respon kosong (cek payload & model).";
  if (/Invalid JSON/i.test(res.error||"")) return "📦 Respon bukan JSON valid (debug endpoint).";
  return "";
}
