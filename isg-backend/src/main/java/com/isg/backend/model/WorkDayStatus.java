package com.isg.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "work_day_statuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkDayStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(nullable = false)
    @Builder.Default
    private boolean workOccurred = false;

    @Column
    private String location;

    // Physical site documents for this specific day
    @Column
    @Builder.Default
    private boolean siteAuditReady = false;

    @Column
    @Builder.Default
    private boolean craneChecklistReady = false;

    @Column
    @Builder.Default
    private boolean workPermitReady = false;

    @Column
    @Builder.Default
    private boolean riskAnalysisReady = false;
}
