# CLAUDE.md

Tarayıcıda çalışan Yılan oyunu. Düz HTML + CSS + JavaScript, `<canvas>` ile çizim.

## Kurallar

- Sade tut, gereksiz kütüphane veya karmaşık yapı ekleme.
- Küçük ve anlaşılır commit'ler at.
- Her adımda ne yaptığını ve nedenini kısaca açıkla.
- Kullanıcı onay vermeden bir sonraki özelliğe geçme.

## Proje kısıtları

- Dosyalar: `index.html`, `style.css`, `game.js` (çift tıklayınca açılmalı).
- Kütüphane, sunucu, veritabanı yok. Ses, menü, seviye yok.

## Mimari

- Oyun durumu (`state`): snake, direction, food, score, highScore, gameOver.
- Döngü: güncelle -> çiz -> bekle (yaklaşık her 100 ms'de bir kare).
- Durumu değiştiren kod (`update`) ile çizen kod (`draw`) ayrı fonksiyonlarda olmalı.

## Özellik sırası (her biri ayrı commit)

yılanı çizme -> hareket -> klavye -> yem -> çarpışma -> skor -> en yüksek skor
