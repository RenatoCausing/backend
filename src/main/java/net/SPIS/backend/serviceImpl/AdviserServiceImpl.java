package net.SPIS.backend.serviceImpl;

import net.SPIS.backend.DTO.*;
import net.SPIS.backend.entities.*;
import net.SPIS.backend.repositories.*;
import net.SPIS.backend.service.AdviserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdviserServiceImpl implements AdviserService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private SPRepository spRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Override
    public List<AdviserDTO> getAllAdvisersFromFaculty(Integer facultyId) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        return adminRepository.findByRoleAndFaculty("faculty", faculty).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdviserDTO> getAllAdvisers() {
        return adminRepository.findByRole("faculty").stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AdviserDTO getAdviser(Integer adviserId) {
        return toDTO(adminRepository.findById(adviserId)
                .orElseThrow(() -> new RuntimeException("Adviser not found")));
    }

    @Override
    public AdviserDTO getAdviserFromSP(Integer spId) {
        return toDTO(spRepository.findById(spId)
                .orElseThrow(() -> new RuntimeException("SP not found")).getAdviser());
    }

    @Override
    @Transactional
    public AdviserDTO updateAdviser(Integer adviserId, AdviserDTO adviserDTO) {
        Admin admin = adminRepository.findById(adviserId)
                .orElseThrow(() -> new RuntimeException("Adviser not found"));

        // Update properties
        if (adviserDTO.getFirstName() != null)
            admin.setFirstName(adviserDTO.getFirstName());
        if (adviserDTO.getLastName() != null)
            admin.setLastName(adviserDTO.getLastName());
        if (adviserDTO.getMiddleName() != null)
            admin.setMiddleName(adviserDTO.getMiddleName());
        if (adviserDTO.getEmail() != null)
            admin.setEmail(adviserDTO.getEmail());
        if (adviserDTO.getImagePath() != null)
            admin.setImagePath(adviserDTO.getImagePath());
        if (adviserDTO.getDescription() != null)
            admin.setDescription(adviserDTO.getDescription());

        // Handle faculty (which can be null)
        if (adviserDTO.getFacultyId() != null) {
            Faculty faculty = facultyRepository.findById(adviserDTO.getFacultyId())
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));
            admin.setFaculty(faculty);
        } else {
            admin.setFaculty(null);
        }

        return toDTO(adminRepository.save(admin));
    }

    @Override
    @Transactional
    public AdviserDTO updateAdviserDescription(Integer adviserId, String description) {
        Admin admin = adminRepository.findById(adviserId)
                .orElseThrow(() -> new RuntimeException("Adviser not found"));
        admin.setDescription(description);
        return toDTO(adminRepository.save(admin));
    }

    @Override
    @Transactional
    public AdviserDTO updateAdviserImage(Integer adviserId, String imagePath) {
        Admin admin = adminRepository.findById(adviserId)
                .orElseThrow(() -> new RuntimeException("Adviser not found"));
        admin.setImagePath(imagePath);
        return toDTO(adminRepository.save(admin));
    }

    // Methods needed for UserManagementPanel functionality
    @Override
    public List<AdviserDTO> getAllUsers() {
        return adminRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdviserDTO> getUsersByFaculty(Integer facultyId) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        return adminRepository.findByFaculty(faculty).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdviserDTO> getUsersByRole(String role) {
        // For student role, we need to handle null values as they're stored as null in
        // the DB
        if (role.equals("student")) {
            return adminRepository.findByRoleIsNull().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
        return adminRepository.findByRole(role).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdviserDTO> getUsersByFacultyAndRole(Integer facultyId, String role) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        // For student role, we need to handle null values
        if (role.equals("student")) {
            return adminRepository.findByFacultyAndRoleIsNull(faculty).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
        return adminRepository.findByFacultyAndRole(faculty, role).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdviserDTO> searchUsers(String searchTerm) {
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";
        return adminRepository.findByNameOrEmailContainingIgnoreCase(searchPattern).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AdviserDTO createUser(Admin adminData) {
        Admin newAdmin = new Admin();
        newAdmin.setFirstName(adminData.getFirstName());
        newAdmin.setMiddleName(adminData.getMiddleName());
        newAdmin.setLastName(adminData.getLastName());
        newAdmin.setEmail(adminData.getEmail());
        newAdmin.setRole(adminData.getRole());
        newAdmin.setFaculty(adminData.getFaculty());
        newAdmin.setImagePath(adminData.getImagePath());
        newAdmin.setDescription(adminData.getDescription());

        Admin savedAdmin = adminRepository.save(newAdmin);
        return toDTO(savedAdmin);
    }

    @Override
    @Transactional
    public AdviserDTO updateUser(Integer adminId, Admin adminData) {
        Admin existingAdmin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (adminData.getFirstName() != null)
            existingAdmin.setFirstName(adminData.getFirstName());
        if (adminData.getMiddleName() != null)
            existingAdmin.setMiddleName(adminData.getMiddleName());
        if (adminData.getLastName() != null)
            existingAdmin.setLastName(adminData.getLastName());
        if (adminData.getEmail() != null)
            existingAdmin.setEmail(adminData.getEmail());

        // Handle special cases for nullable fields
        existingAdmin.setRole(adminData.getRole()); // Can be null
        existingAdmin.setFaculty(adminData.getFaculty()); // Can be null

        if (adminData.getImagePath() != null)
            existingAdmin.setImagePath(adminData.getImagePath());
        if (adminData.getDescription() != null)
            existingAdmin.setDescription(adminData.getDescription());

        Admin updatedAdmin = adminRepository.save(existingAdmin);
        return toDTO(updatedAdmin);
    }

    @Override
    @Transactional
    public void deleteUser(Integer adminId) {
        if (!adminRepository.existsById(adminId)) {
            throw new RuntimeException("User not found");
        }
        adminRepository.deleteById(adminId);
    }

    @Override
    public AdviserDTO toDTO(Admin admin) {
        AdviserDTO dto = new AdviserDTO();
        dto.setAdminId(admin.getAdminId()); 
        dto.setFirstName(admin.getFirstName());
        dto.setLastName(admin.getLastName());
        dto.setMiddleName(admin.getMiddleName());

        // Handle faculty relationship
        if (admin.getFaculty() != null) {
            dto.setFacultyId(admin.getFaculty().getFacultyId());
        } else {
            dto.setFacultyId(null);
        }

        dto.setEmail(admin.getEmail());
        dto.setImagePath(admin.getImagePath());
        dto.setDescription(admin.getDescription());
        dto.setRole(admin.getRole()); // Add role to DTO
        return dto;
    }
}