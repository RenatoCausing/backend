package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.SP;
import net.SPIS.backend.entities.Student; // Import Student
import net.SPIS.backend.entities.Groups; // Import Groups (if needed for other methods, otherwise remove)
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set; // Import Set

public interface SPRepository extends JpaRepository<SP, Integer> {
        List<SP> findByAdviserAdminId(Integer adviserId);

        List<SP> findByTagsTagIdIn(List<Integer> tagIds);

        @Transactional
        @Modifying
        @Query("UPDATE SP sp SET sp.viewCount = sp.viewCount + 1 WHERE sp.spId = :spId")
        void incrementViewCountById(Integer spId);

        @Query("SELECT sp FROM SP sp ORDER BY sp.viewCount DESC")
        List<SP> findMostViewedSPs(Pageable pageable);

        @Query("SELECT sp FROM SP sp ORDER BY sp.viewCount DESC")
        List<SP> findTopSPs(PageRequest pageable);

        @Query("SELECT a, COALESCE(SUM(sp.viewCount), 0) FROM Admin a " +
                        "LEFT JOIN SP sp ON a.adminId = sp.adviser.adminId " +
                        "WHERE a.role = 'faculty' " +
                        "GROUP BY a.adminId, a.firstName, a.lastName " +
                        "ORDER BY COALESCE(SUM(sp.viewCount), 0) DESC")
        List<Object[]> findTopAdvisersByViews(Pageable pageable);

        // Find SPs by Student ID using the Many-to-Many relationship
        List<SP> findByStudentsStudentId(Integer studentId);

        @Query("SELECT sp FROM SP sp JOIN sp.adviser adviser JOIN adviser.faculty faculty WHERE faculty.facultyId = :facultyId")
        List<SP> findByAdviserFacultyId(@Param("facultyId") Integer facultyId);

}