package com.isg.backend.controller;

import com.isg.backend.model.DailyNote;
import com.isg.backend.service.DailyNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DailyNoteController {

    private final DailyNoteService dailyNoteService;

    @GetMapping
    public List<DailyNote> getAllNotes() {
        return dailyNoteService.getAllNotes();
    }

    @PostMapping
    public DailyNote createNote(@RequestBody DailyNote note) {
        return dailyNoteService.saveNote(note);
    }

    @PostMapping("/{id}/comments")
    public DailyNote addComment(@PathVariable Long id, @RequestBody com.isg.backend.model.NoteComment comment) {
        return dailyNoteService.addComment(id, comment);
    }
}
