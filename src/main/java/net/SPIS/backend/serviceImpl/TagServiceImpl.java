package net.SPIS.backend.serviceImpl;

import net.SPIS.backend.DTO.TagDTO;
import net.SPIS.backend.DTO.TagViewCountDTO;
import net.SPIS.backend.entities.Tag;
import net.SPIS.backend.repositories.TagRepository;
import net.SPIS.backend.service.TagService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TagServiceImpl implements TagService {

    @Autowired
    private TagRepository tagRepository;

    // Existing methods - Ensure these are present and correct based on your
    // original backend
    @Override
    public List<TagDTO> getAllTags() {
        return tagRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public TagDTO createTag(TagDTO tagDTO) {
        Tag tag = new Tag();
        tag.setTagName(tagDTO.getTagName());
        return toDTO(tagRepository.save(tag));
    }

    @Override
    public void deleteTag(Integer tagId) {
        tagRepository.deleteById(tagId);
    }

    // Implementation for getTagById - This was likely missing or incorrect
    @Override
    public TagDTO getTagById(Integer tagId) {
        return tagRepository.findById(tagId).map(this::toDTO).orElse(null);
    }

    // Implementation for updateTag - This was likely missing or incorrect
    @Override
    public TagDTO updateTag(Integer tagId, TagDTO tagDTO) {
        return tagRepository.findById(tagId).map(existingTag -> {
            existingTag.setTagName(tagDTO.getTagName());
            return toDTO(tagRepository.save(existingTag));
        }).orElse(null);
    }

    // Helper method to convert Tag entity to TagDTO
    // (Ensure this method correctly converts your Tag entity to TagDTO)
    private TagDTO toDTO(Tag tag) {
        TagDTO tagDTO = new TagDTO();
        tagDTO.setTagId(tag.getTagId());
        tagDTO.setTagName(tag.getTagName());
        return tagDTO;
    }

    // New method for getting tag view counts - This is the primary addition
    @Override
    public List<TagViewCountDTO> getTagViewCounts() {
        // Step 1: Get Tag IDs and their summed view counts from the repository
        List<Object[]> tagIdAndViews = tagRepository.findTagIdAndTotalViews();

        // Step 2: Get all tags to map IDs to names
        Map<Integer, String> tagIdToNameMap = tagRepository.findAll().stream()
                .collect(Collectors.toMap(Tag::getTagId, Tag::getTagName));

        // Step 3: Combine data into TagViewCountDTOs
        List<TagViewCountDTO> result = new ArrayList<>();
        for (Object[] row : tagIdAndViews) {
            Integer tagId = (Integer) row[0];
            Long totalViews = (Long) row[1];
            String tagName = tagIdToNameMap.getOrDefault(tagId, "Unknown Tag");

            result.add(new TagViewCountDTO(tagId, tagName, totalViews));
        }

        // Optional: Sort the results by totalViews in descending order (highest views
        // first)
        return result.stream()
                .sorted(Comparator.comparing(TagViewCountDTO::getTotalViews).reversed())
                .collect(Collectors.toList());
    }
}