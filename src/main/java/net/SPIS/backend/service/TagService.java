package net.SPIS.backend.service;

import net.SPIS.backend.DTO.TagDTO;

import java.util.List;

public interface TagService {
    List<TagDTO> getAllTags();

    TagDTO createTag(TagDTO tagDTO);

    void deleteTag(Integer tagId);
}