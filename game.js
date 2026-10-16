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
const HIGH_SCORE_KEY = "snakeHighScore";

function loadHighScore() {
  try {
    return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
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

// Oyun durumu: oyunla ilgili tüm bilgi burada durur
const state = {
  // Yılan, parçalarının listesi; ilk eleman baş
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  // Hareket yönü: her adımda x ve y'ye eklenir (şimdilik sağa)
  direction: { x: 1, y: 0 },
  food: null, // aşağıda, yılan tanımlandıktan sonra atanır
  score: 0,
  highScore: loadHighScore(),
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
  state.food = randomFood(state.snake);
  state.score = 0;
  state.gameOver = false;
}

// Durumu değiştirir, çizim yapmaz: yılanı bir kare ilerletir
function update() {
  if (state.gameOver) return; // oyun bittiyse hiçbir şey değişmesin

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
    return;
  }

  // Başa yeni parça ekle
  state.snake.unshift(newHead);
  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    // Yem yenildi: kuyruğu atma, böylece yılan uzar; skor artar; yeni yem koy
    state.score += 1;
    if (state.score > state.highScore) {
      state.highScore = state.score;
      saveHighScore(state.highScore);
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

  // Skoru sol üst köşeye yaz
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Skor: " + state.score, 8, 20);
  ctx.textAlign = "right";
  ctx.fillText("En yüksek: " + state.highScore, canvas.width - 8, 20);

  if (state.gameOver) {
    ctx.font = "32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Oyun Bitti", canvas.width / 2, canvas.height / 2);
  }
}

// Hangi ok tuşu hangi yöne karşılık gelir
const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

// Tuşa basılınca yalnızca yönü günceller
function handleKey(event) {
  // Boşluk: yalnızca oyun bittiyse yeniden başlat
  if (event.key === " ") {
    event.preventDefault(); // boşluk sayfayı kaydırmasın
    if (state.gameOver) resetGame();
    return;
  }
  const next = KEY_DIRECTIONS[event.key];
  if (!next) return;
  event.preventDefault(); // ok tuşları sayfayı kaydırmasın
  // Tam ters yöne dönmeyi engelle (yılan kendi üstüne binmesin)
  const isReverse =
    next.x === -state.direction.x && next.y === -state.direction.y;
  if (!isReverse) state.direction = next;
}

document.addEventListener("keydown", handleKey);

// Oyun döngüsü: güncelle -> çiz -> bekle (yaklaşık 100 ms)
function loop() {
  update();
  draw();
}

setInterval(loop, 100);
