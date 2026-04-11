package com.isg.backend.service;

import com.isg.backend.model.Checklist;
import com.isg.backend.repository.ChecklistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChecklistService {

    private final ChecklistRepository checklistRepository;

    public List<Checklist> getAllChecklists() {
        return checklistRepository.findAll();
    }

    @Transactional
    public Checklist saveChecklist(Checklist checklist) {
        if (checklist.getItems() != null) {
            checklist.getItems().forEach(item -> item.setChecklist(checklist));
        }
        if (checklist.getPersonnelAudits() != null) {
            checklist.getPersonnelAudits().forEach(p -> p.setChecklist(checklist));
        }
        return checklistRepository.save(checklist);
    }

    public Checklist getChecklistById(Long id) {
        return checklistRepository.findById(id).orElse(null);
    }
}
