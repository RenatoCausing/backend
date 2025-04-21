package net.SPIS.backend.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.entities.Admin;
import net.SPIS.backend.entities.Faculty;
import net.SPIS.backend.repositories.AdminRepository;
import net.SPIS.backend.repositories.FacultyRepository;
import net.SPIS.backend.service.AdviserService;
import org.springframework.beans.factory.annotation.Autowired;
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
    private FacultyRepository facultyRepository;

    @Autowired
    private AdviserService adviserService;

    // Keep existing endpoints
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

    // Add new endpoints for UserManagementPanel

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/users/all")
    public ResponseEntity<List<AdviserDTO>> getAllUsers() {
        try {
            List<AdviserDTO> users = adviserService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error getting all users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/users/filter")
    public ResponseEntity<List<AdviserDTO>> getFilteredUsers(
            @RequestParam(required = false) Integer facultyId,
            @RequestParam(required = false) String role) {
        try {
            List<AdviserDTO> users;
            
            if (facultyId != null && role != null) {
                users = adviserService.getUsersByFacultyAndRole(facultyId, role);
            } else if (facultyId != null) {
                users = adviserService.getUsersByFaculty(facultyId);
            } else if (role != null) {
                users = adviserService.getUsersByRole(role);
            } else {
                users = adviserService.getAllUsers();
            }
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error filtering users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/users/search")
    public ResponseEntity<List<AdviserDTO>> searchUsers(@RequestParam String term) {
        try {
            List<AdviserDTO> users = adviserService.searchUsers(term);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Modified endpoint for updating admin users
    @CrossOrigin(origins = "http://localhost:3000")
    @PutMapping("/admin/{adminId}/update")
    public ResponseEntity<AdviserDTO> updateAdminUser(
            @PathVariable Integer adminId, 
            @RequestBody Map<String, Object> adminData) {
        try {
            Admin admin = new Admin();
            // Set basic properties
            if (adminData.get("firstName") != null) admin.setFirstName((String) adminData.get("firstName"));
            if (adminData.get("lastName") != null) admin.setLastName((String) adminData.get("lastName"));
            if (adminData.get("middleName") != null) admin.setMiddleName((String) adminData.get("middleName"));
            if (adminData.get("email") != null) admin.setEmail((String) adminData.get("email"));
            if (adminData.get("role") != null) admin.setRole((String) adminData.get("role"));
            if (adminData.get("imagePath") != null) admin.setImagePath((String) adminData.get("imagePath"));
            if (adminData.get("description") != null) admin.setDescription((String) adminData.get("description"));
            
            // Handle faculty using facultyId
            if (adminData.get("facultyId") != null) {
                Integer facultyId = Integer.valueOf(adminData.get("facultyId").toString());
                Faculty faculty = facultyRepository.findById(facultyId)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));
                admin.setFaculty(faculty);
            }
            
            AdviserDTO updatedUser = adviserService.updateUser(adminId, admin);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            System.err.println("Error updating admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Modified endpoint for creating new admin users
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/admin/create")
    public ResponseEntity<AdviserDTO> createAdminUser(@RequestBody Admin adminData) {
        try {
            // Handle the Faculty object correctly
            if (adminData.getFaculty() != null && adminData.getFaculty().getFacultyId() != null) {
                Faculty faculty = facultyRepository.findById(adminData.getFaculty().getFacultyId())
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));
                adminData.setFaculty(faculty);
            }
            
            AdviserDTO newUser = adviserService.createUser(adminData);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (Exception e) {
            System.err.println("Error creating admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Keep the existing endpoint for deleting admin users
    @CrossOrigin(origins = "http://localhost:3000")
    @DeleteMapping("/admin/{adminId}")
    public ResponseEntity<Void> deleteAdminUser(@PathVariable Integer adminId) {
        try {
            adviserService.deleteUser(adminId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Updated OAuth related endpoint to work with the Faculty entity
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
                    admin.setFaculty(null);

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
            newAdmin.setFaculty(null);
            return adminRepository.save(newAdmin);
        });

        return ResponseEntity.ok(adviserService.toDTO(admin));
    }
}