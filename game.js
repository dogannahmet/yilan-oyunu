// Canvas'ı ve çizim aracını (ctx) al
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Tahtayı 20x20'lik karelere böleriz; her kare 20 piksel
const TILE = 20;

// Oyun durumu: oyunla ilgili tüm bilgi burada durur
const state = {
  // Yılan, parçalarının listesi; ilk eleman baş
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
};

// Sadece çizer, durumu değiştirmez
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#4caf50";
  for (const part of state.snake) {
    ctx.fillRect(part.x * TILE, part.y * TILE, TILE - 1, TILE - 1);
  }
}

draw();
