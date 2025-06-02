package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;  

public interface TagRepository extends JpaRepository<Tag, Integer> {
     
    Optional<Tag> findByTagNameIgnoreCase(String tagName);

    @Query("SELECT t.tagId, COALESCE(SUM(s.viewCount), 0) " +
            "FROM Tag t LEFT JOIN SPTags st ON t.tagId = st.tag.tagId " +  
            "LEFT JOIN SP s ON st.sp.spId = s.spId " +  
            "GROUP BY t.tagId")
    List<Object[]> findTagIdAndTotalViews();
}