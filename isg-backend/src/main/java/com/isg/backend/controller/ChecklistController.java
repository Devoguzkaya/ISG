package com.isg.backend.controller;

import com.isg.backend.model.Checklist;
import com.isg.backend.service.ChecklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/checklists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChecklistController {

    private final ChecklistService checklistService;

    @GetMapping
    public List<Checklist> getAllChecklists() {
        return checklistService.getAllChecklists();
    }

    @GetMapping("/{id}")
    public Checklist getChecklistById(@PathVariable Long id) {
        return checklistService.getChecklistById(id);
    }

    @PutMapping("/{id}")
    public Checklist updateChecklist(@PathVariable Long id, @RequestBody Checklist checklist) {
        checklist.setId(id);
        return checklistService.saveChecklist(checklist);
    }
}
