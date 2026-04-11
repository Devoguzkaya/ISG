package com.isg.backend.controller;

import com.isg.backend.model.WorkDayStatus;
import com.isg.backend.repository.WorkDayStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/work-status")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkDayStatusController {

    private final WorkDayStatusRepository repository;

    @GetMapping
    public List<WorkDayStatus> getAllStatuses() {
        return repository.findAll();
    }

    @PostMapping
    public WorkDayStatus toggleStatus(@RequestBody WorkDayStatus status) {
        return repository.findByDate(status.getDate())
                .map(existing -> {
                    existing.setWorkOccurred(status.isWorkOccurred());
                    return repository.save(existing);
                })
                .orElseGet(() -> repository.save(status));
    }
}
