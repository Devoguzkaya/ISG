package com.isg.backend.repository;

import com.isg.backend.model.DailyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailyNoteRepository extends JpaRepository<DailyNote, Long> {
    java.util.List<DailyNote> findAllByOrderByCreatedAtDesc();
}
