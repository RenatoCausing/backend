package net.SPIS.backend.controllers;

import net.SPIS.backend.DTO.TagDTO;
import net.SPIS.backend.DTO.TagViewCountDTO;
import net.SPIS.backend.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @GetMapping
    @CrossOrigin(origins = "http://localhost:3000")
    public List<TagDTO> getAllTags() {
        return tagService.getAllTags();
    }

    @PostMapping
    @CrossOrigin(origins = "http://localhost:3000")
    public TagDTO createTag(@RequestBody TagDTO tagDTO) {
        return tagService.createTag(tagDTO);
    }

    @DeleteMapping("/{tagId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<Void> deleteTag(@PathVariable Integer tagId) {
        tagService.deleteTag(tagId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves a list of all tags with their aggregated view counts from
     * associated SPs.
     * The list is sorted by total views in descending order.
     *
     * @return ResponseEntity containing a list of TagViewCountDTO objects.
     */
    @GetMapping("/view-counts")
    public ResponseEntity<List<TagViewCountDTO>> getTagViewCounts() {
        List<TagViewCountDTO> tagViewCounts = tagService.getTagViewCounts();
        return ResponseEntity.ok(tagViewCounts);
    }
}