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
    private final com.isg.backend.repository.NoteCommentRepository noteCommentRepository;

    public List<DailyNote> getAllNotes() {
        return dailyNoteRepository.findAllByOrderByCreatedAtDesc();
    }

    public DailyNote saveNote(DailyNote note) {
        return dailyNoteRepository.save(note);
    }

    public DailyNote addComment(Long noteId, com.isg.backend.model.NoteComment comment) {
        DailyNote note = dailyNoteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("Note not found"));
        
        comment.setNote(note);
        noteCommentRepository.save(comment);
        
        return dailyNoteRepository.findById(noteId).get();
    }
}
