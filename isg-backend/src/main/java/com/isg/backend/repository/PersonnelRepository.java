package com.isg.backend.repository;

import com.isg.backend.model.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PersonnelRepository extends JpaRepository<Personnel, Long> {

    @Query("SELECT p FROM Personnel p WHERE p.validFrom <= :date AND (p.validTo > :date OR p.validTo IS NULL)")
    List<Personnel> findAllAtDate(@Param("date") LocalDateTime date);
}
