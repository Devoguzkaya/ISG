# ISG PRO - Occupational Health and Safety Management System

A high-accountability, premium OHS (Occupational Health and Safety) compliance and safety audit platform designed to streamline field inspections, personnel documentation, and site safety accountability.

---

## 🇹🇷 Türkçe Tanıtım

**ISG PRO**, saha denetimleri, personel dökümantasyonu ve saha güvenliği hesap verebilirliğini kolaylaştırmak için tasarlanmış, yüksek hesap verebilirlik düzeyine sahip profesyonel bir İSG (İş Sağlığı ve Güvenliği) uyumluluk ve denetim platformudur.

### 🚀 Temel Özellikler
- **Gelişmiş Saha Denetimleri:** Her çalışanın bireysel olarak (KKD, güvenlik protokolleri vb.) değerlendirildiği gerçek zamanlı ekip denetimleri.
- **Konum Etiketli Raporlama:** Denetimler sırasında otomatik GPS koordinatı yakalama ve interaktif harita (Leaflet) üzerinden konum seçme.
- **Rol Bazlı Belge Denetimi:** Zorunlu belgelerin (EKAT, MYK, Sağlık Raporları vb.) rol bazlı gereksinimlerle proaktif takibi.
- **Uyum Takvimi:** Eksik İSG formlarını günlük iş faaliyetlerine göre tespit eden ve yöneticileri uyaran "Uyumluluk Kapısı".
- **Araç ve Ekipman Yönetimi:** Envanter takibi ve vinç/sepetli araçlar için özel günlük güvenlik kontrol listeleri.
- **Fiziksel Arşiv Yönetimi:** Dijital kayıtlar ile fiziksel saha arşivleri arasındaki boşluğu dolduran "Islak İmzalı Takip" entegrasyonu.

---

## 🚀 Key Features (English)
- **Advanced Site Safety Audits**: Real-time group inspections where each professional is assessed individually for compliance.
- **Geolocation-Tagged Reporting**: Automatic GPS coordinate capture and interactive Map Picker (Leaflet).
- **Role-Based Document Auditing**: Proactive monitoring of mandatory safety documents (EKAT, MYK, etc.).
- **Compliance Calendar**: A proactive gate that alerts to missing safety forms based on daily work activity.
- **Vehicle & Equipment Management**: Inventory tracking and specialized daily safety checklists.
- **Physical Archive Management**: Integrated tracking to bridge the gap between digital logs and physical archives.

## 🛠️ Tech Stack
### Backend
- **Java 21** with **Spring Boot 4**
- **Spring Data JPA / Hibernate**
- **PostgreSQL** (Production) / **H2** (Dev)
- **Maven & Lombok**

### Frontend
- **Next.js 16+** (App Router)
- **Tailwind CSS** (Premium Dark Mode support)
- **Lucide React & Leaflet**
- **Axios**

## 🐳 Deployment (Docker)
The project is fully dockerized for persistent server deployment.

```bash
# Clone the repository
git clone https://github.com/Devoguzkaya/ISG.git
cd ISG

# Start the entire system (DB + Backend + Frontend)
docker-compose up -d --build
```

## 🚀 Kurulum ve Çalıştırma

### Lokal Geliştirme (Docker'sız)
1. Backend: `cd isg-backend && mvn spring-boot:run`
2. Frontend: `cd isg-frontend && npm run dev -- -p 3000`

### Sunucu Kurulumu (Docker ile)
Sunucuda Tailscale IP'si üzerinden ayağa kalkar:
```bash
docker-compose up -d --build
```

*Frontend 3001, Backend 8080 portundan hizmet verir.*

*Frontend will be available at port 3001, Backend at 8080.*

---
*Professional ISG Compliance Solution.*
