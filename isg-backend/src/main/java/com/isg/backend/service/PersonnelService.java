package com.isg.backend.service;

import com.isg.backend.model.Personnel;
import com.isg.backend.repository.PersonnelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PersonnelService {

    private final PersonnelRepository personnelRepository;

    public List<Personnel> getAllPersonnel() {
        return personnelRepository.findAll();
    }

    public List<Personnel> getPersonnelAtDate(LocalDateTime date) {
        return personnelRepository.findAllAtDate(date);
    }

    public Personnel savePersonnel(Personnel personnel) {
        if (personnel.getId() != null) {
            Personnel existing = personnelRepository.findById(personnel.getId()).orElse(null);
            if (existing != null) {
                // Update only editable fields, preserve others like validFrom
                existing.setFullName(personnel.getFullName());
                existing.setRole(personnel.getRole());
                existing.setPhone(personnel.getPhone());
                existing.setTcNo(personnel.getTcNo());
                existing.setActive(personnel.isActive());
                existing.setValidTo(personnel.getValidTo());
                return personnelRepository.save(existing);
            }
        }
        return personnelRepository.save(personnel);
    }

    public Personnel getPersonnelById(Long id) {
        return personnelRepository.findById(id).orElse(null);
    }

    public void deletePersonnel(Long id) {
        personnelRepository.deleteById(id);
    }
}
