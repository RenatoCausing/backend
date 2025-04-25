package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.SP;
import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.Pageable; // Import Pageable
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface SPRepository extends JpaRepository<SP, Integer> {

    // Method to find SPs by Adviser Admin ID with pagination
    Page<SP> findByAdviserAdminId(Integer adviserId, Pageable pageable);

    // Method to find SPs by Student ID with pagination
    Page<SP> findByStudentsStudentId(Integer studentId, Pageable pageable);

    // Method to find SPs by Adviser Faculty ID with pagination
    Page<SP> findByAdviserFacultyId(Integer facultyId, Pageable pageable);

    // Method to find SPs by Tag IDs with pagination
    Page<SP> findByTagsTagIdIn(List<Integer> tagIds, Pageable pageable);

    // Method to find SPs by Student Faculty ID with pagination
    Page<SP> findByStudentsFacultyFacultyId(Integer facultyId, Pageable pageable);

    // Custom query to find top SPs by view count with pagination
    @Query("SELECT s FROM SP s ORDER BY s.viewCount DESC")
    Page<SP> findTopSPs(Pageable pageable);

    // Custom query to find top advisers by total SP view count
    // This query doesn't need pagination for the advisers themselves,
    // but the underlying SP data used for aggregation could be large.
    // The current query aggregates and limits the advisers, which is fine.
    @Query("SELECT a, SUM(s.viewCount) as totalViews FROM SP s JOIN s.adviser a GROUP BY a ORDER BY totalViews DESC")
    List<Object[]> findTopAdvisersByViews(Pageable pageable); // Keep Pageable for limiting advisers

    // Custom query for filtering SPs based on multiple criteria with pagination
    @Query("SELECT s FROM SP s " +
            "LEFT JOIN s.students student " +
            "LEFT JOIN s.tags tag " +
            "LEFT JOIN s.adviser adviser " +
            "LEFT JOIN student.faculty studentFaculty " + // Join student's faculty
            "WHERE (:adviserIds IS NULL OR adviser.adminId IN :adviserIds) " +
            "AND (:tagIds IS NULL OR tag.tagId IN :tagIds) " +
            "AND (:facultyId IS NULL OR studentFaculty.facultyId = :facultyId) " + // Filter by student's faculty
            "AND (:searchTerm IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(s.abstractText) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) "
            +
            "GROUP BY s.spId") // Group by sp.spId to avoid duplicates when joining many-to-many
    Page<SP> filterSPs(
            @Param("adviserIds") List<Integer> adviserIds,
            @Param("tagIds") List<Integer> tagIds,
            @Param("facultyId") Integer facultyId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable); // Add Pageable parameter

    // Method to find all SPs with pagination
    Page<SP> findAll(Pageable pageable); // Ensure this method is available for general fetching

    // Existing method for incrementing view count
    @Modifying
    @Query("UPDATE SP s SET s.viewCount = s.viewCount + 1 WHERE s.spId = :spId")
    void incrementViewCountById(@Param("spId") Integer spId);

    // Add other necessary repository methods if they don't exist and you need them
    // for pagination
    // For example, finding by title or abstract with pagination might use the
    // filterSPs query.
}
