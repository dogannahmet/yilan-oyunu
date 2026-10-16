# Yılan Oyunu

Tarayıcıda çalışan, düz HTML + CSS + JavaScript ile yazılmış basit bir Yılan (Snake) oyunu.
Kütüphane, sunucu veya veritabanı yok.

## Nasıl çalıştırılır?

`index.html` dosyasına çift tıklayın, tarayıcıda açılır.

## Nasıl oynanır?

- **Ok tuşları:** yılanı yönlendirir (tam ters yöne dönülemez; hızlı basılan tuşlar sırayla işlenir)
- **M tuşu:** tüm sesleri (efektler ve müzik) açar/kapatır; tercih tarayıcıda saklanır
- **Yem:** yılan yemi yiyince uzar, skor 1 artar ve kısa bir ses çalar
- **Çarpışma:** duvara ya da kendine çarpınca oyun biter ve farklı bir ses çalar
- **Boşluk tuşu:** oyun bittiyse yeniden başlatır
- **Skor:** sol üstte, **en yüksek skor** sağ üstte gösterilir (yarı şeffaf, altındaki yılan/yem görünür)
- **En yüksek skor:** tarayıcıda (localStorage) saklanır, sayfa kapansa da kalır
- **Müzik:** oyun sürerken arka planda hafif gerilimli bir müzik çalar, oyun bitince susar
- **Sesler:** ses dosyası yok, tarayıcının Web Audio özelliğiyle üretilir. Tarayıcılar sesi ilk tuş basışından sonra açar.

## Dosyalar

| Dosya | Görevi |
|-------|--------|
| `index.html` | Sayfa ve `<canvas>` |
| `style.css` | Görünüm |
| `game.js` | Oyun durumu (`state`), güncelleme (`update`), çizim (`draw`), klavye, ses |

## Kod yapısı (`game.js`)

- `state`: snake, direction, food, score, highScore, gameOver
- `update()`: durumu değiştirir (hareket, yem, çarpışma, skor). Çizim yapmaz.
- `draw()`: sadece çizer. Durumu değiştirmez.
- `handleKey()`: ok tuşları yönü, boşluk tuşu yeniden başlatmayı yönetir.
- `resetGame()`: oyunu başa sarar, en yüksek skoru korur.
- `loop()`: her 100 ms'de güncelle -> çiz.
- `state.inputQueue`: basılan yönler burada bekler (en fazla 2); `update()` karede birini işler.
- `beep()`, `playEatSound()`, `playGameOverSound()`: sesler.
- `startMusic()`, `musicTick()`: arka plan müziği.

## Geliştirme geçmişi

Her özellik ayrı bir commit olarak eklendi:

1. Proje kurulumu (README, CLAUDE.md)
2. Boş canvas'lı iskelet
3. Yılanı çizme
4. Hareket ve oyun döngüsü
5. Klavye kontrolü
6. Yem
7. Çarpışma
8. Skor
9. En yüksek skor
10. Boşluk tuşuyla yeniden başlatma
11. Skor yazılarını yarı şeffaf yapma
12. Yem ve oyun sonu sesleri
13. Arka plan gerilim müziği

v1.1 (`v1.1-duzeltmeler` dalı):

14. Hata düzeltme: yön girdileri kuyruğa alındı
15. M tuşuyla sessize alma

Tam liste için: `git log --oneline`

## Bilinen sınırlar

- Yılan kendi kuyruğunun bulunduğu kareye girerse de çarpmış sayılır.
