package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.SP;
import org.springframework.data.domain.Pageable;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import jakarta.transaction.Transactional;

import java.util.List;

public interface SPRepository extends JpaRepository<SP, Integer> {
    List<SP> findByAdviserAdminId(Integer adviserId);

    List<SP> findByGroupStudentsStudentId(Integer studentId);

    List<SP> findByGroupStudentsFacultyFacultyId(Integer facultyId); // Corrected path

    List<SP> findByTagsTagIdIn(List<Integer> tagIds);

    // ✅ NEW: Increment view count
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

}
