package net.SPIS.backend.service;

import net.SPIS.backend.DTO.TagDTO;
import net.SPIS.backend.DTO.TagViewCountDTO;  
import java.util.List;

public interface TagService {
    List<TagDTO> getAllTags();

    TagDTO createTag(TagDTO tagDTO);

    void deleteTag(Integer tagId);

    TagDTO getTagById(Integer tagId);  

    TagDTO updateTag(Integer tagId, TagDTO tagDTO);  

     
    List<TagViewCountDTO> getTagViewCounts();
}