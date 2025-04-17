package net.SPIS.backend.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.entities.Admin;
import net.SPIS.backend.repositories.AdminRepository;
import net.SPIS.backend.service.AdviserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advisers")
public class AdviserController {
    @Autowired
    private AdminRepository adminRepository;

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

    @GetMapping("/process-oauth")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<AdviserDTO> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        try {
            if (principal == null) {
                System.err.println("OAuth principal is null!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String email = principal.getAttribute("email");
            System.out.println("Processing OAuth for email: " + email);

            Admin admin = adminRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("Found admin ID: " + admin.getAdminId());
            AdviserDTO dto = adviserService.toDTO(admin);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("Error in process-oauth: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/check-guest")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<String> redirectGuest() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, "http://localhost:3000")
                .build();
    }
}