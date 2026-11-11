
# 🎬 FilmBox — Kişisel Film Arşivi

FilmBox, kullanıcıların izledikleri filmleri takip edebildiği, izlemek istedikleri filmleri listeleyebildiği ve kişisel film koleksiyonlarını yönetebildiği React tabanlı bir web uygulamasıdır.

## 🌐 Canlı Demo

**[FilmBox Uygulamasını Aç](https://flourishing-clafoutis-439bb8.netlify.app/)**

## ✨ Özellikler

- OMDb API üzerinden film arama
- Arama sonuçlarından film ekleme
- Manuel film ekleme ve afiş yükleme
- Film bilgilerini düzenleme
- Film silme
- İzlenme durumunu güncelleme
- İzledim, İzlemedim ve İzleme Listemde filtreleri
- Film adına ve yılına göre arşivde arama
- IndexedDB ile tarayıcıda kalıcı veri saklama
- Responsive kullanıcı arayüzü

## 🛠️ Kullanılan Teknolojiler

- React
- Vite
- JavaScript
- CSS
- IndexedDB
- OMDb API
- Netlify Functions
- Lucide React

## 📸 Ekran Görüntüleri

### Film Listeleme
![Film Listeleme](public/screenshots/listeleme%20ss%20.png)

### Film Arama
![Film Arama](public/screenshots/arama%20kontrol%C3%BC.png)

### Film Filtreleme
![Film Filtreleme](public/screenshots/Filtreleme%20%C3%B6rne%C4%9Fi.png)

### Film Güncelleme
![Film Güncelleme](public/screenshots/G%C3%BCncelleme%20%C3%B6rne%C4%9Fi.png)

## 💻 Kurulum

Projeyi bilgisayarınıza indirin:

```bash
git clone https://github.com/LeonxBlade/filmbox.git
cd filmbox
npm install
```

OMDb API anahtarınızı `OMDB_API_KEY` ortam değişkeni olarak tanımlayın.

Netlify CLI ile yerel geliştirme ortamını başlatın:

```bash
npx netlify dev
```

Uygulama varsayılan olarak `http://localhost:8888` adresinde çalışır.

## 📋 CRUD İşlemleri

| İşlem | Açıklama |
|---|---|
| Create | Film ekleme |
| Read | Filmleri listeleme ve arama |
| Update | Film bilgilerini ve izlenme durumunu güncelleme |
| Delete | Film silme |

## 💾 Veri Saklama

Film kayıtları IndexedDB kullanılarak kullanıcının tarayıcısında saklanır. Veriler sayfa yenilendiğinde korunur. Farklı cihazlar arasında otomatik senkronizasyon yapılmaz.

## 👨‍💻 Geliştirici

**LeonxBlade**

GitHub: https://github.com/LeonxBlade
