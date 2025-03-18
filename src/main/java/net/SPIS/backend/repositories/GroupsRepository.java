package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.Groups;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupsRepository extends JpaRepository<Groups, Integer> {
    List<Groups> findByStudentsFacultyFacultyId(Integer facultyId); // Corrected method name
}