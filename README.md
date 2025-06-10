# Tombala Oyunu Paketi (`game-tombala`)

Bu paket, Game Center projesi için geliştirilmiş, yeniden kullanılabilir ve bağımsız bir Tombala oyunu React bileşeni içerir.

## ✨ Özellikler

-   **Rastgele Kart Oluşturma:** Her oyun başlangıcında standart 3x9'luk bir Tombala kartını 15 rastgele numara ile oluşturur.
-   **Gerçek Zamanlı Senkronizasyon:** Socket.IO üzerinden gelen `tombala_number_drawn` olayını dinleyerek, diğer oyuncular tarafından çekilen sayıları kendi kartında anlık olarak gösterir.
-   **İnteraktif Oyun Alanı:**
    -   Oyuncunun manuel olarak kendi kartındaki sayıları işaretlemesine ve işaretleri kaldırmasına olanak tanır.
    -   Sadece çekilmiş sayılar işaretlenebilir.
-   **Kazanma Mantığı:**
    -   Karttaki işaretli sayılara göre "1. Çinko", "2. Çinko" ve "Tombala" butonlarını akıllı bir şekilde aktif/pasif hale getirir.
    -   Kazanma iddialarını (`claim_win` olayı), doğrulanması için sunucuya gönderir.
-   **Oyun Yönetimi:**
    -   Çekilen sayıyı, diğer oyunculara yayınlanması için sunucuya iletir.

## 📦 Kurulum

Bu paket, ana projenin (`game-center`) bir parçasıdır. Kurulum için ana dizindeki `README.md` dosyasını takip edin.

game-center: https://github.com/recepsalih03/game-center

Paket içinde bir değişiklik yapıldığında, bu değişikliğin ana projeye yansıması için paketin yeniden derlenmesi gerekir:
npm run build --workspace=game-tombala