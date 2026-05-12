package com.isg.backend.controller;

import com.isg.backend.model.PhysicalDocument;
import com.isg.backend.service.PhysicalDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PhysicalDocumentController {

    private final PhysicalDocumentService service;

    @GetMapping
    public List<PhysicalDocument> getAll() {
        return service.getAll();
    }

    @GetMapping("/personnel/{id}")
    public List<PhysicalDocument> getByPersonnel(@PathVariable Long id) {
        return service.getByPersonnel(id);
    }

    @PostMapping("/status")
    public PhysicalDocument updateStatus(
            @RequestParam Long personnelId,
            @RequestParam String documentType,
            @RequestParam boolean isReady) {
        return service.updateStatus(personnelId, documentType, isReady);
    }
}
