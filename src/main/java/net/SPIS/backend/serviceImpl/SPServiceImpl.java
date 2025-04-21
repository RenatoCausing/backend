package net.SPIS.backend.serviceImpl;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import net.SPIS.backend.DTO.StudentDTO;
import net.SPIS.backend.entities.Admin;
import net.SPIS.backend.entities.SP;
import net.SPIS.backend.entities.Student;
import net.SPIS.backend.entities.Tag;
import net.SPIS.backend.repositories.AdminRepository;
import net.SPIS.backend.repositories.SPRepository;
import net.SPIS.backend.repositories.StudentRepository;
import net.SPIS.backend.repositories.TagRepository;
import net.SPIS.backend.service.SPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

// Add a logger
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SPServiceImpl implements SPService {

    // Add a logger instance
    private static final Logger logger = LoggerFactory.getLogger(SPServiceImpl.class);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SPRepository spRepository;

    @Autowired
    private AdminRepository adminRepository;

    // REMOVE GroupsRepository
    // @Autowired
    // private GroupsRepository groupsRepository;

    @Autowired
    private TagRepository tagRepository;

    @Override
    public SPDTO getSP(Integer spId) {
        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));
        incrementViewCount(spId);

        return toDTO(sp);
    }

    @Override
    public List<SPDTO> getAllSP() {
        logger.info("Fetching all SPs");
        List<SP> sps = spRepository.findAll();
        logger.info("Found {} SPs", sps.size());
        return sps.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SPDTO> getSPFromAdviser(Integer adviserId) {
        logger.info("Fetching SPs for adviserId: {}", adviserId);
        List<SP> sps = spRepository.findByAdviserAdminId(adviserId);
        logger.info("Found {} SPs for adviserId: {}", sps.size(), adviserId);
        return sps.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SPDTO> getSPFromStudent(Integer studentId) {
        logger.info("Fetching SPs for studentId: {}", studentId);
        List<SP> sps = spRepository.findByStudentsStudentId(studentId);
        logger.info("Found {} SPs for studentId: {}", sps.size(), studentId);
        return sps.stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SPDTO> getSPFromFaculty(Integer facultyId) {
        logger.info("Fetching SPs for facultyId: {}", facultyId);
        List<SP> sps = spRepository.findByStudentsFacultyFacultyId(facultyId);
        logger.info("Found {} SPs for facultyId: {}", sps.size(), facultyId);
        return sps.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SPDTO createSP(SPDTO spDTO) {
        logger.info("Creating new SP");
        SP sp = new SP();
        sp.setTitle(spDTO.getTitle());
        sp.setYear(spDTO.getYear());
        sp.setSemester(spDTO.getSemester());
        sp.setAbstractText(spDTO.getAbstractText());
        sp.setUri(spDTO.getUri());
        sp.setDocumentPath(spDTO.getDocumentPath());
        sp.setDateIssued(spDTO.getDateIssued());
        sp.setViewCount(0);

        Admin uploadedBy = adminRepository.findById(spDTO.getUploadedById())
                .orElseThrow(() -> new RuntimeException("Uploader not found"));
        if (!"staff".equals(uploadedBy.getRole())) {
            throw new RuntimeException("Uploader must be a staff member");
        }
        sp.setUploadedBy(uploadedBy);

        Admin adviser = adminRepository.findById(spDTO.getAdviserId())
                .orElseThrow(() -> new RuntimeException("Adviser not found"));
        if (!"faculty".equals(adviser.getRole())) {
            throw new RuntimeException("Adviser must be a faculty member");
        }
        sp.setAdviser(adviser);

        // Set tags
        if (spDTO.getTagIds() != null && !spDTO.getTagIds().isEmpty()) {
            sp.setTags(spDTO.getTagIds().stream()
                    .map(id -> tagRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Tag not found: " + id)))
                    .collect(Collectors.toSet()));
            logger.debug("Tags set: {}", sp.getTags().size());
        } else {
            sp.setTags(new HashSet<>()); // Ensure tags is not null if no tags are provided
            logger.debug("No tags provided");
        }

        // Set students from studentIds in the DTO
        if (spDTO.getStudentIds() != null && !spDTO.getStudentIds().isEmpty()) {
            Set<Student> students = spDTO.getStudentIds().stream()
                    .map(id -> studentRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Student not found: " + id)))
                    .collect(Collectors.toSet());
            sp.setStudents(students);
            logger.debug("Students set: {}", sp.getStudents().size());
        } else {
            sp.setStudents(new HashSet<>()); // Ensure students is not null if no students are provided
            logger.debug("No students provided");
        }

        SP savedSP = spRepository.save(sp);
        logger.info("SP created with ID: {}", savedSP.getSpId());
        return toDTO(savedSP);
    }

    @Override
    public List<SPDTO> getSPsWithTags(List<Integer> tagIds) {
        logger.info("Fetching SPs with tagIds: {}", tagIds);
        if (tagIds == null || tagIds.isEmpty()) {
            logger.info("No tagIds provided, returning all SPs");
            return getAllSP();
        }
        List<SP> sps = spRepository.findByTagsTagIdIn(tagIds);
        logger.info("Found {} SPs with tags: {}", sps.size(), tagIds);
        return sps.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void incrementViewCount(Integer spId) {
        logger.debug("Incrementing view count for SP ID: {}", spId);
        spRepository.incrementViewCountById(spId);
    }

    @Override
    public List<SPDTO> getMostViewedSPs(Integer limit) {
        logger.info("Fetching top {} most viewed SPs", limit);
        PageRequest pageable = PageRequest.of(0, 5);
        List<SP> sps = spRepository.findTopSPs(pageable);
        logger.info("Found {} top SPs", sps.size());
        return sps.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ✅ UPDATED: toDTO method with logging
    private SPDTO toDTO(SP sp) {
        SPDTO dto = new SPDTO();
        dto.setSpId(sp.getSpId());
        dto.setTitle(sp.getTitle());
        dto.setYear(sp.getYear());
        dto.setSemester(sp.getSemester());
        dto.setAbstractText(sp.getAbstractText());
        dto.setUri(sp.getUri());
        dto.setDocumentPath(sp.getDocumentPath());
        dto.setDateIssued(sp.getDateIssued());
        dto.setViewCount(sp.getViewCount() != null ? sp.getViewCount() : 0);

        if (sp.getUploadedBy() != null) {
            dto.setUploadedById(sp.getUploadedBy().getAdminId());
        }

        // Extract student information from the Many-to-Many relationship
        List<Integer> studentIds = new ArrayList<>();
        List<String> authors = new ArrayList<>();
        logger.debug("Processing students for SP ID: {}", sp.getSpId());

        // Check if the students collection is loaded and not empty
        if (sp.getStudents() != null && !sp.getStudents().isEmpty()) {
            logger.debug("Students collection is not null and not empty. Size: {}", sp.getStudents().size());
            for (Student student : sp.getStudents()) {
                if (student != null) {
                    studentIds.add(student.getStudentId());

                    String lastName = student.getLastName() != null ? student.getLastName() : "";
                    String firstName = student.getFirstName() != null ? student.getFirstName() : "";
                    String authorName = lastName;
                    if (!firstName.isEmpty()) {
                        authorName += ", " + firstName;
                    }
                    authors.add(authorName);
                    logger.debug("Added student: {} ({}) to authors", student.getStudentId(), authorName);
                } else {
                    logger.warn("Found a null student in the collection for SP ID: {}", sp.getSpId());
                }
            }
        } else {
            logger.debug("Students collection is null or empty for SP ID: {}", sp.getSpId());
        }

        dto.setStudentIds(studentIds);
        dto.setAuthors(authors);
        logger.debug("Generated studentIds: {} and authors: {} for SP ID: {}", studentIds, authors, sp.getSpId());

        if (sp.getAdviser() != null) {
            dto.setAdviserId(sp.getAdviser().getAdminId());
        }

        Set<Integer> tagIds = new HashSet<>();
        if (sp.getTags() != null) {
            tagIds = sp.getTags().stream()
                    .filter(Objects::nonNull)
                    .map(Tag::getTagId)
                    .collect(Collectors.toSet());
        }
        dto.setTagIds(tagIds);

        return dto;
    }

    @Override
    public Integer getSPViewCount(Integer spId) {
        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));
        return sp.getViewCount();
    }

    @Override
    public List<AdviserDTO> getTopAdvisersByViews() {
        logger.info("Fetching top advisers by views");
        Pageable pageable = PageRequest.of(0, 5);
        List<Object[]> results = spRepository.findTopAdvisersByViews(pageable);

        return results.stream()
                .filter(result -> result[1] != null && (Long) result[1] > 0) // Remove 0-view advisers
                .map(result -> {
                    Admin adviser = (Admin) result[0];
                    AdviserDTO dto = new AdviserDTO();
                    dto.setAdminId(adviser.getAdminId());
                    dto.setFirstName(adviser.getFirstName());
                    dto.setLastName(adviser.getLastName());
                    dto.setMiddleName(adviser.getMiddleName());
                    // Assuming Admin has a Faculty relationship
                    // dto.setFacultyId(adviser.getFaculty().getFacultyId());
                    dto.setImagePath(adviser.getImagePath());
                    dto.setDescription(adviser.getDescription());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Keep StudentDTO conversion if needed elsewhere
    private StudentDTO toDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setStudentId(student.getStudentId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setMiddleName(student.getMiddleName());
        // Assuming Student has a Faculty relationship
        if (student.getFaculty() != null) {
            dto.setFacultyId(student.getFaculty().getFacultyId());
        }
        return dto;
    }

    @Override
    @Transactional // Keep Transactional for update operations
    public SPDTO updateSP(Integer spId, SPDTO spDTO) {
        logger.info("Updating SP with ID: {}", spId);
        logger.debug("Received DTO for update: {}", spDTO);

        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));

        if (spDTO.getTitle() != null) {
            sp.setTitle(spDTO.getTitle());
        }
        if (spDTO.getYear() != null) {
            sp.setYear(spDTO.getYear());
        }
        if (spDTO.getSemester() != null) {
            sp.setSemester(spDTO.getSemester());
        }
        if (spDTO.getAbstractText() != null) {
            sp.setAbstractText(spDTO.getAbstractText());
        }
        if (spDTO.getDocumentPath() != null) {
            sp.setDocumentPath(spDTO.getDocumentPath());
        }

        if (spDTO.getAdviserId() != null) {
            logger.debug("Updating adviser with ID: {}", spDTO.getAdviserId());
            Admin adviser = adminRepository.findById(spDTO.getAdviserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Adviser not found with ID: " + spDTO.getAdviserId()));
            sp.setAdviser(adviser);
        }

        // Update tags (existing logic)
        Set<Integer> tagIds = spDTO.getTagIds();
        if (tagIds != null) {
            logger.debug("Updating tags with IDs: {}", tagIds);
            Set<Tag> tags = new HashSet<>();
            for (Integer tagId : tagIds) {
                Tag tag = tagRepository.findById(tagId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Tag with ID " + tagId + " not found"));
                tags.add(tag);
            }
            sp.setTags(tags);
            logger.debug("Tags set on SP: {}", sp.getTags().size());
        } else {
            sp.setTags(new HashSet<>()); // Clear tags if none provided
            logger.debug("No tags provided in update, clearing existing tags");
        }

        // Update students using the Many-to-Many relationship
        List<Integer> studentIds = spDTO.getStudentIds();
        if (studentIds != null) {
            logger.debug("Updating student authors with IDs: {}", studentIds);
            Set<Student> students = new HashSet<>();
            for (Integer studentId : studentIds) {
                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Student with ID " + studentId + " not found"));
                students.add(student);
            }
            // JPA automatically manages the join table when you set the collection on the
            // owning side (SP)
            sp.setStudents(students);
            logger.debug("Students set on SP before saving: {}", sp.getStudents().size());

        } else {
            sp.setStudents(new HashSet<>()); // Clear students if none provided
            logger.debug("No student authors provided in update, clearing existing students");
        }

        SP savedSP = spRepository.save(sp); // Saving the owning side
        logger.info("SP updated successfully with ID: {}", savedSP.getSpId());
        // At this point, the Many-to-Many relationship should be updated in the
        // database.
        // Let's fetch it again or ensure it's eagerly loaded if needed for toDTO
        // OR rely on the @Transactional context to keep the students collection
        // attached and updated.

        // If lazy loading is an issue, you might need to initialize the collection
        // here,
        // but usually setting and saving the owning side is enough within a
        // transaction.
        // savedSP.getStudents().size(); // Example of initializing if needed

        SPDTO resultDTO = toDTO(savedSP);
        logger.debug("Returning DTO after update: {}", resultDTO);
        logger.debug("Returning DTO studentIds: {}", resultDTO.getStudentIds());
        logger.debug("Returning DTO authors: {}", resultDTO.getAuthors());

        return resultDTO;
    }
}