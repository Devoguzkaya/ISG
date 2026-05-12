package com.isg.backend.repository;

import com.isg.backend.model.PhysicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PhysicalDocumentRepository extends JpaRepository<PhysicalDocument, Long> {
    List<PhysicalDocument> findByPersonnelId(Long personnelId);
}
