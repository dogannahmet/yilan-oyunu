# CLAUDE.md

Tarayıcıda çalışan Yılan oyunu. Düz HTML + CSS + JavaScript, `<canvas>` ile çizim.

## Kurallar

- Sade tut, gereksiz kütüphane veya karmaşık yapı ekleme.
- Küçük ve anlaşılır commit'ler at.
- Her adımda ne yaptığını ve nedenini kısaca açıkla.
- Kullanıcı onay vermeden bir sonraki özelliğe geçme.
- Oyun sürerken arka planda hafif gerilim müziği çalar, oyun bitince susar. Müzik dosyasız, Web Audio ile üretilir ve ilk tuş basışında başlar.

## Proje kısıtları

- Dosyalar: `index.html`, `style.css`, `game.js` (çift tıklayınca açılmalı).
- Kütüphane, sunucu, veritabanı yok. Menü, seviye yok. Sesler dosyasız, Web Audio ile üretilir.

## Mimari

- Oyun durumu (`state`): snake, direction, inputQueue, food, score, highScore, started, gameOver.
- Oyun sayfa açılınca beklemede başlar (`started: false`); boşluk tuşu başlatır. Müzik de başlamadan çalmaz.
- Yön girdileri `inputQueue`'ya (en fazla 2) girer; `update()` karede birini işler.
- Döngü: güncelle -> çiz -> bekle (yaklaşık her 100 ms'de bir kare).
- Durumu değiştiren kod (`update`) ile çizen kod (`draw`) ayrı fonksiyonlarda olmalı.

## Özellik sırası (her biri ayrı commit)

yılanı çizme -> hareket -> klavye -> yem -> çarpışma -> skor -> en yüksek skor
(tamamlandı) + sonradan: yeniden başlatma, şeffaf skor yazıları, sesler, girdi kuyruğu,
M ile sessize alma (ekranda ipucu), boşlukla başlama.
Yeni özellikler de aynı kuralla, ayrı commit'ler ve onayla eklenir.
