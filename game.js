// Canvas'ı ve çizim aracını (ctx) al
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Tahtayı 20x20'lik karelere böleriz; her kare 20 piksel
const TILE = 20;
const COLS = canvas.width / TILE;
const ROWS = canvas.height / TILE;

// Yılanın üstünde olmayan rastgele bir kare seç
function randomFood(snake) {
  while (true) {
    const food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    if (!snake.some((part) => part.x === food.x && part.y === food.y)) {
      return food;
    }
  }
}

// En yüksek skoru tarayıcının localStorage'ında saklarız (sayfa kapansa da kalır)
const HIGH_SCORE_KEY = "yilanEnYuksekSkor";
// Eski sürümlerde kullanılan anahtar: oyuncunun rekoru kaybolmasın diye bir kez okunur
const OLD_HIGH_SCORE_KEY = "snakeHighScore";

function loadHighScore() {
  try {
    const saved =
      localStorage.getItem(HIGH_SCORE_KEY) ??
      localStorage.getItem(OLD_HIGH_SCORE_KEY);
    return Number(saved) || 0;
  } catch (e) {
    return 0; // localStorage kullanılamıyorsa 0'dan başla
  }
}

function saveHighScore(value) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(value));
  } catch (e) {
    // kaydedilemezse oyun yine de çalışsın
  }
}

// Sesler: ses dosyası yok, tarayıcının Web Audio özelliğiyle bip üretiriz
let audioCtx = null;

// Sessize alma durumu: M tuşu değiştirir, localStorage hatırlar
const MUTE_KEY = "snakeMuted";

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch (e) {
    return false; // localStorage kullanılamıyorsa ses açık başlar
  }
}

function saveMuted(value) {
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch (e) {
    // kaydedilemezse oyun yine de çalışsın
  }
}

let muted = loadMuted();

// Dokunmatik cihazlarda M tuşu yok: küçük bir ses düğmesi (HTML'de) kullanılır
const muteButton = document.getElementById("mute-button");

function updateMuteButton() {
  muteButton.textContent = muted ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", muted ? "Sesi aç" : "Sesi kapat");
}

// Sesleri aç/kapat ve tercihi kaydet (M tuşu ve düğme ortak kullanır)
function toggleMute() {
  muted = !muted;
  saveMuted(muted);
  updateMuteButton();
}

updateMuteButton();
muteButton.addEventListener("click", () => {
  startMusic(); // dokunuş sesi uyandırır, müzik de başlayabilir
  toggleMute();
});

// Tarayıcılar sesi ancak kullanıcı dokunuşu/tuşu sırasında açar; ses bağlamını
// burada, o hareketin içinde oluşturup uyandırırız
function unlockAudio() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch (e) {
    // ses desteklenmiyorsa oyun yine de çalışsın
  }
}

// Belirli frekansta (Hz), belirli sürede (sn) bir bip çalar
function beep(frequency, duration, type, delay = 0, volume = 0.15) {
  if (muted) return; // tüm sesler (efektler + müzik) bu tek yerden geçer
  try {
    // AudioContext'i ilk kullanımda oluştur (tarayıcılar tuş basışından sonra izin verir)
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const start = audioCtx.currentTime + delay;
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + duration);
  } catch (e) {
    // ses çalınamazsa oyun yine de çalışsın
  }
}

// Yem yenince: kısa, yüksek ve tatlı bir "pıt"
function playEatSound() {
  beep(880, 0.1, "square");
}

// Oyun bitince: alçalan üç ton
function playGameOverSound() {
  beep(330, 0.2, "sawtooth");
  beep(247, 0.2, "sawtooth", 0.2);
  beep(165, 0.4, "sawtooth", 0.4);
}

// Arka plan müziği: alçak, tekrar eden, hafif gerilimli bir nota dizisi.
// La (110 Hz) ile Si bemol (116.5 Hz) yan yana olduğu için kulağa huzursuz gelir.
const MUSIC_NOTES = [110, 110, 116.5, 110, 110, 130.8, 110, 116.5];
const MUSIC_STEP_MS = 300; // her nota arasındaki süre
let musicStarted = false;
let musicStep = 0;

// Her adımda bir nota çalar; oyun bitmişse sessiz kalır
function musicTick() {
  if (!state.started || state.gameOver) return;
  beep(MUSIC_NOTES[musicStep % MUSIC_NOTES.length], 0.28, "triangle", 0, 0.06);
  musicStep += 1;
}

// İlk tuş basışında bir kez çağrılır (tarayıcılar sesi ancak o zaman açar)
function startMusic() {
  unlockAudio(); // her kullanıcı hareketinde sesi uyandır (özellikle iOS için)
  if (musicStarted) return;
  musicStarted = true;
  setInterval(musicTick, MUSIC_STEP_MS);
}

// Dokunmatik cihaz mı? (ana işaretçi parmak mı)
const isTouchDevice =
  typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;

// Oyun durumu: oyunla ilgili tüm bilgi burada durur
const state = {
  // Yılan, parçalarının listesi; ilk eleman baş
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  // Yılanın GERÇEKTE gittiği yön: sadece update() değiştirir (şimdilik sağa)
  direction: { x: 1, y: 0 },
  // Basılan ama henüz işlenmemiş yönler (en fazla 2); her karede biri işlenir
  inputQueue: [],
  food: null, // aşağıda, yılan tanımlandıktan sonra atanır
  score: 0,
  highScore: loadHighScore(),
  newRecord: false, // bu oyunda rekor kırıldı mı? (bitiş ekranında mesaj için)
  started: false, // oyun boşluk tuşuyla başlar; o zamana kadar bekler
  gameOver: false,
};
state.food = randomFood(state.snake);

// Oyunu başa sar: en yüksek skor korunur, geri kalan sıfırlanır
function resetGame() {
  state.snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  state.direction = { x: 1, y: 0 };
  state.inputQueue = [];
  state.food = randomFood(state.snake);
  state.score = 0;
  state.newRecord = false;
  state.gameOver = false;
}

// Durumu değiştirir, çizim yapmaz: yılanı bir kare ilerletir
function update() {
  // Başlamadıysa ya da bittiyse hiçbir şey değişmesin
  if (!state.started || state.gameOver) return;

  // Kuyruktan yalnızca bir yön al. Ters yön kontrolü, yılanın gerçekte
  // gittiği yöne (state.direction) göre burada yapılır.
  const next = state.inputQueue.shift();
  if (next && !(next.x === -state.direction.x && next.y === -state.direction.y)) {
    state.direction = next;
  }

  const head = state.snake[0];
  const newHead = {
    x: head.x + state.direction.x,
    y: head.y + state.direction.y,
  };

  // Duvara çarptı mı? (tahtanın dışına çıktı mı)
  const hitWall =
    newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS;
  // Kendine çarptı mı? (yeni baş, mevcut bir parçanın üstünde mi)
  const hitSelf = state.snake.some(
    (part) => part.x === newHead.x && part.y === newHead.y
  );
  if (hitWall || hitSelf) {
    state.gameOver = true;
    playGameOverSound();
    // Oyun bitti: rekor kırıldıysa yeni değer, kırılmadıysa aynı değer saklanır
    saveHighScore(state.highScore);
    return;
  }

  // Başa yeni parça ekle
  state.snake.unshift(newHead);
  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    // Yem yenildi: kuyruğu atma, böylece yılan uzar; skor artar; yeni yem koy
    state.score += 1;
    playEatSound();
    // Ekranda anında görünsün diye bellekteki rekoru güncelle (kayıt oyun bitince)
    if (state.score > state.highScore) {
      state.highScore = state.score;
      state.newRecord = true; // rekor kırıldı, bitişte "Yeni rekor!" gösterilecek
    }
    state.food = randomFood(state.snake);
  } else {
    // Yem yok: kuyruğu at, yılan sadece ilerler
    state.snake.pop();
  }
}

// Sadece çizer, durumu değiştirmez
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e53935";
  ctx.fillRect(state.food.x * TILE, state.food.y * TILE, TILE - 1, TILE - 1);
  ctx.fillStyle = "#4caf50";
  for (const part of state.snake) {
    ctx.fillRect(part.x * TILE, part.y * TILE, TILE - 1, TILE - 1);
  }

  // Skor ve en yüksek skoru sol üstte yan yana yaz; yarı şeffaf, altındaki
  // yılan/yem görünsün
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    "Skor: " + state.score + "   En yüksek: " + state.highScore,
    8,
    20
  );

  // Sessize alma ipucu, sol altta; ses durumunu da gösterir.
  // Dokunmatik cihazlarda yerine HTML'deki ses düğmesi görünür.
  if (!isTouchDevice) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(muted ? "M: sesi aç (ses kapalı)" : "M: sesi kapat", 8, canvas.height - 8);
  }

  // Başlatma ipucu, sağ altta: oyun başlamadan ve bittikten sonra görünür
  if (!state.started || state.gameOver) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(
      (isTouchDevice ? "Dokun: " : "Boşluk: ") +
        (state.started ? "yeniden başla" : "başla"),
      canvas.width - 8,
      canvas.height - 8
    );
  }

  if (state.gameOver) {
    ctx.fillStyle = "#fff"; // "Oyun Bitti" tam opak kalsın
    ctx.font = "32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Oyun Bitti", canvas.width / 2, canvas.height / 2);
    // Rekor kırıldıysa altında altın sarısı kısa bir mesaj
    if (state.newRecord) {
      ctx.fillStyle = "#ffd54f";
      ctx.font = "24px sans-serif";
      ctx.fillText("Yeni rekor!", canvas.width / 2, canvas.height / 2 + 36);
    }
  }
}

// Hangi ok tuşu hangi yöne karşılık gelir
const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

// Oyun başlamadıysa başlatır, bittiyse yeniden başlatır (boşluk tuşu ve dokunuş)
function startOrRestart() {
  if (!state.started) state.started = true;
  else if (state.gameOver) resetGame();
}

// Tuşa basılınca yönü kuyruğa ekler (hareketi update() yapar)
function handleKey(event) {
  startMusic(); // müzik ilk tuş basışında başlar
  // M: tüm sesleri aç/kapat
  if (event.key === "m" || event.key === "M") {
    toggleMute();
    return;
  }
  // Boşluk: oyun başlamadıysa başlat, bittiyse yeniden başlat
  if (event.key === " ") {
    event.preventDefault(); // boşluk sayfayı kaydırmasın
    startOrRestart();
    return;
  }
  const next = KEY_DIRECTIONS[event.key];
  if (!next) return;
  event.preventDefault(); // ok tuşları sayfayı kaydırmasın
  queueDirection(next);
}

document.addEventListener("keydown", handleKey);

// Yönü doğrudan değiştirme, kuyruğa ekle (en fazla 2 girdi).
// Klavye ve kaydırma aynı kuyruğu kullanır.
function queueDirection(next) {
  if (!state.started) return; // oyun başlamadan yön girdisi alma
  // Aynı yönü art arda eklemek kuyruğu boşuna doldurur, onu atla.
  const last = state.inputQueue[state.inputQueue.length - 1] || state.direction;
  const isSame = next.x === last.x && next.y === last.y;
  if (state.inputQueue.length < 2 && !isSame) state.inputQueue.push(next);
}

// Kaydırma (swipe): parmak bu kadar piksel hareket etmeden yön sayılmaz
const SWIPE_MIN_DISTANCE = 30;
let touchStart = null;

function handleTouchStart(event) {
  event.preventDefault(); // sayfa kaymasın
  const touch = event.touches[0];
  // idle: dokunuş oyun beklerken/bitmişken mi başladı? (dokunuşla başlatma için)
  touchStart = {
    x: touch.clientX,
    y: touch.clientY,
    idle: !state.started || state.gameOver,
  };
}

function handleTouchMove(event) {
  event.preventDefault(); // kaydırırken sayfa kaymasın
  if (!touchStart) return;
  const touch = event.touches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_DISTANCE) return;
  // Hangi eksende daha çok gittiyse yön odur
  if (Math.abs(dx) > Math.abs(dy)) {
    queueDirection(dx > 0 ? KEY_DIRECTIONS.ArrowRight : KEY_DIRECTIONS.ArrowLeft);
  } else {
    queueDirection(dy > 0 ? KEY_DIRECTIONS.ArrowDown : KEY_DIRECTIONS.ArrowUp);
  }
  // Parmak kalkmadan art arda kaydırma olabilsin: başlangıcı buraya al
  touchStart = { x: touch.clientX, y: touch.clientY, idle: touchStart.idle };
}

// Parmak kalkınca: oyun beklerken başlayan dokunuş oyunu başlatır/yeniden başlatır.
// touchend kullanırız, çünkü mobil tarayıcılar sesi dokunuşun bitişinde açar.
// Oynarken başlayan kaydırma ölünce yeniden başlatmasın diye "idle" kontrolü var.
function handleTouchEnd(event) {
  if (touchStart && touchStart.idle && event.type === "touchend") {
    startMusic();
    startOrRestart();
  }
  touchStart = null;
}

// passive:false, preventDefault()'un çalışması için gerekli
canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd);
canvas.addEventListener("touchcancel", handleTouchEnd);

// Oyun döngüsü: güncelle -> çiz -> bekle (yaklaşık 100 ms)
function loop() {
  update();
  draw();
}

setInterval(loop, 100);
