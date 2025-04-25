package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional; // Import Optional

public interface StudentRepository extends JpaRepository<Student, Integer> {
List<Student> findByFacultyFacultyId(Integer facultyId);

// Add this method to find by name (case-insensitive)
Optional<Student> findByLastNameIgnoreCaseAndFirstNameIgnoreCase(String lastName, String firstName);
}