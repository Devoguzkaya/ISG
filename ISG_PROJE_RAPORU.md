# 🛡️ ISG Takip Sistemi - Proje Raporu

## 📋 Proje Özeti
ISG Takip Sistemi, saha çalışmalarında iş sağlığı ve güvenliği (İSG) süreçlerini dijitalleştirmek, evrak takibini otomatize etmek ve uyumluluk risklerini anlık olarak izlemek için geliştirilmiş bir kurumsal yönetim panelidir. Proje, özellikle ağır sanayi ve saha operasyonları (Vinç kullanımı, saha denetimleri vb.) yürüten firmaların yasal yükümlülüklerini hatasız bir şekilde yerine getirmesini hedefler.

---

## 🎯 Temel Amaçlar
1.  **Dijital Denetim:** Kağıt üzerindeki denetim formlarını dijital ortama taşıyarak veri kaybını önlemek ve raporlamayı hızlandırmak.
2.  **Uyumluluk Takibi:** Personel ve araç evraklarının (MYK, EKAT, Muayene vb.) son geçerlilik tarihlerini otomatik izleyerek kritik uyarılar oluşturmak.
3.  **Fiziksel Arşiv Yönetimi:** Saha çalışmalarına ait günlük zorunlu formların (İş İzin Formu, Risk Analizi vb.) fiziksel olarak hazır olup olmadığını takip etmek.
4.  **Operasyonel Görünürlük:** Takvim entegrasyonu ile hangi gün nerede çalışma yapıldığını ve bu çalışmaların İSG açısından eksiksiz olup olmadığını raporlamak.

---

## 💻 Teknoloji Yığını (Tech Stack)

### **Backend (Sunucu Katmanı)**
*   **Java 21:** Modern Java özelliklerinden (Record, Sealed Classes vb.) faydalanan sağlam çekirdek.
*   **Spring Boot 4:** RESTful API mimarisi ve mikroservis uyumlu yapı.
*   **Spring Data JPA:** Veritabanı işlemleri için Hibernate tabanlı ORM.
*   **H2 Database:** Yerel geliştirme ortamında dosya tabanlı (Persistent) hızlı veritabanı.
*   **PostgreSQL:** Üretim (Production) ortamında yüksek performanslı ilişkisel veritabanı.

### **Frontend (Arayüz Katmanı)**
*   **Next.js 16 (Turbopack):** Hızlı build süreleri ve modern App Router mimarisi.
*   **TypeScript:** Tip güvenli kod geliştirme ile runtime hatalarının minimize edilmesi.
*   **Tailwind CSS:** "Organic Brutalism" tasarım dilini yansıtan özelleştirilmiş stil katmanı.
*   **Lucide Icons:** Modern ve tutarlı ikon seti.
*   **Axios:** Backend ile asenkron API iletişimi.

### **DevOps & Dağıtım**
*   **Docker & Docker Compose:** Konteyner tabanlı izolasyon ve tek komutla kurulum.
*   **Tailscale VPN:** Sunucuya dış dünyadan (Mobil/Ev) güvenli ve şifreli erişim.
*   **Multi-Stage Builds:** Minimum boyutlu ve optimize edilmiş Docker imajları.

---

## ✨ Öne Çıkan Özellikler
*   **Dinamik Dashboard:** Aktif personel/araç sayısı ve kritik evrak uyarılarını gösteren anlık panel.
*   **Akıllı Takvim:** Çalışma günlerinin işaretlenmesi ve o günlere ait formların otomatik takibi.
*   **Evrak Matrisi:** Personel bazlı zorunlu belgelerin dijital arşivi.
*   **Karanlık Mod (Dark Mode):** Göz yormayan, premium "Organic Brutalism" estetiği.
*   **Mobil Uyumluluk:** Sahada tablet veya telefondan kolayca form doldurabilme özelliği.

---

## 🚀 Mevcut Durum
Proje şu an yerel geliştirme ortamında (Localhost) tam kapasite çalışmakta olup, PostgreSQL ve Docker entegrasyonu ile prodüksiyon ortamına (Cloud/VPS) dağıtıma hazır haldedir.

> **Hazırlayan:** Antigravity AI
> **Tarih:** 12 Mayıs 2026
