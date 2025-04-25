package net.SPIS.backend.repositories;

import net.SPIS.backend.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // Import Optional

public interface TagRepository extends JpaRepository<Tag, Integer> {
// Add this method to find by name (case-insensitive)
Optional<Tag> findByTagNameIgnoreCase(String tagName);
}