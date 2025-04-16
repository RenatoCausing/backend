package net.SPIS.backend.controllers;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.service.AdviserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advisers")
public class AdviserController {

    @Autowired
    private AdviserService adviserService;

    @GetMapping("/faculty/{facultyId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public List<AdviserDTO> getAllAdvisersFromFaculty(@PathVariable Integer facultyId) {
        return adviserService.getAllAdvisersFromFaculty(facultyId);
    }

    @GetMapping
    @CrossOrigin(origins = "http://localhost:3000")
    public List<AdviserDTO> getAllAdvisers() {
        return adviserService.getAllAdvisers();
    }

    @GetMapping("/{adviserId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public AdviserDTO getAdviser(@PathVariable Integer adviserId) {
        return adviserService.getAdviser(adviserId);
    }

    @GetMapping("/sp/{spId}")

    @CrossOrigin(origins = "http://localhost:3000")
    public AdviserDTO getAdviserFromSP(@PathVariable Integer spId) {
        return adviserService.getAdviserFromSP(spId);
    }

    // In AdviserController.java

    @CrossOrigin(origins = "http://localhost:3000")
    @PutMapping("/{adviserId}/description")
    public AdviserDTO updateAdviserDescription(@PathVariable Integer adviserId,
            @RequestBody Map<String, String> payload) {
        String description = payload.get("description");
        return adviserService.updateAdviserDescription(adviserId, description);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @PutMapping("/{adviserId}/image")
    public AdviserDTO updateAdviserImage(@PathVariable Integer adviserId, @RequestBody Map<String, String> payload) {
        String imagePath = payload.get("imagePath");
        return adviserService.updateAdviserImage(adviserId, imagePath);
    }
}