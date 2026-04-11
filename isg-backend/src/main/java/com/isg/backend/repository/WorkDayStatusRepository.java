package com.isg.backend.repository;

import com.isg.backend.model.WorkDayStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface WorkDayStatusRepository extends JpaRepository<WorkDayStatus, Long> {
    Optional<WorkDayStatus> findByDate(LocalDate date);
}
