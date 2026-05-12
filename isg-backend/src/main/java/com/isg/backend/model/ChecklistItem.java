package com.isg.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "checklist_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "checklist_id", nullable = false)
    @JsonIgnore
    private Checklist checklist;

    @Column(nullable = false)
    private String questionCode; // e.g., "1.1", "2.1"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(nullable = false)
    private String result; // "OK", "NOT_OK", "N/A" (Gerekli Değil)

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
