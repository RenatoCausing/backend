package net.SPIS.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "faculty")
@Data
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer facultyId;  

    @Column(name = "faculty_name", nullable = false)
    private String facultyName;
}