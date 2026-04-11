# ISG PRO - Occupational Health and Safety Management System

A high-accountability, premium OHS (Occupational Health and Safety) compliance and safety audit platform designed to streamline field inspections, personnel documentation, and site safety accountability.

## 🚀 Key Features

- **Advanced Site Safety Audits**: Real-time group inspections where each professional is assessed individually for compliance (PPE, safety protocols, etc.).
- **Geolocation-Tagged Reporting**: Automatic GPS coordinate capture during audits and interactive Map Picker (Leaflet) for retrospective geo-tagging.
- **Role-Based Document Auditing**: Proactive monitoring of mandatory safety documents (EKAT, MYK, Health Reports) with role-specific requirements.
- **Compliance Calendar**: A proactive "Compliance Gate" that alerts administrators to missing safety forms based on daily work activity.
- **Vehicle & Equipment Management**: Inventory tracking and specialized daily safety checklists for cranes and sepetli vehicles.
- **Physical Archive Management**: Integrated "Wet-Signature Ready" tracking to bridge the gap between digital logs and physical site archives.

## 🛠️ Tech Stack

### Backend
- **Java 17+** with **Spring Boot 3**
- **Spring Data JPA / Hibernate**
- **Maven** for Dependency Management
- **Lombok** for clean boilerplate reduction
- **H2 / PostgreSQL** Support

### Frontend
- **Next.js 16+** (App Router)
- **Tailwind CSS** for modern, premium UI
- **Lucide React** for consistent iconography
- **Leaflet & React-Leaflet** for interactive geolocation mapping
- **Axios** for robust API communication

## 📦 Project Structure

```bash
├── isg-backend    # Spring Boot API
├── isg-frontend   # Next.js Web Application
└── _assets        # Project design assets and documentation
```

## 🏁 Getting Started

### Backend Setup
1. Navigate to the `isg-backend` directory.
2. Run `mvn clean install`.
3. Start the application: `mvn spring-boot:run`.
4. API will be available at `http://localhost:8080`.

### Frontend Setup
1. Navigate to the `isg-frontend` directory.
2. Run `npm install` to install dependencies.
3. Start the development server: `npm run dev`.
4. Open `http://localhost:3000` in your browser.

## 🔒 Security & Accountability
This system is designed for high-stakes safety environments. It includes:
- Precise time-stamping of all audits.
- Verification of site presence via Geolocation.
- Visual status indicators (Red Pulsing) for missing or faulty compliance reports.

---
*Developed for Öz Çeliker Elektrik ISG Compliance.*
