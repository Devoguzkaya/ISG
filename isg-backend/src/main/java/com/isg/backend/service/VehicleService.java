package com.isg.backend.service;

import com.isg.backend.model.Vehicle;
import com.isg.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle saveVehicle(Vehicle vehicle) {
        if (vehicle.getId() != null) {
            Vehicle existing = vehicleRepository.findById(vehicle.getId()).orElse(null);
            if (existing != null) {
                existing.setPlate(vehicle.getPlate());
                existing.setBrandModel(vehicle.getBrandModel());
                existing.setType(vehicle.getType());
                existing.setDescription(vehicle.getDescription());
                existing.setActive(vehicle.isActive());
                existing.setDeactivationDate(vehicle.getDeactivationDate());
                return vehicleRepository.save(existing);
            }
        }
        return vehicleRepository.save(vehicle);
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id).orElse(null);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}
