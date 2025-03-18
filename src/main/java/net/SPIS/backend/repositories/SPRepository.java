package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.SP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SPRepository extends JpaRepository<SP, Integer> {
    List<SP> findByAdviserAdminId(Integer adviserId);

    List<SP> findByGroupStudentsStudentId(Integer studentId);

    List<SP> findByGroupStudentsFacultyFacultyId(Integer facultyId); // Corrected path

    List<SP> findByTagsTagIdIn(List<Integer> tagIds);
}