package com.isg.backend.service;

import com.isg.backend.model.DailyNote;
import com.isg.backend.repository.DailyNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailyNoteService {

    private final DailyNoteRepository dailyNoteRepository;

    public List<DailyNote> getAllNotes() {
        return dailyNoteRepository.findAll();
    }

    public DailyNote saveNote(DailyNote note) {
        return dailyNoteRepository.save(note);
    }
}
