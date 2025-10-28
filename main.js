// --- Konstanta dan Variabel Global ---
const WEB_APP_URL = 'https://your-backend-endpoint.example.com';
const GACHA_SFX_URL_BASE = "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/";
const coachingData = { "Astra": { "Master Andrew": { gif: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/1.gif", anggota: ["Uwais", "Hafizh", "Daffa", "Galang", "Icad"]}, "Master Brimo": { gif: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/2.gif", anggota: ["Aep", "Ilham", "Ditok", "Yazid", "Irshad"]}, "Master Zhorof": { gif: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/3.gif", anggota: ["Dio", "Mamad", "Alif", "Aji", "Aufa"]}, "Master Bear": { gif: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/4.gif", anggota: ["Zamil", "Riki", "Hanif", "Tahmid", "Hamdan"]} }, "Astir": { "Master Nads": { gif: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/5.gif", anggota: ["Aqeela", "Aza", "Berlia", "Haura", "Arin"]}, "Master Green": { gif: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/6.gif", anggota: ["Izza", "Tifa", "Khansa", "Nabila", "Aliynt"]}, "Master Emily": { gif: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/7.gif", anggota: ["Zulfa", "Kuny", "Nisa", "Jidah", "Maisya"]}, "Master Mars": { gif: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/8.gif", anggota: ["Yara", "Annisa", "Raudah", "Aisyah", "Raisya"]} } };
const coachSignatures = { "Master Andrew": "Andre", "Master Zhorof": "Zhorif", "Master Brimo": "Bara", "Master Bear": "Bey", "Master Nads": "Nadia", "Master Mars": "Marsaa", "Master Emily": "Amal", "Master Green": "Aspi" };
const coachThemes = { "Master Andrew": { bgStart: "#141e30", bgEnd: "#35577d", containerStart: "#35577d", containerEnd: "#141e30", shadow: "rgba(0, 0, 0, 0.3)" }, "Master Brimo":  { bgStart: "#2d1e2f", bgEnd: "#4e2a4f", containerStart: "#4e2a4f", containerEnd: "#2d1e2f", shadow: "rgba(0, 0, 0, 0.15)" }, "Master Zhorof": { bgStart: "#3f1d38", bgEnd: "#af5279", containerStart: "#af5279", containerEnd: "#3f1d38", shadow: "rgba(0, 0, 0, 0.15)" }, "Master Bear":   { bgStart: "#2c3e50", bgEnd: "#b08d57", containerStart: "#b08d57", containerEnd: "#2c3e50", shadow: "rgba(0, 0, 0, 0.3)" }, "Master Nads":   { bgStart: "#2e1f18", bgEnd: "#5e4b43", containerStart: "#5e4b43", containerEnd: "#2e1f18", shadow: "rgba(0, 0, 0, 0.3)" }, "Master Green":  { bgStart: "#0f2027", bgEnd: "#28623a", containerStart: "#28623a", containerEnd: "#0f2027", shadow: "rgba(0, 0, 0, 0.3)" }, "Master Emily":  { bgStart: "#2c0f12", bgEnd: "#681e23", containerStart: "#681e23", containerEnd: "#2c0f12", shadow: "rgba(0, 0, 0, 0.3)" }, "Master Mars":   { bgStart: "#3e2f5b", bgEnd: "#e94560", containerStart: "#e94560", containerEnd: "#3e2f5b", shadow: "rgba(0, 0, 0, 0.3)" } };
const musicTracks = [ { title: "Ballad of Many Waters",       url: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/music1.mp3" }, { title: "Clement Rillet",              url: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/music2.mp3" }, { title: "Nocturnal Illumination",      url: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/music3.mp3" }, { title: "Ann's Quiescent Residence",   url: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/music4.mp3" } ];
const murottalTracks = [ { title: "QS. As-Shaf",     url: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/murottal1.mp3" }, { title: "QS. Al-Jumu'ah",  url: "https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/murottal2.mp3" } ];
const svgIcons = { play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>', pause: '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>', murottalPlay: '<svg viewBox="0 0 24 24" style="width:18px; height:18px; margin-right:8px;"><path d="M8 5v14l11-7z"></path></svg>' };
const commonMotivations = [ 'Onde Monday' ];
const deepMotivations = [ 'Asik dapet B5 nih' ];

// Variabel State
let myChart = null, selectedCoach = null, selectedMember = null, submitBtn = null, statusMessage = null, contextModal = null, averageMessageElement = null;
let mediaRecorder;
let audioChunks = [];
let audioBase64 = null;
let lastReqId = null;
let currentPageId = 'page-coach-selection';

// --- Variabel Gacha (Global) ---
let gachaOverlay, gachaBgVideo, gachaR4Video, gachaR5Video, gachaFab, gachaMessage;
let gachaControlPanel, gachaIdleControls, gachaResultControls, gachaPullBtn, gachaBackBtn, gachaPullAgainBtn, gachaBackFromResultBtn;
let gachaProgressContainer, gachaProgressText, gachaProgressBar;
let gachaResultContainer, gachaResultItem, gachaResultStars;
let canCloseGacha = false;
let hideGachaOverlay;

// === Inventory state (per-session) ===
let gachaInventory = {};
let inventoryModal, inventoryListEl, inventoryEmptyEl, invOpenBtnIdle, invOpenBtnResult, invCloseBtn;

// Menghasilkan kunci penyimpanan inventory berdasarkan sesi browser.
function getInventoryStorageKey() {
  return 'gachaInventory:' + getSessionId();
}
// Membaca inventory gacha dari sessionStorage.
function loadInventory() {
  try { gachaInventory = JSON.parse(sessionStorage.getItem(getInventoryStorageKey()) || '{}') || {}; }
  catch { gachaInventory = {}; }
}
// Menyimpan inventory gacha saat ini ke sessionStorage.
function saveInventory() {
  try { sessionStorage.setItem(getInventoryStorageKey(), JSON.stringify(gachaInventory)); } catch(_) {}
}
// Menghitung jumlah item total di inventory pemain.
function getTotalInventoryCount() {
  return Object.values(gachaInventory).reduce((sum, v) => sum + (v?.count || 0), 0);
}
// Memperbarui label tombol inventory berdasarkan isi.
function updateInventoryButtons() {
  const total = getTotalInventoryCount();
  const label = total > 0 ? `Inventory (${total})` : 'Inventory';
  if (invOpenBtnIdle) invOpenBtnIdle.textContent = label;
  if (invOpenBtnResult) invOpenBtnResult.textContent = label;
}
// Merender daftar item gacha ke modal inventory.
function renderInventory() {
  if (!inventoryListEl) return;
  inventoryListEl.innerHTML = '';
  const entries = Object.entries(gachaInventory);
  const hasItems = entries.length > 0;
  if (inventoryEmptyEl) inventoryEmptyEl.style.display = hasItems ? 'none' : 'block';
  if (!hasItems) return;
  entries.forEach(([src, info]) => {
    const card = document.createElement('div');
    card.className = 'inv-card';
    const wrap = document.createElement('div');
    wrap.className = 'inv-img-wrap';
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'item';
    wrap.appendChild(img);
    const cnt = document.createElement('div');
    cnt.className = 'inv-count';
    cnt.textContent = `Jumlah: ${info?.count || 0}`;
    card.appendChild(wrap);
    card.appendChild(cnt);
    inventoryListEl.appendChild(card);
  });
}
// Membuka modal inventory dan memuat kontennya.
function openInventory() {
  if (!inventoryModal) return;
  renderInventory();
  inventoryModal.style.display = 'flex';
}
// Menutup modal inventory.
function closeInventory() {
  if (!inventoryModal) return;
  inventoryModal.style.display = 'none';
}
// Menambahkan item gacha yang baru diperoleh ke inventory.
function addToInventory(itemSrc) {
  const key = itemSrc;
  if (!gachaInventory[key]) gachaInventory[key] = { src: itemSrc, count: 0 };
  gachaInventory[key].count += 1;
  saveInventory();
  updateInventoryButtons();
  if (inventoryModal && inventoryModal.style.display === 'flex') renderInventory();
}

// State Machine Sederhana untuk Gacha 
const GACHA_STATE = {
    IDLE: 'IDLE',           // Overlay tertutup
    LOADING: 'LOADING',     // Overlay terbuka, aset sedang di-load
    READY: 'READY',         // Aset siap, menunggu user klik "Pull!"
    PULLING: 'PULLING',     // Animasi "ing" sedang berjalan
    RESULT: 'RESULT',       // Hasil ditampilkan
};
let currentGachaState = GACHA_STATE.IDLE;

// Daftar Aset Gacha untuk Preloader [cite: 43]
const gachaAssetPool = {
    videos: [
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/wish_ing_rarity4.webm',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/wish_ing_rarity5.webm'
    ],
    audios: [
        'wish_results_4.MP3',
        'wish_results_5.MP3'
    ],
    images: [
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/gacha_settle.webp',
        // R4 Items [cite: 102]
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/mic-asli-mihrab_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/kucing-sholat_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/afgan-singer_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/brainrot_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/muachh_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/hoax_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/kalkulator_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/uchiha-asep_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/kecewa_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/gas-astra_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/wahyu_4.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/siapa-piket-woi_4.png',
        // R5 Items [cite: 104]
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/and-li_5.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/nahibar_5.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/zhormouche_5.png',
        'https://github.com/AndrerezaMedya/surveyhth/raw/refs/heads/main/cybey_5.png',
    ]
};
const gachaItemPool = {
    R4: gachaAssetPool.images.filter(url => url.includes('_4.png')),
    R5: gachaAssetPool.images.filter(url => url.includes('_5.png'))
};

// Variabel Audio (Howler)
let music;
let sfx;
let musicPlayerState = {
	currentTrackId: null,
	currentTrackType: 'music',
	currentTrackIndex: 0,
	isPlaying: false,
};
const sliderSounds = [];

// --- Inisialisasi Aplikasi ---
document.addEventListener('DOMContentLoaded', initializeApp);

// Mengatur seluruh komponen UI saat DOM siap.
function initializeApp() {
	initializeAudio();
	setupEventListeners();
	setupGacha();
	setupPlayerPanel();
	setupStandaloneThemeToggle();

	
	gsap.set(document.getElementById(currentPageId), { opacity: 1, visibility: 'visible' });
	
	// Inisialisasi elemen DOM global
	submitBtn = document.getElementById('submitBtn');
	statusMessage = document.getElementById('status-message');
	contextModal = document.getElementById('context-modal');
	averageMessageElement = document.getElementById('average-message-mobile');

	// Sembunyikan gacha saat awal
	toggleGachaVisibility(false);
}

// rollback: remove theme dropdown logic


// Menampilkan hint gacha sekali tiap sesi agar pemain sadar fitur ini.
function showGachaHintOnce() {
  try {
    // Selalu tampil tiap refresh (seperti music-hint)
    // formerly gated by sessionStorage; removed per request

    const hint = document.getElementById('gacha-hint-popup');
    if (!hint) return;
    // Set teks setiap kali (hindari teks lama/korup)
    try { hint.textContent = '\uD83D\uDC47 cobain gachanya!'; } catch(_) {}

    // Set teks sesuai permintaan
    try { hint.textContent = '👇 cobain gachanya!'; } catch(_) {}

    // Tunda sedikit (meniru pola music-hint-popup)
    setTimeout(() => {
      hint.classList.add('show');
      setTimeout(() => {
        hint.classList.remove('show');
      }, 5000); // tampil ±5 detik
    }, 1500);
  } catch (e) {
    console.warn('showGachaHintOnce error:', e);
  }
}

// Menyembunyikan atau menampilkan tombol/floating hint gacha.
function toggleGachaVisibility(show) {
  const btn  = document.getElementById('gacha-access-btn');
  const hint = document.getElementById('gacha-hint-popup');
  if (btn)  btn.style.display  = show ? 'inline-flex' : 'none';
  if (hint) {
    hint.style.display = show ? 'block' : 'none';
    // Fallback trigger: jika baru masuk Happy Story dan belum tampilkan hint di sesi ini
    if (show && currentPageId === 'page-happy-story' && sessionStorage.getItem('gachaHintShownSession') !== '1') {
      try { showGachaHintOnce(); } catch(_) {}
    }
  }
}

// --- FUNGSI YANG HILANG ---
// Mendapat fingerprint unik pengunjung via FingerprintJS.
async function getFingerprintId() {
	const fp = await FingerprintJS.load();
	const result = await fp.get();
	return result.visitorId;
}
// ----------------------------

// Menyiapkan semua efek suara dan musik latar menggunakan Howler.js.
function initializeAudio() {
	const SLIDER_URL_BASE = 'https://raw.githubusercontent.com/AndrerezaMedya/balladofmanywaters/main/';
	sfx = {
		btnClick: new Howl({ src: [`${GACHA_SFX_URL_BASE}btn_accepted.mp3`] }),
		btnAccepted: new Howl({ src: [`${GACHA_SFX_URL_BASE}btn_accepted.mp3`] }),
		rarity4: new Howl({ src: [`${GACHA_SFX_URL_BASE}wish_rarity_4.MP3`] }),
		rarity5: new Howl({ src: [`${GACHA_SFX_URL_BASE}wish_rarity_5.MP3`] }),
		results4: new Howl({ src: [`${GACHA_SFX_URL_BASE}wish_results_4.MP3`] }),
		results5: new Howl({ src: [`${GACHA_SFX_URL_BASE}wish_results_5.MP3`] }),
		coachHover: new Howl({ src: [`${SLIDER_URL_BASE}3.MP3`] }),
		memberHover: new Howl({ src: [`${SLIDER_URL_BASE}2.MP3`] }),
		selectClick: new Howl({ src: [`${SLIDER_URL_BASE}9.MP3`] }),
		cancelClick: new Howl({ src: [`${SLIDER_URL_BASE}4.MP3`] }),
		confirmClick: new Howl({ src: [`${SLIDER_URL_BASE}9.MP3`] })
	};
	
	// Preload slider sounds
	['1.MP3', '2.MP3', '3.MP3', '5.MP3', '6.MP3', '7.MP3', '1.MP3', '6.MP3', '2.MP3', '7.MP3'].forEach(file => {
		sliderSounds.push(new Howl({ src: [`${SLIDER_URL_BASE}${file}`] }));
	});
	
	loadTrack('music', 0, false);

	document.body.addEventListener('click', function unlockAudio() {
		if (Howler.ctx.state !== 'running') {
			Howler.ctx.resume();
		}
		if (music && !music.playing() && musicPlayerState.isPlaying === false) {
			togglePlayPause();
		}
		document.body.removeEventListener('click', unlockAudio);
	}, { once: true });
}

// Memuat track musik atau murottal tertentu lalu memutarnya jika diminta.
function loadTrack(type, index, shouldPlay = true) {
	if (music) {
		music.stop();
		music.unload();
	}

	const trackList = type === 'music' ? musicTracks : murottalTracks;
	const track = trackList[index];

	music = new Howl({
		src: [track.url],
		html5: true,
		loop: type === 'music',
		volume: 0.5,
		onend: function() {
			if (musicPlayerState.currentTrackType === 'music') {
				playNextMusic();
			} else {
				musicPlayerState.isPlaying = false;
				updatePlayerUI();
			}
		}
	});

	musicPlayerState.currentTrackType = type;
	musicPlayerState.currentTrackIndex = index;

	if (shouldPlay) {
		musicPlayerState.currentTrackId = music.play();
		musicPlayerState.isPlaying = true;
	} else {
		musicPlayerState.isPlaying = false;
	}

	updatePlayerUI();
}

// Mengganti status play/pause musik aktif.
function togglePlayPause() {
	if (!music) return;
	if (music.playing()) {
		music.pause();
		musicPlayerState.isPlaying = false;
	} else {
		musicPlayerState.currentTrackId = music.play();
		musicPlayerState.isPlaying = true;
	}
	updatePlayerUI();
}

// Melompat ke track musik berikutnya.
function playNextMusic() {
	let newIndex = musicPlayerState.currentTrackIndex + 1;
	if (newIndex >= musicTracks.length) newIndex = 0;
	loadTrack('music', newIndex);
}

// Melompat ke track musik sebelumnya.
function playPrevMusic() {
	let newIndex = musicPlayerState.currentTrackIndex - 1;
	if (newIndex < 0) newIndex = musicTracks.length - 1;
	loadTrack('music', newIndex);
}

// Menyinkronkan judul dan ikon kontrol player dengan status saat ini.
function updatePlayerUI() {
	const playPauseBtn = document.getElementById('play-pause-btn');
	const trackTitleEl = document.getElementById('current-track-title');
	const trackList = musicPlayerState.currentTrackType === 'music' ? musicTracks : murottalTracks;
	const track = trackList[musicPlayerState.currentTrackIndex];
	
	if (track) trackTitleEl.textContent = track.title;
	if (playPauseBtn) playPauseBtn.innerHTML = musicPlayerState.isPlaying ? svgIcons.pause : svgIcons.play;

	const murottalBtns = document.querySelectorAll('.murottal-btn');
	murottalBtns.forEach((btn, index) => {
		const isSelected = musicPlayerState.currentTrackType === 'murottal' && index === musicPlayerState.currentTrackIndex;
		btn.classList.toggle('selected', isSelected);
	});
}

// Mengikat semua elemen UI gacha dan event yang dibutuhkan.
function setupGacha() {
    // Inisialisasi elemen DOM
    gachaOverlay = document.getElementById('gacha-overlay');
    gachaBgVideo = document.getElementById('gacha-background');
    gachaSettleBg = document.getElementById('gacha-settle-bg');
    gachaR4Video = document.getElementById('gacha-ing-r4');
    gachaR5Video = document.getElementById('gacha-ing-r5');
    gachaFab = document.getElementById('gacha-access-btn');

    gachaControlPanel = document.getElementById('gacha-control-panel');
    gachaIdleControls = document.getElementById('gacha-idle-controls');
    gachaResultControls = document.getElementById('gacha-result-controls');
    gachaPullBtn = document.getElementById('gacha-pull-btn');
    gachaBackBtn = document.getElementById('gacha-back-btn');
    gachaPullAgainBtn = document.getElementById('gacha-pull-again-btn');
    gachaBackFromResultBtn = document.getElementById('gacha-back-from-result-btn');
    // Inventory elements
    invOpenBtnIdle = document.getElementById('gacha-inventory-open-idle');
    invOpenBtnResult = document.getElementById('gacha-inventory-open-result');
    inventoryModal = document.getElementById('gacha-inventory-modal');
    inventoryListEl = document.getElementById('gacha-inventory-list');
    inventoryEmptyEl = document.getElementById('inventory-empty');
    invCloseBtn = document.getElementById('gacha-inventory-close');

    gachaProgressContainer = document.getElementById('gacha-progress-container');
    gachaProgressText = document.getElementById('gacha-progress-text');
    gachaProgressBar = document.getElementById('gacha-progress-bar');

    gachaResultContainer = document.getElementById('gacha-result-container');
    gachaResultItem = document.getElementById('gacha-result-item');
    gachaResultStars = document.getElementById('gacha-result-stars');

    // Memasang event listener
    gachaFab.addEventListener('click', openGachaIdle);
    gachaBackBtn.addEventListener('click', closeGachaOverlay);
    gachaBackFromResultBtn.addEventListener('click', closeGachaOverlay);
    gachaPullBtn.addEventListener('click', startPullAnimation);
    gachaPullAgainBtn.addEventListener('click', resetToIdle);

    gachaOverlay.addEventListener('click', (e) => {
        if (e.target === gachaOverlay && currentGachaState === GACHA_STATE.RESULT) {
            closeGachaOverlay();
        }
    });

    // Inventory events & init
    loadInventory();
    updateInventoryButtons();
    if (invOpenBtnIdle) invOpenBtnIdle.addEventListener('click', openInventory);
    if (invOpenBtnResult) invOpenBtnResult.addEventListener('click', openInventory);
    if (invCloseBtn) invCloseBtn.addEventListener('click', closeInventory);
    if (inventoryModal) inventoryModal.addEventListener('click', (ev) => {
      if (ev.target === inventoryModal) closeInventory();
    });
}

// Menyelaraskan tampilan tombol/overlay berdasarkan state gacha.
function updateGachaUI() {
    // Fungsi terpusat untuk mengontrol visibilitas UI berdasarkan state
    gachaProgressContainer.style.display = currentGachaState === GACHA_STATE.LOADING ? 'block' : 'none';
    gachaIdleControls.classList.toggle('hidden', currentGachaState !== GACHA_STATE.LOADING && currentGachaState !== GACHA_STATE.READY);
    gachaResultControls.classList.toggle('hidden', currentGachaState !== GACHA_STATE.RESULT);
    gachaResultContainer.classList.toggle('hidden', currentGachaState !== GACHA_STATE.PULLING && currentGachaState !== GACHA_STATE.RESULT);

    gachaPullBtn.disabled = currentGachaState !== GACHA_STATE.READY;
}

// Membuka overlay gacha dari kondisi idle dan menyiapkan preloading.
function openGachaIdle() {
    if (currentGachaState !== GACHA_STATE.IDLE) return;

    currentGachaState = GACHA_STATE.LOADING;
    gachaOverlay.style.display = 'flex';
    gachaBgVideo.currentTime = 0;
    gachaBgVideo.play().catch(e => console.error("Gacha BG video failed to play:", e));
    
    if (music && music.playing()) music.pause();

    updateGachaUI();
    preloadGachaAssets();
}

// Menutup overlay gacha dan mereset state visual.
function closeGachaOverlay() {
    currentGachaState = GACHA_STATE.IDLE;
    gachaOverlay.style.display = 'none';

    // Reset semua media
    [gachaBgVideo, gachaR4Video, gachaR5Video].forEach(v => {
        if (v) { v.pause(); v.currentTime = 0; }
    });
    gachaSettleBg.style.opacity = 0;
    gachaResultItem.classList.remove('reveal');

    if (music && !music.playing()) music.play();
    updateGachaUI();

    // Pastikan inventory tertutup saat keluar overlay
    closeInventory();
}

// Mengembalikan UI gacha ke state siap-tarik setelah hasil ditutup.
function resetToIdle() {
    currentGachaState = GACHA_STATE.READY;
    gachaSettleBg.style.opacity = 0;
    gachaBgVideo.play();
    gachaResultItem.classList.remove('reveal');
    gachaResultItem.src = '';
    gachaResultStars.innerHTML = '';
    updateGachaUI();
}

// Memuat seluruh aset gacha agar animasi tidak tersendat saat dimainkan.
function preloadGachaAssets() {
    const allAssets = [...gachaAssetPool.videos, ...gachaAssetPool.images];
    const totalAssets = allAssets.length;
    let loadedAssets = 0;

    const assetLoaded = () => {
        loadedAssets++;
        const progress = Math.round((loadedAssets / totalAssets) * 100);
        gachaProgressText.textContent = `Loading... ${progress}%`;
        gachaProgressBar.style.width = `${progress}%`;

        if (loadedAssets === totalAssets) {
            currentGachaState = GACHA_STATE.READY;
            updateGachaUI();
        }
    };
    
    // Preload Videos
    gachaAssetPool.videos.forEach(src => {
        const video = document.createElement('video');
        video.oncanplaythrough = assetLoaded;
        video.onerror = () => { console.error(`Failed to load video: ${src}`); assetLoaded(); }; // Tetap lanjut walau error
        video.src = src;
    });

    // Preload Images
    gachaAssetPool.images.forEach(src => {
        const img = new Image();
        img.onload = assetLoaded;
        img.onerror = () => { console.error(`Failed to load image: ${src}`); assetLoaded(); };
        img.src = src;
    });

    // Audio sudah di-handle oleh Howler, kita anggap cepat
}

// Menghasilkan sessionId stabil untuk menghubungkan aksi user.
function getSessionId() {
    let sessionId = sessionStorage.getItem('hthSessionId');
    if (!sessionId) {
        // Buat ID unik sederhana jika belum ada
        sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        sessionStorage.setItem('hthSessionId', sessionId);
    }
    return sessionId;
}

// Memulai animasi gacha dan memilih item secara pseudo-random.
function startPullAnimation() {
    if (currentGachaState !== GACHA_STATE.READY) return;

    currentGachaState = GACHA_STATE.PULLING;
    updateGachaUI();
    gachaPullBtn.textContent = "Menarik...";
    gachaPullBtn.disabled = true;

    const isR5 = Math.random() < 0.1;
    const rarity = isR5 ? 5 : 4;
    const video = isR5 ? gachaR5Video : gachaR4Video;
    const resultsSfx = isR5 ? sfx.results5 : sfx.results4;
    const itemPool = isR5 ? gachaItemPool.R5 : gachaItemPool.R4;
    const selectedItem = itemPool[Math.floor(Math.random() * itemPool.length)];

	// ===== PANGGIL FUNGSI LOG DI SINI =====
	logGachaPull(selectedItem.split('/').pop(), rarity); // Ambil nama file saja

    gachaBgVideo.pause();
    video.style.display = 'block';
    video.currentTime = 0;

    video.play().catch(e => {
        console.error("Video play failed:", e);
    });

    const raritySfx = isR5 ? sfx.rarity5 : sfx.rarity4;
    raritySfx.play();

    let transitionStarted = false;

    const triggerTransition = () => {
        if (transitionStarted) return;
        transitionStarted = true;

        video.removeEventListener('timeupdate', checkTime);
        video.removeEventListener('loadedmetadata', setupTimeCheck);
        video.onended = null;

        video.style.display = 'none';
        gachaSettleBg.style.opacity = 1;
        resultsSfx.play();
        showGachaResult(selectedItem, rarity, resultsSfx);
    };

    const checkTime = () => {
        if (!isNaN(video.duration) && video.currentTime >= video.duration - 0.25) {
            triggerTransition();
        }
    };

    const setupTimeCheck = () => {
        video.addEventListener('timeupdate', checkTime);
    };

    video.removeEventListener('loadedmetadata', setupTimeCheck);
    video.addEventListener('loadedmetadata', setupTimeCheck);
    video.onended = triggerTransition;
}

// Mengirim catatan hasil gacha ke backend untuk analitik.
async function logGachaPull(itemName, rarity) {
    try {
        const visitorId = await getFingerprintId(); // Tetap ambil fingerprintId
        const sessionId = getSessionId(); // Ambil sessionId yang stabil

        const payload = {
            action: 'logGachaPull',
            browserId: visitorId,
            sessionId: sessionId, // <-- Kirim sessionId ke backend
            reqId: lastReqId,
            itemName: itemName,
            rarity: `R${rarity}`,
            // Kirim juga nama member agar GAS bisa langsung mencatat,
            // terutama jika gacha dilakukan sebelum submit final.
            memberName: selectedMember || ''
        };

        fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(payload),
            keepalive: true
        });
    } catch (error) {
        console.warn('Gagal mengirim log Gacha:', error);
    }
}

// Menampilkan hasil gacha beserta animasi bintang.
function showGachaResult(itemSrc, rarity, sfx) {
    gachaResultItem.src = itemSrc;
    // Tambah ke inventory sesi
    addToInventory(itemSrc);
    updateGachaUI();

    const timings = rarity === 5 
        ? { wingg: 1170, tings: [1800, 1970, 2140, 2310, 2480] } // R5 Timings [cite: 82]
        : { wingg: 1300, tings: [1830, 2000, 2170, 2330] };      // R4 Timings [cite: 81]

    // Jadwalkan kemunculan item ('wingg') [cite: 84]
    setTimeout(() => {
        gachaResultItem.classList.add('reveal');
    }, timings.wingg);

    // Jadwalkan kemunculan bintang ('ting') [cite: 85]
    gachaResultStars.innerHTML = '';
    timings.tings.forEach((time, index) => {
        setTimeout(() => {
            const star = document.createElement('div');
            star.className = 'gacha-star';
            gachaResultStars.appendChild(star);
            // Delay sedikit agar muncul setelah elemen dibuat
            setTimeout(() => star.classList.add('animate'), 50);
        }, time);
    });
    
    sfx.once('end', () => {
        currentGachaState = GACHA_STATE.RESULT;
        gachaPullBtn.textContent = "Pull!"; // Reset
        updateGachaUI();
    });
}


// Menunggu event tertentu dengan timeout agar promise tidak menggantung.
function waitEvent(el, evt, ms = 8000) {
  return new Promise((resolve, reject) => {
    let done = false;
    const ok = () => { if (!done) { done = true; cleanup(); resolve(); } };
    const err = (e) => { if (!done) { done = true; cleanup(); reject(e); } };
    const tid = setTimeout(() => err(new Error('timeout')), ms);
    const cleanup = () => {
      clearTimeout(tid);
      el.removeEventListener(evt, ok);
      el.removeEventListener('error', err);
    };
    el.addEventListener(evt, ok,   { once: true });
    el.addEventListener('error', err, { once: true });
  });
}

// Memainkan rangkaian animasi gacha lengkap saat user menekan tombol.
async function runGacha() {
  if (!gachaOverlay || !gachaBgVideo || !gachaR4Video || !gachaR5Video || !gachaMessage) return;

  // reset UI
  canCloseGacha = false;
  gachaMessage.textContent = '';
  gachaR4Video.style.display = 'none';
  gachaR5Video.style.display = 'none';
  gachaOverlay.style.display = 'flex';

  const fab = document.getElementById('gacha-access-btn');
  if (fab) fab.style.visibility = 'hidden';

  try { if (music && music.playing()) music.pause(); } catch (_) {}
  try { sfx?.btnClick?.play?.(); } catch (_) {}

  try {
    // === BACKGROUND LOOP (silent, inline) ===
    try { gachaBgVideo.pause(); } catch(_) {}
    gachaBgVideo.currentTime = 0;
    gachaBgVideo.muted = true;           // penting untuk izin autoplay
    gachaBgVideo.loop  = true;
    gachaBgVideo.load();
    await gachaBgVideo.play().catch(() => {}); // abaikan error minor

    // === PILIH RARITY & VIDEO "ING" ===
    const isDeep     = Math.random() < 0.2;
    const video      = isDeep ? gachaR5Video : gachaR4Video;
    const raritySfx  = isDeep ? sfx?.rarity5  : sfx?.rarity4;
    const resultsSfx = isDeep ? sfx?.results5 : sfx?.results4;
    const pool       = isDeep ? deepMotivations : commonMotivations;

    // Siapkan video ing
    try { video.pause(); } catch(_) {}
    video.currentTime = 0;
    video.muted = true;                 // biar inline autoplay jalan
    video.load();

    // Pasang handler SEBELUM play
    video.onended = () => {
      video.style.display = 'none';
      try { resultsSfx?.play?.(); } catch(_){}
      try { sfx?.btnAccepted?.play?.(); } catch(_){}
      gachaMessage.textContent = pool[Math.floor(Math.random() * pool.length)];

      try {
        gachaBgVideo.loop = true;
        if (gachaBgVideo.paused) gachaBgVideo.play();
      } catch(_){}

      canCloseGacha = true;             // baru boleh tutup setelah result tampil
    };

    video.addEventListener('playing', () => {
      try { raritySfx?.play?.(); } catch(_){}
    }, { once: true });

    // Munculkan layer ing di atas background dan pastikan sudah siap frame
    video.style.display = 'block';
    await waitEvent(video, 'loadeddata', 8000).catch(()=>{});
    await video.play().catch(e => { throw new Error('Video ing gagal diputar: ' + e.message); });

    // Selesainya ditangani oleh onended di atas

  } catch (err) {
    console.error('Gacha animation failed:', err);
    gachaMessage.textContent = 'Maaf, animasi gagal diputar. Coba lagi ya 🙏';
    canCloseGacha = true;
  }
}



  // Tutup overlay saat diklik → SEKARANG DIKUNCI OLEH FLAG
  if (gachaOverlay) {
    gachaOverlay.addEventListener('click', (ev) => {
      // Opsional: cegah click-through
      ev.stopPropagation();
      hideGachaOverlay();
    });
  }

  // Tombol lama (opsional)
	const gachaBtn = document.getElementById('gacha-access-btn');
	if (gachaBtn) {
	gachaBtn.addEventListener('click', async () => {
		// di sini lanjutkan trigger animasi gacha seperti sebelumnya
		// contoh:
		gachaOverlay.style.display = 'flex';
		canCloseGacha = false; // jangan bisa tutup dulu
		// ... (lanjut kode animasi R4/R5 seperti sebelumnya)
	});
	}

	// Tombol FAB baru
	const gachaFabEl = document.getElementById('gacha-access-btn');
	if (gachaFabEl) {
		gachaFabEl.addEventListener('click', runGacha);
	}

// Mengikat event listener untuk navigasi antar halaman dan validasi form.
function setupEventListeners() {
	// Tombol-tombol navigasi utama
	document.getElementById('back-to-coach-btn').addEventListener('click', backToCoachSelection);
	document.getElementById('back-to-member-btn').addEventListener('click', backToMemberSelection);
	document.getElementById('back-to-col-btn').addEventListener('click', () => switchPage('page-circle-of-life'));
	document.getElementById('back-to-happy-btn').addEventListener('click', () => switchPage('page-happy-story'));
	document.getElementById('submitBtn').addEventListener('click', () => {
		const memberNameParts = selectedMember.split(' ');
		const memberNickName = memberNameParts.length > 1 ? memberNameParts.slice(1).join(' ') : selectedMember;
		document.getElementById('happy-story-prompt').textContent = `${memberNickName}, apa yang bikin kamu senyum belakangan ini? Boleh banget lhoo berbagi sedikit cerita di sini 😄`;
		switchPage('page-happy-story');
	});
	// --- Happy Story must-fill (null-safe) ---
	const happyTextarea    = document.getElementById('happy-story-textarea');
	const happyContinueBtn = document.getElementById('happy-story-continue-btn');

	// Disabled di awal
	if (happyContinueBtn) happyContinueBtn.disabled = true;

	// Validasi live
	if (happyTextarea) {
	happyTextarea.addEventListener('input', () => {
		const filled = happyTextarea.value.trim().length > 0;
		if (happyContinueBtn) happyContinueBtn.disabled = !filled;
	});
	}

	// Klik "Lanjut"
	if (happyContinueBtn) {
	happyContinueBtn.addEventListener('click', () => {
		const text = (happyTextarea && happyTextarea.value || '').trim();
		if (!text) {
		if (happyTextarea) {
			const old = happyTextarea.style.outline;
			happyTextarea.style.outline = '2px solid #e74c3c';
			if ('vibrate' in navigator) navigator.vibrate(30);
			setTimeout(() => { happyTextarea.style.outline = old || ''; }, 1200);
			happyTextarea.focus();
		}
		return;
		}

		const memberNameParts = selectedMember.split(' ');
		const memberNickName = memberNameParts.length > 1 ? memberNameParts.slice(1).join(' ') : selectedMember;
		document.getElementById('sad-story-prompt').textContent =
		`${memberNickName}, kalau ada yang lagi ngeganjel di hati, gak apa-apa kok dikeluarin di sini. ` +
		`Kadang, nulis bisa bikin lega. Feel free yaa ${memberNickName} 😊`;

		switchPage('page-sad-story');
	});
	}
	document.getElementById('sad-story-continue-btn').addEventListener('click', () => {
		const voiceVerifyModal = document.getElementById('voice-verify-modal');
		const memberNameParts = selectedMember.split(' ');
		const memberNickName = memberNameParts.length > 1 ? memberNameParts.slice(1).join(' ') : selectedMember;
		document.getElementById('voice-prompt-message').innerHTML = `Ucapkan <strong>Subhanallah/Alhamdulillah/Allahu Akbar</strong> minimal <strong>3x</strong> ya dengan memencet tombol mic supaya coach tau ini beneran <strong>${memberNickName}</strong>`;
		voiceVerifyModal.style.display = 'flex';
	});

	// Kontrol UI
	document.getElementById('open-context-btn').addEventListener('click', () => {
		document.getElementById('context-modal').style.display = 'flex';
	});
	document.getElementById('close-context-btn').addEventListener('click', () => {
		document.getElementById('context-modal').style.display = 'none';
	});

	// Inisialisasi grid coach
	const coachGridPutra = document.getElementById('coach-grid-putra');
	const coachGridPutri = document.getElementById('coach-grid-putri');
	for (const coachName in coachingData.Astra) { 
		const coach = coachingData.Astra[coachName]; 
		const coachElement = document.createElement('div'); 
		coachElement.className = 'coach-item'; 
		coachElement.innerHTML = `<img src="${coach.gif}" alt="Foto ${coachName}"><p>${coachName}</p>`; 
		coachElement.addEventListener('click', () => selectCoach(coachName, 'Astra'));
		coachGridPutra.appendChild(coachElement); 
	}
	for (const coachName in coachingData.Astir) { 
		const coach = coachingData.Astir[coachName]; 
		const coachElement = document.createElement('div'); 
		coachElement.className = 'coach-item'; 
		coachElement.innerHTML = `<img src="${coach.gif}" alt="Foto ${coachName}"><p>${coachName}</p>`; 
		coachElement.addEventListener('click', () => selectCoach(coachName, 'Astir'));
		coachGridPutri.appendChild(coachElement); 
	}

	// Suara hover dan klik
	document.body.addEventListener('mouseover', (event) => {
		const target = event.target;
		if (target.closest('.coach-item') && !target.closest('.coach-item').hasAttribute('data-hover-sound-played')) {
			sfx.coachHover.play();
			target.closest('.coach-item').setAttribute('data-hover-sound-played', 'true');
		}
		if (target.closest('.member-item') && !target.closest('.member-item').hasAttribute('data-hover-sound-played')) {
			sfx.memberHover.play();
			target.closest('.member-item').setAttribute('data-hover-sound-played', 'true');
		}
	});
	document.body.addEventListener('mouseout', (event) => {
		const item = event.target.closest('.coach-item, .member-item');
		if (item) item.removeAttribute('data-hover-sound-played');
	});
	document.body.addEventListener('click', (event) => {
		const buttonTarget = event.target.closest('button');
		if (buttonTarget) {
			if (['back-to-coach-btn', 'back-to-member-btn', 'voice-close-btn', 'close-context-btn', 'back-to-col-btn', 'back-to-happy-btn'].includes(buttonTarget.id)) {
				sfx.cancelClick.play();
			} else if (['submitBtn', 'voice-submit-btn', 'happy-story-continue-btn', 'sad-story-continue-btn'].includes(buttonTarget.id)) {
				sfx.confirmClick.play();
			}
		}
		if (event.target.closest('.coach-item') || event.target.closest('.member-item')) {
			sfx.selectClick.play();
		}
	});

	// Voice Modal Listeners
	const voiceVerifyModal = document.getElementById('voice-verify-modal');
	const micBtn = document.getElementById('mic-btn');
	const voiceStatus = document.getElementById('voice-status');
	const voiceSubmitBtn = document.getElementById('voice-submit-btn');
	const voiceCloseBtn = document.getElementById('voice-close-btn');

	voiceCloseBtn.addEventListener('click', () => { voiceVerifyModal.style.display = 'none'; });
	voiceSubmitBtn.addEventListener('click', () => {
		if (audioBase64) {
			voiceStatus.textContent = "Oke sipp sebentar ya sra...";
			voiceSubmitBtn.disabled = true;
			voiceCloseBtn.disabled = true;
			submitFinalData(audioBase64);
		}
	});

	micBtn.addEventListener('click', async () => {
		if (mediaRecorder && mediaRecorder.state === "recording") {
			mediaRecorder.stop();
		} else {
			try {
				if (music.playing()) music.pause();
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				mediaRecorder = new MediaRecorder(stream);
				mediaRecorder.start();
				micBtn.style.background = '#28a745';
				micBtn.textContent = '■';
				voiceStatus.textContent = "Sedang merekam... Klik lagi untuk berhenti.";
				
				mediaRecorder.ondataavailable = event => { audioChunks.push(event.data); };
				mediaRecorder.onstop = () => {
					micBtn.style.background = '#6c757d';
					voiceStatus.textContent = "Perekaman selesai. Klik 'Kirim' untuk submit.";
					const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
					const reader = new FileReader();
					reader.readAsDataURL(audioBlob);
					reader.onloadend = () => {
						audioBase64 = reader.result.split(',')[1];
						voiceSubmitBtn.disabled = false;
					};
					stream.getTracks().forEach(track => track.stop());
				};
			} catch (err) {
				voiceStatus.textContent = "Error: Izin mikrofon ditolak.";
				console.error("Error accessing microphone:", err);
			}
		}
	});
}

// Mengatur perilaku panel kontrol audio dan daftar murottal.
function setupPlayerPanel() {
	const audioBtn = document.getElementById('audio-control-btn');
	const panel = document.getElementById('music-player-panel');
	const iconMusic = document.getElementById('icon-music-player');
	const iconClose = document.getElementById('icon-close-player');

	audioBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		const isOpen = panel.classList.toggle('visible');
		audioBtn.classList.toggle('panel-open', isOpen);
		iconMusic.style.display = isOpen ? 'none' : 'block';
		iconClose.style.display = isOpen ? 'block' : 'none';
		audioBtn.title = isOpen ? 'Tutup Pengaturan Audio' : 'Buka Pengaturan Audio';
	});

	document.addEventListener('click', (e) => {
		if (!panel.contains(e.target) && !audioBtn.contains(e.target) && panel.classList.contains('visible')) {
		   audioBtn.click();
		}
	});
	
	const hintPopup = document.getElementById('music-hint-popup');
	setTimeout(() => {
		hintPopup.classList.add('show');
		setTimeout(() => hintPopup.classList.remove('show'), 5000);
	}, 1500);

	document.getElementById('play-pause-btn').addEventListener('click', togglePlayPause);
	document.getElementById('next-music-btn').addEventListener('click', playNextMusic);
	document.getElementById('prev-music-btn').addEventListener('click', playPrevMusic);

	const murottalList = document.getElementById('murottal-list');
	murottalTracks.forEach((track, index) => {
		const btn = document.createElement('button');
		btn.className = 'player-controls murottal-btn';
		btn.innerHTML = `${svgIcons.murottalPlay} ${track.title}`;
		btn.onclick = () => loadTrack('murottal', index);
		murottalList.appendChild(btn);
	});
}

// Menyediakan toggle tema gelap/terang dengan penyimpanan preferensi.
function setupStandaloneThemeToggle() {
	const toggleBtn = document.getElementById('theme-toggle-btn');
	const sunIcon = document.getElementById('icon-sun');
	const moonIcon = document.getElementById('icon-moon');
	const docHtml = document.documentElement;
	
	const applyTheme = (isDark) => {
		docHtml.classList.toggle('dark-mode', isDark);
		sunIcon.style.display = isDark ? 'none' : 'block';
		moonIcon.style.display = isDark ? 'block' : 'none';
		localStorage.setItem('themePreference', isDark ? 'dark' : 'light');
	};

	const preferredTheme = localStorage.getItem('themePreference');
	const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

	if (preferredTheme) {
		applyTheme(preferredTheme === 'dark');
	} else {
		applyTheme(systemPrefersDark);
	}

	toggleBtn.addEventListener('click', () => {
		applyTheme(!docHtml.classList.contains('dark-mode'));
	});
}

	// Mengelola transisi antar halaman wizard dengan animasi GSAP.
	function switchPage(nextPageId) {
	window.scrollTo(0, 0);
	document.body.style.overflow = 'hidden';
	const currentPage = document.getElementById(currentPageId);
	const nextPage = document.getElementById(nextPageId);
	if (!currentPage || !nextPage || currentPageId === nextPageId) return;

	const tl = gsap.timeline({
		onComplete: () => {
		const contentContainer = nextPage.querySelector('.selection-container, .form-container, .gacha-container');
		if (contentContainer && contentContainer.scrollHeight > window.innerHeight) {
			document.body.style.overflow = 'auto';
		}
		}
	});

	tl.to(currentPage, {
		opacity: 0, y: -30, duration: 0.4, ease: "power2.inOut",
		onComplete: () => gsap.set(currentPage, { visibility: 'hidden' })
	});
	tl.fromTo(nextPage,
		{ y: 30, opacity: 0, visibility: 'visible' },
		{ y: 0, opacity: 1, duration: 0.5, ease: "power2.inOut" },
		">-0.2"
	);

	// --- posisi kontrol UI (null-safe) ---
	const audioBtn   = document.getElementById('audio-control-btn');
	const themeBtn   = document.getElementById('theme-toggle-btn');
	const playerPanel= document.getElementById('music-player-panel');
	const hintPopup  = document.getElementById('music-hint-popup');

	if (nextPageId === 'page-circle-of-life') {
		if (averageMessageElement) averageMessageElement.classList.add('visible-mobile');
		if (audioBtn)    audioBtn.style.bottom = '85px';
		if (themeBtn)    themeBtn.style.bottom = '85px';
		if (playerPanel) playerPanel.style.bottom = '145px';
		if (hintPopup)   hintPopup.style.bottom = '145px';
	} else {
		if (averageMessageElement) averageMessageElement.classList.remove('visible-mobile');
		if (audioBtn)    audioBtn.style.bottom = '20px';
		if (themeBtn)    themeBtn.style.bottom = '20px';
		if (playerPanel) playerPanel.style.bottom = '80px';
		if (hintPopup)   hintPopup.style.bottom = '80px';
	}

	// --- ikuti posisi FAB gacha ---
	const gachaFab = document.getElementById('gacha-access-btn');
	if (gachaFab) {
	if (nextPageId === 'page-circle-of-life') gachaFab.classList.add('panel-offset');
	else gachaFab.classList.remove('panel-offset');
	}

	// --- Tampilkan gacha mulai Happy Story dan seterusnya ---
	const gachaPages = new Set(['page-happy-story', 'page-sad-story', 'page-thank-you']);
	const shouldShowGacha = gachaPages.has(nextPageId);

	toggleGachaVisibility(shouldShowGacha);

	// Saat pertama kali kelihatan di Happy Story, munculkan hint sekali
	if (shouldShowGacha && nextPageId === 'page-happy-story') {
	showGachaHintOnce();
	}

	currentPageId = nextPageId;
	}

// Kembali ke halaman pemilihan coach dan reset tema.
function backToCoachSelection() { sfx.cancelClick.play(); resetTheme(); selectedCoach = null; switchPage('page-coach-selection'); }
// Kembali ke daftar anggota setelah memilih salah atau ingin ganti.
function backToMemberSelection() { sfx.cancelClick.play(); selectedMember = null; switchPage('page-member-selection'); }

// Menetapkan coach terpilih dan memuat daftar anggota terkait.
function selectCoach(coachName, gender) { 
	selectedCoach = coachName; 
	applyTheme(coachThemes[coachName]); 
	switchPage('page-member-selection'); 
	
	const memberList = document.getElementById('member-list');
	const memberTitle = document.getElementById('member-selection-title');
	memberList.innerHTML = '';
	const coachNickName = coachSignatures[coachName] || coachName;
	
	document.getElementById('sad-story-continue-btn').textContent = `Sudaaa Coach ${coachNickName} 😁`;
	memberTitle.innerText = `Pilih Namamu (EmCeKa ${coachNickName})`;
	const members = coachingData[gender][coachName].anggota;
	members.forEach(memberName => { 
		const memberElement = document.createElement('div'); 
		memberElement.className = 'member-item'; 
		memberElement.innerText = memberName; 
		memberElement.addEventListener('click', () => { selectMember(memberName); sfx.selectClick.play(); }); 
		memberList.appendChild(memberElement); 
	});
}

// Menetapkan anggota terpilih dan membuka halaman Circle of Life.
function selectMember(memberName) { 
	selectedMember = memberName; 
	switchPage('page-circle-of-life'); 
	document.getElementById('col-title').innerText = `Circle of Life - ${selectedMember}`; 
	initializeCircleOfLife(); 
}

// Menentukan warna radar chart berdasarkan rata-rata skor.
function calculateDynamicColor(avgScore) {
	const darkBlue = { r: 0, g: 0, b: 100 }, midBlue = { r: 50, g: 150, b: 200 }, lightBlue = { r: 150, g: 220, b: 255 }; let r, g, b; const normalizedScore = (avgScore - 1) / 9;
	if (normalizedScore <= 0.5) { const ratio = normalizedScore / 0.5; r = Math.round(darkBlue.r + ratio * (midBlue.r - darkBlue.r)); g = Math.round(darkBlue.g + ratio * (midBlue.g - darkBlue.g)); b = Math.round(darkBlue.b + ratio * (midBlue.b - darkBlue.b));
	} else { const ratio = (normalizedScore - 0.5) / 0.5; r = Math.round(midBlue.r + ratio * (lightBlue.r - midBlue.r)); g = Math.round(midBlue.g + ratio * (lightBlue.g - midBlue.g)); b = Math.round(midBlue.b + ratio * (lightBlue.b - midBlue.b)); }
	return { background: `rgba(${r}, ${g}, ${b}, 0.4)`, border: `rgb(${r}, ${g}, ${b})` };
}

// Memberi pesan motivasi sesuai rata-rata skor Circle of Life.
function getAverageMessage(avgScore) {
	if (avgScore >= 1 && avgScore < 3) return "Ya Allah kenapa aku WNI "; if (avgScore >= 3 && avgScore < 4) return "Capeeekk banget..."; if (avgScore >= 4 && avgScore < 5) return "Hidup kok gini amat ya :'"; if (avgScore >= 5 && avgScore < 7) return "Apapun keadaannya, Alhamdulillah :)"; if (avgScore >= 7 && avgScore < 8) return "Miaw miaw miaw miaw~"; if (avgScore >= 8 && avgScore <= 10) return "Alhamdulillah, hidup ini penuh berkah! ✨"; return "";
}

// Menampilkan pesan rata-rata ke UI desktop dan mobile.
function updateAverageMessage(avgScore) { const message = getAverageMessage(avgScore); const desktopEl = document.getElementById('average-message-desktop'); const mobileEl = document.getElementById('average-message-mobile'); if (desktopEl) { desktopEl.innerText = message; } if (mobileEl) { mobileEl.innerText = message; } }

// Menginisialisasi radar chart dan slider Circle of Life untuk anggota terpilih.
function initializeCircleOfLife() {
	const categories = ['Health', 'Academic', 'Family', 'Friends', 'Religion', 'Organization', 'Self-Love', 'Learning', 'Finances', 'Spirit'];
	const initialData = Array(categories.length).fill(5);
	const slidersContainer = document.getElementById('col-sliders');
	slidersContainer.innerHTML = '';
	categories.forEach((category, index) => { const group = document.createElement('div'); group.className = 'control-group'; group.innerHTML = `<label for="${category}"><span>${category}</span><span id="value-${category}">${initialData[index]}</span></label><input type="range" id="${category}" min="1" max="10" value="${initialData[index]}" data-index="${index}">`; slidersContainer.appendChild(group); });
	
	updateAverageMessage(initialData.reduce((a, b) => a + b, 0) / initialData.length);

	const getSliderColor = (value) => `hsl(${(value - 1) * 13}, 80%, 50%)`;

	const allSliders = slidersContainer.querySelectorAll('input[type="range"]');
	allSliders.forEach(slider => {
		const value = slider.value;
		const percent = ((value - slider.min) / (slider.max - slider.min)) * 100;
		slider.style.setProperty('--slider-color', getSliderColor(value));
		slider.style.setProperty('--slider-percent', `${percent}%`);
	});

	const ctx = document.getElementById('myChart').getContext('2d');
	if (myChart) { myChart.destroy(); }
	
	myChart = new Chart(ctx, { type: 'radar', data: { labels: categories, datasets: [{ label: 'My Life Score', data: [...initialData], fill: true, backgroundColor: 'rgba(50, 150, 200, 0.4)', borderColor: 'rgb(50, 150, 200)', pointBackgroundColor: 'rgb(50, 150, 200)', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgb(50, 150, 200)' }] }, options: { elements: { line: { tension: 0.4 } }, scales: { r: { suggestedMin: 0, suggestedMax: 10, grid: { color: '#e0e0e0' }, angleLines: { color: '#e0e0e0' }, pointLabels: { color: '#333', font: { size: 13, weight: 'bold' } }, ticks: { stepSize: 1, backdropColor: 'transparent', color: '#666' } } } } });
	
	slidersContainer.addEventListener('input', (event) => {
		if (event.target.type === 'range') {
			const slider = event.target;
			const value = slider.value;
			sliderSounds[slider.dataset.index % sliderSounds.length].play();

			if ('vibrate' in navigator) navigator.vibrate(5);
			const percent = ((value - slider.min) / (slider.max - slider.min)) * 100;
			slider.style.setProperty('--slider-color', getSliderColor(value));
			slider.style.setProperty('--slider-percent', `${percent}%`);
			document.getElementById(`value-${slider.id}`).textContent = value;
			
			const dataPoints = myChart.data.datasets[0].data;
			dataPoints[slider.dataset.index] = parseInt(value, 10);
			const avg = dataPoints.reduce((sum, current) => sum + current, 0) / dataPoints.length;
			
			const newColor = calculateDynamicColor(avg);
			myChart.data.datasets[0].backgroundColor = newColor.background;
			myChart.data.datasets[0].borderColor = newColor.border;
			myChart.data.datasets[0].pointBackgroundColor = newColor.border;
			myChart.update();
			updateAverageMessage(avg);
		}
	});
}

// Mengarahkan user mengisi cerita bahagia bila belum terisi saat submit.
function showHappyStoryRequired() {
  const voiceStatus = document.getElementById('voice-status');
  const happyEl = document.getElementById('happy-story-textarea');
  const voiceSubmitBtn = document.getElementById('voice-submit-btn');
  const voiceCloseBtn = document.getElementById('voice-close-btn');

  if (voiceStatus) {
	voiceStatus.textContent = "Kamu belum mengisi bagian 'Yang bikin kamu senyum'. Silakan isi dulu ya 😊";
  }

  // Re-enable tombol modal supaya user bisa tutup / balik isi
  if (voiceSubmitBtn) voiceSubmitBtn.disabled = false;
  if (voiceCloseBtn) voiceCloseBtn.disabled = false;

  // Highlight & fokuskan textarea Happy Story
  if (happyEl) {
	const oldOutline = happyEl.style.outline;
	happyEl.style.outline = '2px solid #e74c3c';
	if ('vibrate' in navigator) navigator.vibrate(30);
	setTimeout(() => { happyEl.style.outline = oldOutline || ''; }, 1200);
	happyEl.focus();
  }
}

// Mengirim data akhir ke backend beserta rekaman suara jika tersedia.
async function submitFinalData(audioBase64) {
  const categories = ['Health', 'Academic', 'Family', 'Friends', 'Religion', 'Organization', 'Self-Love', 'Learning', 'Finances', 'Spirit'];

  // --- Ambil IP (best-effort) ---
  let ipAddress = 'not-collected';
  try {
	const response = await fetch('https://api.ipify.org?format=json');
	if (response.ok) {
	  const data = await response.json();
	  ipAddress = data.ip || 'not-collected';
	}
  } catch (error) {
	console.warn("Gagal mendapatkan IP Address:", error);
  }

  // --- Kunci tombol untuk mencegah double submit ---
  const voiceStatus   = document.getElementById('voice-status');
  const voiceSubmitBtn= document.getElementById('voice-submit-btn');
  const voiceCloseBtn = document.getElementById('voice-close-btn');
  if (voiceSubmitBtn) voiceSubmitBtn.disabled = true;
  if (voiceCloseBtn)  voiceCloseBtn.disabled  = true;

  // --- Guard: Happy Story wajib; kalau kosong, JANGAN fetch ---
  const happyEl  = document.getElementById('happy-story-textarea');
  const happyVal = (happyEl && happyEl.value || '').trim();
  if (!happyVal) {
	if (voiceStatus) {
	  voiceStatus.textContent = "Kamu belum mengisi bagian 'Yang bikin kamu senyum'. Silakan isi dulu ya 😊";
	}
	// Re-enable tombol modal biar user bisa tutup / balik isi
	if (voiceSubmitBtn) voiceSubmitBtn.disabled = false;
	if (voiceCloseBtn)  voiceCloseBtn.disabled  = false;
	// Highlight & fokuskan textarea Happy Story
	if (happyEl) {
	  const oldOutline = happyEl.style.outline;
	  happyEl.style.outline = '2px solid #e74c3c';
	  if ('vibrate' in navigator) navigator.vibrate(30);
	  setTimeout(() => { happyEl.style.outline = oldOutline || ''; }, 1200);
	  happyEl.focus();
	}
	return; // STOP di sini → tidak lanjut ke fetch
  }

  // --- Bangun payload (TERMASUK audio) ---
  const finalData = {
	coach: selectedCoach,
	anggota: selectedMember,
	browserId: await getFingerprintId(),
	sessionId: getSessionId(),
	ipAddress,
	audioData: audioBase64 || null,   // penting untuk VoiceRecord
	audioMimeType: 'audio/webm',
	happyStory: document.getElementById('happy-story-textarea').value,
	sadStory:   document.getElementById('sad-story-textarea').value // boleh kosong
  };
  categories.forEach((category, index) => {
	const key = category.replace('-', ''); // "Self-Love" -> "SelfLove"
	finalData[key] = myChart.data.datasets[0].data[index];
  });

  // --- Kirim ke GAS (simple request -> TANPA preflight) ---
  try {
	const res = await fetch(WEB_APP_URL, {
	  method: 'POST',
	  mode: 'cors',
	  redirect: 'follow',
	  headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
	  body: JSON.stringify(finalData)
	});

	if (!res.ok) {
	  const peek = await res.text().catch(() => '');
	  throw new Error(`HTTP ${res.status} — ${peek?.slice(0, 180) || 'no body'}`);
	}

	const raw = await res.text();
	let data;
	try { data = JSON.parse(raw); }
	catch { throw new Error(`Response bukan JSON: ${raw.slice(0, 200)}`); }

	if (data && data.status === 'success') {
	  onSuccess(data);
	} else {
	  throw new Error(data?.message || 'Backend mengembalikan non-success.');
	}
  } catch (err) {
	onFailure(err);
  } finally {
	if (voiceSubmitBtn) voiceSubmitBtn.disabled = false;
	if (voiceCloseBtn)  voiceCloseBtn.disabled  = false;
  }
}

// Meminta pesan motivasi dari backend (AI) dengan kedalaman tertentu.
async function requestCoachMessage(depth = 'short') {
  const box  = document.getElementById('gemini-feedback-container');
  const txt  = document.getElementById('gemini-feedback-text');
  const spin = document.getElementById('gemini-spinner');
  const more = document.getElementById('gemini-more-btn');

  if (box)  box.style.display = 'block';
  if (txt)  txt.textContent = '';
  if (spin) spin.style.display = 'inline-block';
  if (more) { more.style.display = 'none'; more.disabled = true; }

  // Build scores dari chart
  const categories = ['Health','Academic','Family','Friends','Religion','Organization','Self-Love','Learning','Finances','Spirit'];
  const scores = {};
  categories.forEach((c,i) => { scores[c] = (myChart?.data?.datasets?.[0]?.data?.[i] ?? 0) | 0; });

  // Nama panggilan
  const memberNameParts = selectedMember.split(' ');
  const memberNickName = memberNameParts.length > 1 ? memberNameParts.slice(1).join(' ') : selectedMember;
  const coachNickName  = coachSignatures[selectedCoach] || selectedCoach;

  // Cerita (sad boleh kosong)
  const happyStory = document.getElementById('happy-story-textarea')?.value || '';
  const sadStory   = document.getElementById('sad-story-textarea')?.value || '';

  const payload = {
    action: 'geminiFeedback',
    reqId: lastReqId,       // JOIN ke row yang baru disimpan
    depth,                  // 'short' | 'long'
    memberNickName, coachNickName,
    scores, happyStory, sadStory
  };

  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload)
    });
    const raw  = await res.text();
    const data = JSON.parse(raw);

    const text = data?.feedbackText || 'Coach lagi nyusun kata-kata terbaik buatmu…';
    if (txt)  txt.textContent = text;
    if (spin) spin.style.display = 'none';

    // Setelah short sukses → munculkan tombol long
    if (depth === 'short') {
      if (more) { more.style.display = 'inline-block'; more.disabled = false; }
    } else {
      // Long selesai → matikan tombol
      if (more) { more.disabled = true; more.textContent = 'Sudah paling lengkap ✅'; }
    }
  } catch (err) {
    console.error('Gemini error:', err);
    if (spin) spin.style.display = 'none';
    if (txt)  txt.textContent = 'Gagal mengambil pesan coach. Coba klik lagi ya.';
    if (more && depth === 'short') { more.style.display = 'inline-block'; more.disabled = false; }
  }
}

// Daftarkan event “lebih mendalam lagi” saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  const more = document.getElementById('gemini-more-btn');
  if (more) more.addEventListener('click', () => requestCoachMessage('long'));
});

// Menangani respon sukses dari submit utama dan lanjut ke halaman terima kasih.
function onSuccess(response) {
  // Edge: server kirim error
  if (response && response.status === 'error') {
    const voiceStatus = document.getElementById('voice-status');
    if (voiceStatus) voiceStatus.textContent = `ERROR: ${response.message || 'Unknown error'}`;
    console.error('Server Error:', response);
    return;
  }

  // Simpan reqId untuk join (write-back AI)
  lastReqId = response && response.reqId ? String(response.reqId) : null;

  // Tutup modal verifikasi (kalau ada)
  const voiceVerifyModal = document.getElementById('voice-verify-modal');
  if (voiceVerifyModal) voiceVerifyModal.style.display = 'none';

  // Render ucapan
  const memberNameParts = selectedMember.split(' ');
  const memberNickName = memberNameParts.length > 1 ? memberNameParts.slice(1).join(' ') : selectedMember;
  const coachNickName = coachSignatures[selectedCoach] || selectedCoach;
  document.getElementById('thank-you-message').innerText =
    `Terimakasiii ${memberNickName} 😊✨ Sampai jumpa di HTH yaa!!`;
  document.getElementById('coach-signature').innerText = `~ Coach ${coachNickName}`;

  // Tampilkan halaman Thank You
  switchPage('page-thank-you');
  const tyPage = document.getElementById('page-thank-you');
  if (tyPage) tyPage.scrollTop = 0;

  // Minta AI feedback singkat (short) → tampilkan di wadah baru
  requestCoachMessage('short');
}



// Menampilkan pesan kegagalan submit dan memberi petunjuk kepada user.
function onFailure(error) {
	console.error("Network/Fetch error:", error);
	const msg = String(error && error.message || '');

	// Jika backend mengirim pesan validasi happyStory, tampilkan pesan ramah
	if (/happyStory/i.test(msg) || /wajib.*happyStory/i.test(msg)) {
		showHappyStoryRequired();
		return;
	}

	// Default: pesan jaringan/parsING respons
	const voiceStatus = document.getElementById('voice-status');
	if (voiceStatus) {
	  voiceStatus.textContent = "Gagal membaca respons server. Jika sudah tekan Kirim, data kemungkinan SUDAH TERSIMPAN. Hindari kirim ulang agar tidak dobel.";
	}
	const voiceSubmitBtn = document.getElementById('voice-submit-btn');
	const voiceCloseBtn = document.getElementById('voice-close-btn');
	if (voiceSubmitBtn) voiceSubmitBtn.disabled = false;
	if (voiceCloseBtn) voiceCloseBtn.disabled = false;
}



// Menerapkan palet warna khusus coach secara bertahap.
function applyTheme(theme) {
	const root = document.documentElement;
	const body = document.body;
	const applyAndFadeIn = () => {
		Object.keys(theme).forEach(key => {
			const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
			root.style.setProperty(cssVar, theme[key]);
		});
		setTimeout(() => body.classList.add('theme-active'), 10);
	};
	if (body.classList.contains('theme-active')) {
		body.classList.remove('theme-active');
		setTimeout(applyAndFadeIn, 800);
	} else {
		applyAndFadeIn();
	}
}

// Mengembalikan tema ke kondisi default tanpa kustom coach.
function resetTheme() {
	const root = document.documentElement;
	['bg-start', 'bg-end', 'container-start', 'container-end', 'shadow-color']
		.forEach(prop => root.style.removeProperty(`--${prop}`));
	document.body.classList.remove('theme-active');
}

