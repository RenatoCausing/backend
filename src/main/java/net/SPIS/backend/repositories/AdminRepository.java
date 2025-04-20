package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Integer> {
    List<Admin> findByRole(String role);

    List<Admin> findByRoleAndFacultyFacultyId(String role, Integer facultyId);

    List<Admin> findByFirstNameAndLastName(String firstName, String lastName);
    Optional<Admin> findByEmail(String email);
}