package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.Admin;
import net.SPIS.backend.entities.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {
    // Existing methods - modified to match the DB schema with Faculty entity
    List<Admin> findByRole(String role);
    List<Admin> findByRoleAndFaculty(String role, Faculty faculty);
    List<Admin> findByFirstNameAndLastName(String firstName, String lastName);
    Optional<Admin> findByEmail(String email);
    
    // New methods needed for UserManagementPanel
    @Query("SELECT a FROM Admin a WHERE a.role IS NULL")
    List<Admin> findByRoleIsNull();
    
    List<Admin> findByFaculty(Faculty faculty);
    
    List<Admin> findByFacultyAndRole(Faculty faculty, String role);
    
    @Query("SELECT a FROM Admin a WHERE a.faculty = :faculty AND a.role IS NULL")
    List<Admin> findByFacultyAndRoleIsNull(@Param("faculty") Faculty faculty);
    
    @Query("SELECT a FROM Admin a WHERE " +
           "LOWER(a.firstName) LIKE :searchPattern OR " +
           "LOWER(a.lastName) LIKE :searchPattern OR " +
           "LOWER(a.email) LIKE :searchPattern")
    List<Admin> findByNameOrEmailContainingIgnoreCase(@Param("searchPattern") String searchPattern);
}