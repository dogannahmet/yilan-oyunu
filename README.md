# Yılan Oyunu

Tarayıcıda çalışan, düz HTML + CSS + JavaScript ile yazılmış basit bir Yılan (Snake) oyunu.
Kütüphane, sunucu veya veritabanı yok.

## Nasıl çalıştırılır?

`index.html` dosyasına çift tıklayın, tarayıcıda açılır.

## Nasıl oynanır?

- **Ok tuşları:** yılanı yönlendirir
- **Yem:** yılan yemi yiyince uzar ve skor artar
- **Çarpışma:** duvara ya da kendine çarpınca oyun biter
- **Boşluk tuşu:** oyunu yeniden başlatır
- **En yüksek skor:** tarayıcıda (localStorage) saklanır

## Dosyalar

| Dosya | Görevi |
|-------|--------|
| `index.html` | Sayfa ve `<canvas>` |
| `style.css` | Görünüm |
| `game.js` | Oyun durumu, güncelleme ve çizim |

## Geliştirme sırası

Her özellik ayrı bir commit olarak eklenir:
yılanı çizme → hareket → klavye → yem → çarpışma → skor → en yüksek skor
