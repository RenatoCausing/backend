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
            System.err.println("ERROR: OAuth principal is null!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = principal.getAttribute("email");
        if (email == null) {
            System.err.println("ERROR: Email attribute is missing from OAuth principal");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        System.out.println("Processing OAuth for email: " + email);
        
        // Find admin by email or create a new one if not found
        Admin admin = adminRepository.findByEmail(email).orElse(null);
        
        if (admin == null) {
            // Create new admin if not found
            admin = new Admin();
            admin.setEmail(email);
            admin.setFirstName(principal.getAttribute("given_name"));
            admin.setLastName(principal.getAttribute("family_name"));
            admin.setImagePath(principal.getAttribute("picture"));
            admin.setRole(null);
            
            try {
                admin = adminRepository.save(admin);
                System.out.println("Created new admin with ID: " + admin.getAdminId());
            } catch (Exception e) {
                System.err.println("ERROR saving admin: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
            }
        } else {
            System.out.println("Found existing admin with ID: " + admin.getAdminId());
        }
        
        AdviserDTO dto = adviserService.toDTO(admin);
        return ResponseEntity.ok(dto);
    } catch (Exception e) {
        System.err.println("Unhandled error in process-oauth: " + e.getMessage());
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

    @PostMapping("/dev-login")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<AdviserDTO> devLogin(@RequestBody Map<String, String> body) {
        // Only enable this in development mode!
        if (!"development".equals(System.getProperty("spring.profiles.active"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String email = body.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().build();
        }

        // Find or create admin
        Admin admin = adminRepository.findByEmail(email).orElseGet(() -> {
            Admin newAdmin = new Admin();
            newAdmin.setEmail(email);
            newAdmin.setFirstName("Dev");
            newAdmin.setLastName("User");
            newAdmin.setRole(null);
            return adminRepository.save(newAdmin);
        });

        return ResponseEntity.ok(adviserService.toDTO(admin));
    }
}