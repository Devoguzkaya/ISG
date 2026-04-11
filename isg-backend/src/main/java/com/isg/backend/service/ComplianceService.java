package com.isg.backend.service;

import com.isg.backend.model.Certificate;
import com.isg.backend.model.VehicleDocument;
import com.isg.backend.repository.CertificateRepository;
import com.isg.backend.repository.VehicleDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplianceService {

    private final CertificateRepository certificateRepository;
    private final VehicleDocumentRepository vehicleDocumentRepository;

    public List<Certificate> getExpiringCertificates(int days) {
        LocalDate threshold = LocalDate.now().plusDays(days);
        return certificateRepository.findAll().stream()
                .filter(c -> c.getExpiryDate() != null && c.getExpiryDate().isBefore(threshold))
                .collect(Collectors.toList());
    }

    public List<VehicleDocument> getExpiringVehicleDocuments(int days) {
        LocalDate threshold = LocalDate.now().plusDays(days);
        return vehicleDocumentRepository.findAll().stream()
                .filter(d -> d.getExpiryDate() != null && d.getExpiryDate().isBefore(threshold))
                .collect(Collectors.toList());
    }
}
