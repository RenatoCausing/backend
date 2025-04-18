package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    List<Student> findByFacultyFacultyId(Integer facultyId);

    List<Student> findByGroup(Groups group);
}