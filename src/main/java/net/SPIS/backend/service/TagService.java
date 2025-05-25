package net.SPIS.backend.service;

import net.SPIS.backend.DTO.TagDTO;
import net.SPIS.backend.DTO.TagViewCountDTO; // Import the new DTO
import java.util.List;

public interface TagService {
    List<TagDTO> getAllTags();

    TagDTO createTag(TagDTO tagDTO);

    void deleteTag(Integer tagId);

    TagDTO getTagById(Integer tagId); // Ensure this method exists if you use it

    TagDTO updateTag(Integer tagId, TagDTO tagDTO); // Ensure this method exists

    // New method for getting tag view counts
    List<TagViewCountDTO> getTagViewCounts();
}