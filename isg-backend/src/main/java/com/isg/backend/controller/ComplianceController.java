package com.isg.backend.controller;

import com.isg.backend.model.Certificate;
import com.isg.backend.model.VehicleDocument;
import com.isg.backend.service.ComplianceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComplianceController {

    private final ComplianceService complianceService;

    @GetMapping("/expiring/certificates")
    public List<Certificate> getExpiringCertificates(@RequestParam(defaultValue = "30") int days) {
        return complianceService.getExpiringCertificates(days);
    }

    @GetMapping("/expiring/vehicle-documents")
    public List<VehicleDocument> getExpiringVehicleDocuments(@RequestParam(defaultValue = "30") int days) {
        return complianceService.getExpiringVehicleDocuments(days);
    }
}
