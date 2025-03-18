package net.SPIS.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tag")
@Data
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tagId;

    @Column(name = "tag_name", nullable = false, unique = true)
    private String tagName;
}