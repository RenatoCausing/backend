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

    @Override
    public List<AdviserDTO> getAllAdvisersFromFaculty(Integer facultyId) {
        return adminRepository.findByRoleAndFacultyFacultyId("faculty", facultyId).stream()
                .map(admin -> toDTO(admin)) // Use lambda instead of method reference
                .collect(Collectors.toList());
    }

    @Override
    public List<AdviserDTO> getAllAdvisers() {
        return adminRepository.findByRole("faculty").stream()
                .map(admin -> toDTO(admin)) // Use lambda instead of method reference
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

    private AdviserDTO toDTO(Admin admin) {
        AdviserDTO dto = new AdviserDTO();
        dto.setAdminId(admin.getAdminId());
        dto.setFirstName(admin.getFirstName());
        dto.setLastName(admin.getLastName());
        dto.setMiddleName(admin.getMiddleName());
        dto.setFacultyId(admin.getFaculty() != null ? admin.getFaculty().getFacultyId() : null);
        dto.setEmail(admin.getEmail()); // This line is crucial!
        dto.setImagePath(admin.getImagePath());
        dto.setDescription(admin.getDescription());
        return dto;
    }
}