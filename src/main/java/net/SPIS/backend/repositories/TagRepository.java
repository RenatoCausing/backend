package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional; // Import Optional

public interface TagRepository extends JpaRepository<Tag, Integer> {
    // Add this method to find by name (case-insensitive)
    Optional<Tag> findByTagNameIgnoreCase(String tagName);

    @Query("SELECT t.tagId, COALESCE(SUM(s.viewCount), 0) " +
            "FROM Tag t LEFT JOIN SPTags st ON t.tagId = st.tag.tagId " + // Join Tag to SPTags entity
            "LEFT JOIN SP s ON st.sp.spId = s.spId " + // Join SPTags entity to SP entity
            "GROUP BY t.tagId")
    List<Object[]> findTagIdAndTotalViews();
}