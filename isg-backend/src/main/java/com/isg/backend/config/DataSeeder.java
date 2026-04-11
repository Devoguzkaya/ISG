package com.isg.backend.config;

import com.isg.backend.model.Personnel;
import com.isg.backend.model.Vehicle;
import com.isg.backend.repository.PersonnelRepository;
import com.isg.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PersonnelRepository personnelRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (personnelRepository.count() == 0) {
            seedPersonnel();
        }
        if (vehicleRepository.count() == 0) {
            seedVehicles();
        }
    }

    private void seedPersonnel() {
        List<Personnel> staff = List.of(
            Personnel.builder().fullName("Ahmet Öneş").role("Operatör / Şoför").build(),
            Personnel.builder().fullName("Ali Korkmaz").role("Elektrikçi").build(),
            Personnel.builder().fullName("Arif Özdal").role("Şoför").build(),
            Personnel.builder().fullName("Coşkun Deniz").role("Tekniker / Saha Sorumlusu").build(),
            Personnel.builder().fullName("Cuma Özdal").role("Yardımcı Personel").build(),
            Personnel.builder().fullName("Emre Canlı").role("Elektrikçi").build(),
            Personnel.builder().fullName("Hüsamettin Peker").role("Operatör / Şoför").build(),
            Personnel.builder().fullName("Hüseyin Öneş").role("Elektrikçi").build(),
            Personnel.builder().fullName("Mehmet Akyüz").role("Yardımcı Personel").build(),
            Personnel.builder().fullName("Oğuzhan Kaya").role("İSG Uzmanı").build(),
            Personnel.builder().fullName("Süleyman Aksu").role("Şoför").build(),
            Personnel.builder().fullName("Yunus Emre Aksu").role("Elektrikçi").build(),
            Personnel.builder().fullName("Yusuf Can Ağveranlı").role("Elektrik Mühendisi / Proje Sorumlusu").build(),
            Personnel.builder().fullName("Yüksel Kökçü").role("Yardımcı Personel").build()
        );
        personnelRepository.saveAll(staff);
    }

    private void seedVehicles() {
        List<Vehicle> vehicles = List.of(
            Vehicle.builder().plate("25 GD 821").brandModel("Isuzu - Sepetli Kamyonet").type("Sepetli Vinç").build(),
            Vehicle.builder().plate("25 GD 822").brandModel("Isuzu - Sepetli Kamyonet").type("Sepetli Vinç").build(),
            Vehicle.builder().plate("25 GD 824").brandModel("Isuzu - Sepetli Kamyonet").type("Sepetli Vinç").build(),
            Vehicle.builder().plate("25 GD 826").brandModel("Isuzu - Sepetli Kamyonet").type("Sepetli Vinç").build()
        );
        vehicleRepository.saveAll(vehicles);
    }
}
