# Yılan Oyunu

Tarayıcıda çalışan, düz HTML + CSS + JavaScript ile yazılmış basit bir Yılan (Snake) oyunu.
Kütüphane, sunucu veya veritabanı yok.

## Nasıl çalıştırılır?

`index.html` dosyasına çift tıklayın, tarayıcıda açılır.

## Nasıl oynanır?

Bilgisayarda klavyeyle, telefonda parmakla oynanır:

| | Bilgisayar | Telefon / tablet |
|---|---|---|
| Başlat / yeniden başlat | **Boşluk** | Ekrana **dokun** |
| Yön | **Ok tuşları** | Tahtada parmağı **kaydır** |
| Sesi aç/kapat | **M** | Sol alttaki **ses düğmesi** |

- **Başlangıç:** sayfa açılınca oyun bekler; sağ altta ipucu görünür ("Boşluk: başla" ya da "Dokun: başla").
- **Yön girdisi:** tam ters yöne dönülemez; hızlı basılan tuşlar/kaydırmalar sırayla işlenir. Kaydırma için parmak en az 30 piksel hareket etmelidir, daha küçük hareketler yok sayılır. Kaydırırken sayfa kaymaz.
- **Ses:** tüm sesleri (efektler ve müzik) açar/kapatır; tercih tarayıcıda saklanır. Bilgisayarda sol altta "M: sesi kapat" ipucu, dokunmatik cihazda küçük bir ses düğmesi görünür.
- **Ekran uyumu:** tahta telefon ekranına sığacak şekilde küçülür, en-boy oranı (kare) bozulmaz.
- **Yem:** yılan yemi yiyince uzar, skor 1 artar ve kısa bir ses çalar
- **Çarpışma:** duvara ya da kendine çarpınca oyun biter ve farklı bir ses çalar
- **Skor:** sol üstte, **en yüksek skor** sağ üstte gösterilir (yarı şeffaf, altındaki yılan/yem görünür)
- **En yüksek skor:** tarayıcıda (localStorage) saklanır, sayfa kapansa da kalır
- **Müzik:** oyun sürerken arka planda hafif gerilimli bir müzik çalar, oyun bitince susar
- **Sesler:** ses dosyası yok, tarayıcının Web Audio özelliğiyle üretilir. Tarayıcılar sesi ilk tuş basışından ya da dokunuştan sonra açar.

## Dosyalar

| Dosya | Görevi |
|-------|--------|
| `index.html` | Sayfa, `<canvas>`, viewport etiketi ve ses düğmesi |
| `style.css` | Görünüm, telefona sığan tahta, dokunmatik ses düğmesi |
| `game.js` | Oyun durumu (`state`), güncelleme (`update`), çizim (`draw`), klavye, dokunma, ses |
| `docs/` | Proje slaytı (PDF) |

## Kod yapısı (`game.js`)

- `state`: snake, direction, inputQueue, food, score, highScore, started, gameOver
- `update()`: durumu değiştirir (hareket, yem, çarpışma, skor). Çizim yapmaz.
- `draw()`: sadece çizer. Durumu değiştirmez.
- `handleKey()`: ok tuşları, boşluk ve M tuşunu yönetir.
- `queueDirection()`: klavye ve kaydırmanın ortak girişi; yönü kuyruğa ekler.
- `handleTouchStart/Move/End()`: kaydırmayı (30 px eşik) ve dokunarak başlatmayı yönetir.
- `startOrRestart()`: oyunu başlatır ya da bitmişse yeniden başlatır (boşluk ve dokunuş).
- `toggleMute()`: sesi aç/kapatır (M tuşu ve ses düğmesi).
- `resetGame()`: oyunu başa sarar, en yüksek skoru korur.
- `loop()`: her 100 ms'de güncelle -> çiz.
- `state.inputQueue`: basılan yönler burada bekler (en fazla 2); `update()` karede birini işler.
- `beep()`, `playEatSound()`, `playGameOverSound()`, `unlockAudio()`: sesler ve ses bağlamını uyandırma.
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
15. M tuşuyla sessize alma ve ekranda ipucu (v1.1)

v1.2 (`v1.2-baslangic` dalı):

16. Başlangıç ekranı: oyun boşluk tuşuyla başlar

v1.3 (`v1.3-dokunmatik` dalı, telefon desteği):

17. Kaydırma (swipe) kontrolü
18. Dokunarak başlatma
19. Ekran uyumu ve dokunmatik ses düğmesi

Tam liste için: `git log --oneline`

## Bilinen sınırlar

- Yılan kendi kuyruğunun bulunduğu kareye girerse de çarpmış sayılır.
