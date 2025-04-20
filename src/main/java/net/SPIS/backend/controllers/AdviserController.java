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

    // Add comprehensive update endpoint for Admin users
    @CrossOrigin(origins = "http://localhost:3000")
    @PutMapping("/admin/{adminId}/update")
    public ResponseEntity<AdviserDTO> updateAdminUser(@PathVariable Integer adminId, @RequestBody Admin adminData) {
        try {
            // First check if admin exists
            Admin existingAdmin = adminRepository.findById(adminId).orElse(null);
            if (existingAdmin == null) {
                return ResponseEntity.notFound().build();
            }

            // Update the fields from the request
            if (adminData.getFirstName() != null) existingAdmin.setFirstName(adminData.getFirstName());
            if (adminData.getMiddleName() != null) existingAdmin.setMiddleName(adminData.getMiddleName());
            if (adminData.getLastName() != null) existingAdmin.setLastName(adminData.getLastName());
            if (adminData.getEmail() != null) existingAdmin.setEmail(adminData.getEmail());
            
            // Handle special cases for nullable fields
            existingAdmin.setRole(adminData.getRole()); // Can be null
            existingAdmin.setFacultyId(adminData.getFacultyId()); // Can be null
            
            if (adminData.getImagePath() != null) existingAdmin.setImagePath(adminData.getImagePath());
            if (adminData.getDescription() != null) existingAdmin.setDescription(adminData.getDescription());

            // Save the updated admin
            Admin updatedAdmin = adminRepository.save(existingAdmin);
            
            // Convert to DTO and return
            AdviserDTO dto = adviserService.toDTO(updatedAdmin);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("Error updating admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add endpoint to create new Admin users
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/admin/create")
    public ResponseEntity<AdviserDTO> createAdminUser(@RequestBody Admin adminData) {
        try {
            // Create new admin
            Admin newAdmin = new Admin();
            newAdmin.setFirstName(adminData.getFirstName());
            newAdmin.setMiddleName(adminData.getMiddleName());
            newAdmin.setLastName(adminData.getLastName());
            newAdmin.setEmail(adminData.getEmail());
            newAdmin.setRole(adminData.getRole());
            newAdmin.setFacultyId(adminData.getFacultyId());
            newAdmin.setImagePath(adminData.getImagePath());
            newAdmin.setDescription(adminData.getDescription());

            // Save the new admin
            Admin savedAdmin = adminRepository.save(newAdmin);
            
            // Convert to DTO and return
            AdviserDTO dto = adviserService.toDTO(savedAdmin);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (Exception e) {
            System.err.println("Error creating admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add endpoint to delete Admin users
    @CrossOrigin(origins = "http://localhost:3000")
    @DeleteMapping("/admin/{adminId}")
    public ResponseEntity<Void> deleteAdminUser(@PathVariable Integer adminId) {
        try {
            // Check if admin exists
            if (!adminRepository.existsById(adminId)) {
                return ResponseEntity.notFound().build();
            }
            
            // Delete the admin
            adminRepository.deleteById(adminId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
            String firstName = principal.getAttribute("given_name");
            String lastName = principal.getAttribute("family_name");

            if (firstName == null || lastName == null) {
                System.err.println("ERROR: Name attributes are missing from OAuth principal");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            System.out.println("Processing OAuth for user: " + firstName + " " + lastName);

            // First check if admin exists with this name
            List<Admin> admins = adminRepository.findByFirstNameAndLastName(firstName, lastName);
            Admin admin = null;

            if (!admins.isEmpty()) {
                // Found existing admin with this name
                admin = admins.get(0); // Take the first match
                System.out.println("Found existing admin with ID: " + admin.getAdminId());

                // Update email and image if they're missing
                boolean needsUpdate = false;

                if (admin.getEmail() == null || admin.getEmail().isEmpty()) {
                    admin.setEmail(email);
                    needsUpdate = true;
                }

                if (admin.getImagePath() == null || admin.getImagePath().isEmpty()) {
                    admin.setImagePath(principal.getAttribute("picture"));
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    admin = adminRepository.save(admin);
                    System.out.println("Updated existing admin with Google account details");
                }
            } else {
                // If no match by name, then try by email as fallback
                admin = adminRepository.findByEmail(email).orElse(null);

                if (admin == null) {
                    // Create new admin if not found by name or email
                    admin = new Admin();
                    admin.setEmail(email);
                    admin.setFirstName(firstName);
                    admin.setLastName(lastName);
                    admin.setImagePath(principal.getAttribute("picture"));
                    admin.setRole(null);

                    try {
                        admin = adminRepository.save(admin);
                        System.out.println("Created new admin with ID: " + admin.getAdminId());
                    } catch (Exception e) {
                        System.err.println("ERROR saving admin: " + e.getMessage());
                        e.printStackTrace();
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                    }
                } else {
                    System.out.println("Found existing admin by email with ID: " + admin.getAdminId());
                }
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