package com.isg.backend.repository;

import com.isg.backend.model.NoteComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteCommentRepository extends JpaRepository<NoteComment, Long> {
}
