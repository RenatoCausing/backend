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

        @Query(value = "SELECT a.admin_id, a.first_name, a.last_name, a.middle_name, a.role, a.faculty_id, a.image_path, a.description, a.email, COALESCE(SUM(sp.view_count), 0) as total_views "
                        +
                        "FROM admin a " +
                        "LEFT JOIN sp ON a.admin_id = sp.adviser_id " +
                        "WHERE a.role = 'faculty' " +
                        "GROUP BY a.admin_id, a.first_name, a.last_name, a.middle_name, a.role, a.faculty_id, a.image_path, a.description, a.email "
                        +
                        "ORDER BY total_views DESC", nativeQuery = true)
        List<Object[]> findTopAdvisersByViews(Pageable pageable);

        // Find SPs by Student ID using the Many-to-Many relationship
        List<SP> findByStudentsStudentId(Integer studentId);

        @Query("SELECT sp FROM SP sp JOIN sp.adviser adviser JOIN adviser.faculty faculty WHERE faculty.facultyId = :facultyId")
        List<SP> findByAdviserFacultyId(@Param("facultyId") Integer facultyId);

        // New query for combined filtering
        @Query("SELECT DISTINCT sp FROM SP sp " +
                        "LEFT JOIN sp.adviser adviser " +
                        "LEFT JOIN sp.tags tag " +
                        "LEFT JOIN sp.students student " + // Join with students for faculty filtering
                        "LEFT JOIN student.faculty studentFaculty " + // Join students with faculty
                        "WHERE (:adviserIds IS NULL OR adviser.adminId IN :adviserIds) " +
                        "AND (:tagIds IS NULL OR tag.tagId IN :tagIds) " +
                        "AND (:facultyId IS NULL OR studentFaculty.facultyId = :facultyId) " + // Filter by student's
                                                                                               // faculty
                        "AND (:searchTerm IS NULL OR LOWER(sp.title) LIKE %:searchTerm% OR LOWER(sp.abstractText) LIKE %:searchTerm%)")
        List<SP> findSPsByFilters(
                        @Param("adviserIds") List<Integer> adviserIds,
                        @Param("tagIds") List<Integer> tagIds,
                        @Param("facultyId") Integer facultyId,
                        @Param("searchTerm") String searchTerm);
}