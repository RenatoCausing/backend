package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.SP;

import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
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

    // ✅ NEW: Get top viewed SPs
    List<SP> findTopByOrderByViewCountDesc(); // Fetches top 5 most viewed SPs

    @Query("SELECT sp FROM SP sp ORDER BY sp.viewCount DESC")
    List<SP> findTopSPs(PageRequest pageable);
}