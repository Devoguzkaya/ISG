package com.isg.backend.service;

import com.isg.backend.model.PhysicalDocument;
import com.isg.backend.model.Personnel;
import com.isg.backend.repository.PhysicalDocumentRepository;
import com.isg.backend.repository.PersonnelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhysicalDocumentService {

    private final PhysicalDocumentRepository repository;
    private final PersonnelRepository personnelRepository;

    public List<PhysicalDocument> getAll() {
        return repository.findAll();
    }

    public List<PhysicalDocument> getByPersonnel(Long personnelId) {
        return repository.findByPersonnelId(personnelId);
    }

    @Transactional
    public PhysicalDocument updateStatus(Long personnelId, String documentType, boolean isReady) {
        Personnel personnel = personnelRepository.findById(personnelId)
                .orElseThrow(() -> new RuntimeException("Personel bulunamadı"));

        List<PhysicalDocument> docs = repository.findByPersonnelId(personnelId);
        PhysicalDocument doc = docs.stream()
                .filter(d -> d.getDocumentType().equals(documentType))
                .findFirst()
                .orElseGet(() -> PhysicalDocument.builder()
                        .personnel(personnel)
                        .documentType(documentType)
                        .build());

        doc.setReady(isReady);
        return repository.save(doc);
    }
}
