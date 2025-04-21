package net.SPIS.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Set;

@Entity
@Table(name = "groups")
@Data
public class Groups {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer groupId;

    @Column(name = "group_name", nullable = false, unique = true)
    private String groupName;

    // REMOVE the OneToMany relationship to Student
    // @OneToMany(mappedBy = "group")
    // private Set<Student> students;
}