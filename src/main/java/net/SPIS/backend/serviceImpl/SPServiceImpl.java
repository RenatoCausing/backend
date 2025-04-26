package net.SPIS.backend.serviceImpl;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import net.SPIS.backend.DTO.*;
import net.SPIS.backend.entities.*;
import net.SPIS.backend.repositories.*;
import net.SPIS.backend.service.SPService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.YearMonth; // Import YearMonth
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SPServiceImpl implements SPService {
    private static final Logger logger = LoggerFactory.getLogger(SPServiceImpl.class);
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SPRepository spRepository;
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private FacultyRepository facultyRepository;

    // Define the date formatter for-MM format
    private static final DateTimeFormatter YEAR_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    @Override
    public SPDTO getSP(Integer spId) {
        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));
        return toDTO(sp);
    }

    @Override
    public List<SPDTO> getAllSP() {
        return spRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SPDTO> getSPFromAdviser(Integer adviserId) {
        return spRepository.findByAdviserAdminId(adviserId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SPDTO> getSPFromStudent(Integer studentId) {
        return spRepository.findByStudentsStudentId(studentId).stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SPDTO> getSPFromFaculty(Integer facultyId) {
        // This method still filters by adviser's faculty, might need review if direct
        // SP faculty is preferred here too
        return spRepository.findByAdviserFacultyId(facultyId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SPDTO createSP(SPDTO spDTO) {
        logger.info("Attempting to create SP with DTO: {}", spDTO);
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
                .orElseThrow(() -> {
                    logger.error("Uploader Admin not found with ID: {}", spDTO.getUploadedById());
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Uploader Admin not found with ID: " + spDTO.getUploadedById());
                });
        logger.debug("Found uploader: {}", uploadedBy.getAdminId());
        sp.setUploadedBy(uploadedBy);

        if (spDTO.getAdviserId() != null) {
            Admin adviser = adminRepository.findById(spDTO.getAdviserId())
                    .orElseThrow(() -> {
                        logger.error("Adviser Admin not found with ID: {}", spDTO.getAdviserId());

                        return new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Adviser Admin not found with ID: " + spDTO.getAdviserId());
                    });
            logger.debug("Found adviser: {}", adviser.getAdminId());
            sp.setAdviser(adviser);
        } else {
            sp.setAdviser(null);
            logger.debug("Adviser ID is null, setting adviser to null.");
        }

        if (spDTO.getTagIds() != null && !spDTO.getTagIds().isEmpty()) {
            logger.debug("Processing tag IDs: {}", spDTO.getTagIds());
            sp.setTags(spDTO.getTagIds().stream()
                    .map(id -> tagRepository.findById(id)
                            .orElseThrow(() -> {
                                logger.error("Tag not found with ID: {}", id);

                                return new ResponseStatusException(HttpStatus.NOT_FOUND, "Tag not found: " + id);
                            }))
                    .collect(Collectors.toSet()));
        } else {
            logger.debug("No tag IDs provided, setting empty set.");
            sp.setTags(new HashSet<>());
        }

        if (spDTO.getStudentIds() != null && !spDTO.getStudentIds().isEmpty()) {
            logger.debug("Processing student IDs: {}", spDTO.getStudentIds());
            Set<Student> students = spDTO.getStudentIds().stream()
                    .map(id -> studentRepository.findById(id)
                            .orElseThrow(() -> {
                                logger.error("Student not found with ID: {}", id);

                                return new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found: " + id);
                            }))
                    .collect(Collectors.toSet());
            sp.setStudents(students);
        } else {
            logger.debug("No student IDs provided, setting empty set.");
            sp.setStudents(new HashSet<>());
        }

        if (spDTO.getFacultyId() != null) {
            Faculty faculty = facultyRepository.findById(spDTO.getFacultyId()) // Assuming you have facultyRepository
                                                                               // Autowired [cite: 98]
                    .orElseThrow(() -> {
                        logger.error("Faculty not found with ID: {}", spDTO.getFacultyId());
                        return new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Faculty not found with ID: " + spDTO.getFacultyId());
                    });
            sp.setFaculty(faculty);
            logger.debug("Set faculty to ID: {}", faculty.getFacultyId());
        } else {
            sp.setFaculty(null);
            // Handle case where facultyId is not provided
            logger.debug("Faculty ID is null in DTO, setting faculty to null.");
        }

        SP savedSP = spRepository.save(sp);
        logger.info("Successfully created SP with ID: {}", savedSP.getSpId());
        return toDTO(savedSP);
    }

    // Modified to use the new combined filter method
    @Override
    public List<SPDTO> getSPsWithTags(List<Integer> tagIds) {
        // Call the new combined filter method, only providing tagIds
        return filterSPs(null, tagIds, null, null);
    }

    @Override
    @Transactional
    public void incrementViewCount(Integer spId) {
        if (!spRepository.existsById(spId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found with ID: " + spId);
        }
        spRepository.incrementViewCountById(spId);
    }

    @Override
    public List<SPDTO> getMostViewedSPs(Integer limit) {
        PageRequest pageable = PageRequest.of(0, limit);
        return spRepository.findTopSPs(pageable).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Integer getSPViewCount(Integer spId) {
        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));
        return sp.getViewCount();
    }

    public List<AdviserDTO> getTopAdvisersByViews() {
        Pageable pageable = PageRequest.of(0, 8);
        // Get top 5
        List<Object[]> results = spRepository.findTopAdvisersByViews(pageable);
        return results.stream()
                // No need to filter out null adviser or 0 views based on previous logic,
                // as the native query and COALESCE handle 0 views.
                // If you still want to filter > 0 views, add it here based on result[9]
                // .filter(result -> result[9] != null && (Long) result[9] > 0)
                .map(result -> {
                    AdviserDTO dto = new AdviserDTO();
                    // Manually map columns from Object[] to AdviserDTO properties
                    // Ensure indices match the SELECT order in the native query
                    dto.setAdminId((Integer) result[0]); // admin_id
                    dto.setFirstName((String) result[1]); // first_name
                    dto.setLastName((String) result[2]); // last_name
                    dto.setMiddleName((String) result[3]); // middle_name
                    dto.setRole((String) result[4]); // role
                    dto.setFacultyId((Integer) result[5]); // faculty_id
                    dto.setImagePath((String) result[6]); // image_path
                    dto.setDescription((String) result[7]); // description
                    dto.setEmail((String) result[8]); // email
                    // result[9] is the total_views aggregate, not directly part of AdviserDTO
                    // typically,
                    // but you can use it for filtering if needed.
                    // Note: The toDTO(Admin admin) helper method is no longer directly used here
                    // because we are getting column values, not an Admin entity.
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SPDTO updateSP(Integer spId, SPDTO spDTO) {
        logger.info("Updating SP with ID: {}", spId);
        logger.debug("Received DTO for update: {}", spDTO);
        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found with ID: " + spId));
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
        if (spDTO.getUri() != null) {
            sp.setUri(spDTO.getUri());
        }
        if (spDTO.getDocumentPath() != null) {
            sp.setDocumentPath(spDTO.getDocumentPath());
        }
        if (spDTO.getDateIssued() != null) {
            sp.setDateIssued(spDTO.getDateIssued());
        }
        if (spDTO.getAdviserId() != null) {
            logger.debug("Updating adviser to ID: {}", spDTO.getAdviserId());
            Admin adviser = adminRepository.findById(spDTO.getAdviserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Adviser not found with ID: " + spDTO.getAdviserId()));
            sp.setAdviser(adviser);
        } else {
            logger.debug("Adviser ID field is null in update DTO, setting adviser to null.");
            sp.setAdviser(null);
        }
        if (spDTO.getFacultyId() != null) {
            // Check if the faculty ID in the DTO is different from the current one,
            // or if the current one is null to avoid unnecessary lookups/updates.
            if (sp.getFaculty() == null || !sp.getFaculty().getFacultyId().equals(spDTO.getFacultyId())) {
                Faculty faculty = facultyRepository.findById(spDTO.getFacultyId()) // Assuming facultyRepository
                                                                                   // Autowired [cite: 98]
                        .orElseThrow(() -> {
                            logger.error("Faculty not found with ID: {}", spDTO.getFacultyId());
                            return new ResponseStatusException(HttpStatus.NOT_FOUND,
                                    "Faculty not found with ID: " + spDTO.getFacultyId());
                        });
                sp.setFaculty(faculty);
                logger.debug("Updated faculty to ID: {}", faculty.getFacultyId());
            }
        } else {
            // If facultyId is explicitly null in the DTO, remove the association
            if (sp.getFaculty() != null) {
                logger.debug("Faculty ID is null in update DTO, setting faculty to null.");
                sp.setFaculty(null);
            }
        }

        Set<Integer> tagIds = spDTO.getTagIds();
        if (tagIds != null) {
            logger.debug("Updating tags with IDs: {}", tagIds);
            Set<Tag> tags = new HashSet<>();
            if (!tagIds.isEmpty()) {
                tags = tagIds.stream()
                        .map(tagId -> tagRepository.findById(tagId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,

                                        "Tag with ID " + tagId + " not found")))
                        .collect(Collectors.toSet());
            }
            sp.setTags(tags);
        } else {
            logger.debug("No tag IDs provided, setting empty set.");
            sp.setTags(new HashSet<>());
        }

        List<Integer> studentIds = spDTO.getStudentIds();
        if (studentIds != null) {
            logger.debug("Updating students with IDs: {}", studentIds);
            Set<Student> students = new HashSet<>();
            if (!studentIds.isEmpty()) {
                students = studentIds.stream()
                        .map(studentId -> studentRepository.findById(studentId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,

                                        "Student with ID " + studentId + " not found")))
                        .collect(Collectors.toSet());
            }
            sp.setStudents(students);
        } else {
            logger.debug("No student IDs provided, setting empty set.");
            sp.setStudents(new HashSet<>());
        }

        SP savedSP = spRepository.save(sp);
        logger.info("SP updated successfully, ID: {}", savedSP.getSpId());
        SPDTO resultDTO = toDTO(savedSP);
        logger.debug("Returning updated DTO: {}", resultDTO);
        return resultDTO;
    }

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
        } else {
            dto.setUploadedById(null);
        }
        if (sp.getFaculty() != null) {
            dto.setFacultyId(sp.getFaculty().getFacultyId()); // Assuming Faculty entity has getFacultyId()
        } else {
            dto.setFacultyId(null);
        }

        List<Integer> studentIds = new ArrayList<>();
        List<String> authors = new ArrayList<>();
        if (sp.getStudents() != null && !sp.getStudents().isEmpty()) {
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
                }
            }
        }
        dto.setStudentIds(studentIds);
        dto.setAuthors(authors);

        if (sp.getAdviser() != null) {
            dto.setAdviserId(sp.getAdviser().getAdminId());
        } else {
            dto.setAdviserId(null);
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
    @Transactional
    public Map<String, Object> processSPUpload(MultipartFile file, Integer uploadedById) throws IOException {
        logger.info("Starting SP upload process by Admin ID: {}", uploadedById);
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int processedRows = 0;
        Admin uploader = adminRepository.findById(uploadedById)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Uploading Admin not found with ID: " + uploadedById));
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] headers = reader.readNext(); // Read header row
            if (headers == null) {
                throw new IOException("CSV file is empty or header row is missing.");
            }
            logger.debug("CSV Headers: {}", Arrays.toString(headers));

            String[] line;
            while ((line = reader.readNext()) != null) {
                processedRows++;
                logger.debug("Processing row {}: {}", processedRows, Arrays.toString(line));

                final int EXPECTED_COLUMNS = 10; // Based on your previous CSV structure
                if (line.length < EXPECTED_COLUMNS) {
                    errors.add("Row " + processedRows + ": Incorrect number of columns. Expected " + EXPECTED_COLUMNS
                            + ", found " + line.length + ". Skipping row.");
                    logger.warn("Row {} skipped due to incorrect column count.", processedRows);
                    continue;
                }

                String title = null;
                String authorsStr = null;
                String adviserStr = null;
                String dateIssuedStr = null;
                String uri = null;
                String abstractText = null;
                String documentPath = null;
                String tagsStr = null;
                String yearStr = null;
                String semesterStr = null;

                Admin adviser = null;
                Set<Student> students = new HashSet<>();
                Set<Tag> tags = new HashSet<>();
                LocalDate dateIssued = null;
                Integer year = null;
                String semester = null;

                try {
                    title = line[0].trim();
                    authorsStr = line[1].trim();
                    adviserStr = line[2].trim();
                    dateIssuedStr = line[3].trim();
                    uri = line[4].trim();
                    abstractText = line[5].trim();
                    documentPath = line[6].trim();
                    tagsStr = line[7].trim();
                    yearStr = line[8].trim();
                    semesterStr = line[9].trim();

                    if (title.isEmpty()) {
                        errors.add("Row " + processedRows + ": Title is missing. Skipping row.");
                        logger.warn("Row {} skipped: Title is missing.", processedRows);
                        continue;
                    }

                    if (!adviserStr.isEmpty()) {
                        try {
                            // *** CORRECTED: Pass processedRows to findOrCreateAdviser ***

                            adviser = findOrCreateAdviser(adviserStr, processedRows);
                            if (adviser == null) {
                                errors.add("Row " + processedRows + ": Failed to process adviser '" + adviserStr
                                        + "'. Skipping row.");
                                logger.warn("Row {} skipped: Failed to process adviser '{}'.", processedRows,
                                        adviserStr);
                                continue;
                            }
                        } catch (IllegalArgumentException e) {
                            errors.add("Row " + processedRows + ": Invalid adviser format '" + adviserStr + "': "

                                    + e.getMessage() + ". Skipping row.");
                            logger.warn("Row {} skipped: Invalid adviser format '{}'.", processedRows, adviserStr, e);
                            continue;
                        } catch (RuntimeException e) {
                            errors.add("Row " + processedRows + ": Error processing adviser '" + adviserStr + "': "
                                    + e.getMessage() + ". Skipping row.");
                            logger.error("Row {} skipped: Error processing adviser '{}'.", processedRows, adviserStr,
                                    e);
                            continue;
                        }
                    } else {
                        logger.debug("Row {}: Adviser column is empty, setting adviser to null.", processedRows);
                    }

                    if (!authorsStr.isEmpty()) {
                        try {
                            // processedRows is already passed to findOrCreateStudents

                            students = findOrCreateStudents(authorsStr, errors, processedRows);
                            if (students.isEmpty() && !authorsStr.isEmpty()) {
                                errors.add("Row " + processedRows + ": No valid students could be processed from '"
                                        + authorsStr + "'. Skipping row.");
                                logger.warn("Row {}: No valid students could be processed from '{}'. Skipping row.",
                                        processedRows, authorsStr);
                                continue;
                            }
                        } catch (IllegalArgumentException e) {
                            errors.add("Row " + processedRows + ": Invalid author format '" + authorsStr + "': "

                                    + e.getMessage() + ". Skipping row.");
                            logger.warn("Row {} skipped: Invalid author format '{}'.", processedRows, authorsStr, e);
                            continue;
                        } catch (RuntimeException e) {
                            errors.add("Row " + processedRows + ": Error processing authors '" + authorsStr + "': "
                                    + e.getMessage() + ". Skipping row.");
                            logger.error("Row {} skipped: Error processing authors '{}'.", processedRows, authorsStr,
                                    e);
                            continue;
                        }
                    } else {
                        logger.debug("Row {}: Authors column is empty, setting students to empty set.", processedRows);
                    }

                    if (!tagsStr.isEmpty()) {
                        try {
                            // processedRows is already passed to findOrCreateTags

                            tags = findOrCreateTags(tagsStr, errors, processedRows);
                        } catch (RuntimeException e) {
                            errors.add("Row " + processedRows + ": Error processing tags '" + tagsStr + "': "
                                    + e.getMessage() + ". Skipping row.");
                            logger.error("Row {} skipped: Error processing tags '{}'.", processedRows, tagsStr, e);
                            continue;
                        }
                    } else {
                        logger.debug("Row {}: Tags column is empty, setting tags to empty set.", processedRows);
                    }

                    try {
                        if (!dateIssuedStr.isEmpty()) {
                            // *** MODIFIED: Parse to YearMonth and then to LocalDate ***

                            YearMonth yearMonth = YearMonth.parse(dateIssuedStr, YEAR_MONTH_FORMATTER);
                            dateIssued = yearMonth.atDay(1); // Assume the 1st day of the month
                        } else {
                            // Allow dateIssued to be null if the column is empty

                            dateIssued = null;
                            logger.debug("Row {}: Date Issued column is empty, setting dateIssued to null.",
                                    processedRows);
                        }
                    } catch (DateTimeParseException e) {
                        errors.add("Row " + processedRows + ": Invalid date format for '" + dateIssuedStr
                                + "'. Use-MM. Skipping row.");
                        logger.warn("Row {} skipped: Invalid date format '{}'.", processedRows, dateIssuedStr);
                        continue;
                    }

                    try {
                        if (!yearStr.isEmpty()) {
                            year = Integer.parseInt(yearStr);
                        } else {
                            // Allow year to be null if the column is empty
                            year = null;
                            logger.debug("Row {}: Year column is empty, setting year to null.", processedRows);
                        }
                    } catch (NumberFormatException e) {
                        errors.add("Row " + processedRows + ": Invalid year format for '" + yearStr
                                + "'. Must be an integer. Skipping row.");
                        logger.warn("Row {} skipped: Invalid year format '{}'.", processedRows, yearStr);
                        continue;
                    }

                    semester = semesterStr.trim();
                    if (semester.isEmpty()) {
                        // Allow semester to be empty/null
                        semester = null;
                        logger.debug("Row {}: Semester column is empty, setting semester to null.", processedRows);
                    } else if (!semester.equalsIgnoreCase("1st") && !semester.equalsIgnoreCase("2nd")
                            && !semester.equalsIgnoreCase("midyear")) {
                        errors.add("Row " + processedRows + ": Invalid semester '" + semesterStr

                                + "'. Use '1st', '2nd', 'Midyear', or leave empty. Skipping row.");
                        logger.warn("Row {} skipped: Invalid semester '{}'.", processedRows, semesterStr);
                        continue;
                    }

                    SP sp = new SP();
                    sp.setTitle(title);
                    sp.setYear(year);
                    sp.setSemester(semester);
                    sp.setAbstractText(abstractText);
                    sp.setUri(uri);
                    sp.setDocumentPath(documentPath);
                    sp.setDateIssued(dateIssued);
                    sp.setUploadedBy(uploader);
                    sp.setAdviser(adviser);
                    sp.setTags(tags);
                    sp.setStudents(students);
                    sp.setViewCount(0);

                    spRepository.save(sp);
                    successCount++;
                    logger.debug("Successfully saved SP from row {}", processedRows);

                } catch (ArrayIndexOutOfBoundsException e) {
                    errors.add("Row " + processedRows
                            + ": Error accessing column data (likely due to insufficient columns). Skipping row.");
                    logger.warn("Row {} skipped due to column access error.", processedRows, e);
                    continue;
                } catch (Exception e) {
                    errors.add("Row " + processedRows + ": Unexpected error processing row - " + e.getMessage());
                    logger.error("Unexpected error processing row {}: {}", processedRows, Arrays.toString(line), e);
                    // Re-throw as RuntimeException to trigger transaction rollback if needed
                    throw new RuntimeException("Critical error processing row " + processedRows, e);
                }
            }
        } catch (CsvValidationException e) {
            errors.add("CSV Validation Error at line " + e.getLineNumber() + ": " + e.getMessage());
            logger.error("CSV Validation Error", e);
            throw new RuntimeException("CSV Validation Error: " + e.getMessage(), e);
        } catch (IOException e) {
            errors.add("Error reading CSV file: " + e.getMessage());
            logger.error("Error reading CSV file", e);
            throw e; // Re-throw IOException
        } catch (Exception e) {
            errors.add("An unexpected error occurred during the upload process: " + e.getMessage());
            logger.error("Unexpected error during upload", e);
            throw new RuntimeException("An unexpected error occurred during the upload process: " + e.getMessage(), e);
        }

        logger.info("SP upload finished. Processed: {}, Succeeded: {}, Failed: {}", processedRows, successCount,
                errors.size());
        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("errorCount", errors.size());
        result.put("errors", errors);
        result.put("processedRows", processedRows);
        return result;
    }

    @Transactional
    private Admin findOrCreateAdviser(String adviserStr, int rowNum) { // *** CORRECTED: Added rowNum parameter ***
        if (adviserStr == null || adviserStr.trim().isEmpty()) {
            logger.debug("Row {}: Adviser name string is empty or null, returning null.", rowNum); // Added rowNum log
            return null;
        }

        String[] names = adviserStr.trim().split(",", 2);
        if (names.length != 2) {
            logger.warn("Row {}: Invalid adviser format: '{}'. Expected 'LastName, FirstName'. Cannot process.", rowNum,
                    adviserStr); // Added rowNum log
            throw new IllegalArgumentException("Invalid adviser format: Expected 'LastName, FirstName'");
        }

        String lastName = names[0].trim();
        String firstName = names[1].trim();
        if (lastName.isEmpty() || firstName.isEmpty()) {
            logger.warn("Row {}: Empty first or last name after parsing adviser: '{}'. Cannot process.", rowNum,
                    adviserStr); // Added rowNum log
            throw new IllegalArgumentException("Invalid adviser name: Empty first or last name.");
        }

        List<Admin> potentialAdvisers = adminRepository.findByFirstNameAndLastName(firstName, lastName);
        Optional<Admin> foundAdviser = potentialAdvisers.stream()
                .filter(admin -> "faculty".equalsIgnoreCase(admin.getRole()))
                .findFirst();
        if (foundAdviser.isPresent()) {
            logger.debug("Row {}: Found existing faculty adviser: {} {} (ID: {})", rowNum, firstName, lastName,
                    foundAdviser.get().getAdminId()); // Added rowNum log
            return foundAdviser.get();
        } else {
            logger.info("Row {}: Faculty adviser not found matching name: {} {}. Creating new Admin entity.", rowNum,
                    firstName, lastName); // Added rowNum log
            Admin newAdviser = new Admin();
            newAdviser.setFirstName(firstName);
            newAdviser.setLastName(lastName);
            newAdviser.setMiddleName(null); // Assuming middle name is not in this format
            newAdviser.setEmail(null); // Assuming email is not in this format
            newAdviser.setRole("faculty"); // Default role for newly created adviser
            newAdviser.setFaculty(null); // Assuming faculty is not in this format
            newAdviser.setImagePath(null);
            newAdviser.setDescription(null);

            try {
                Admin savedAdviser = adminRepository.save(newAdviser);
                logger.info("Row {}: Created new faculty adviser with ID: {}", rowNum, savedAdviser.getAdminId()); // Added

                // rowNum

                // log
                return savedAdviser;
            } catch (Exception e) {
                logger.error("Row {}: Failed to create new adviser '{} {}'", rowNum, firstName, lastName, e); // Added

                // rowNum

                // log
                throw new RuntimeException("Failed to create new adviser: " + e.getMessage(), e);
            }
        }
    }

    @Transactional
    private Set<Student> findOrCreateStudents(String authorsStr, List<String> errors, int rowNum) {
        Set<Student> students = new HashSet<>();
        if (authorsStr == null || authorsStr.trim().isEmpty()) {
            logger.debug("Row {}: Authors string is empty or null, returning empty set.", rowNum);
            return students;
        }

        String[] authorPairs = authorsStr.trim().split(";");
        for (String authorPair : authorPairs) {
            authorPair = authorPair.trim();
            if (authorPair.isEmpty())
                continue;
            String[] names = authorPair.split(",", 2);
            if (names.length != 2) {
                errors.add("Row " + rowNum + ": Invalid author format '" + authorPair
                        + "'. Expected 'LastName, FirstName'. Skipping this author.");
                logger.warn("Row {}: Invalid author format '{}'.", rowNum, authorPair);
                continue;
            }

            String lastName = names[0].trim();
            String firstName = names[1].trim();

            if (lastName.isEmpty() || firstName.isEmpty()) {
                errors.add("Row " + rowNum + ": Invalid author format '" + authorPair
                        + "' resulted in empty name part. Skipping this author.");
                logger.warn("Row {}: Invalid author format '{}' resulted in empty name part.", rowNum, authorPair);
                continue;
            }

            Optional<Student> existingStudent = studentRepository
                    .findByLastNameIgnoreCaseAndFirstNameIgnoreCase(lastName, firstName);
            if (existingStudent.isPresent()) {
                students.add(existingStudent.get());
                logger.debug("Row {}: Found existing student: {} {} (ID: {})", rowNum, firstName, lastName,
                        existingStudent.get().getStudentId());
            } else {
                logger.info("Row {}: Student not found matching name: {} {}. Creating new Student entity.", rowNum,
                        firstName, lastName);
                Student newStudent = new Student();
                newStudent.setFirstName(firstName);
                newStudent.setLastName(lastName);
                newStudent.setMiddleName(null); // Assuming middle name is not in this format
                newStudent.setFaculty(null); // Assuming faculty is not in this format
                newStudent.setGroup(null); // Assuming group is not in this format

                // Removed the try-catch block here to allow exceptions to propagate
                Student savedStudent = studentRepository.save(newStudent);
                students.add(savedStudent);
                logger.info("Row {}: Created new student with ID: {}", rowNum, savedStudent.getStudentId());
            }
        }
        return students;
    }

    @Transactional
    private Set<Tag> findOrCreateTags(String tagsStr, List<String> errors, int rowNum) {
        Set<Tag> tags = new HashSet<>();
        if (tagsStr == null || tagsStr.trim().isEmpty()) {
            logger.debug("Row {}: Tags string is empty or null, returning empty set.", rowNum);
            return tags;
        }

        String[] tagNames = tagsStr.trim().split(";");
        for (String tagName : tagNames) {
            tagName = tagName.trim();
            if (tagName.isEmpty())
                continue;
            String normalizedTagName = tagName.toLowerCase();

            Optional<Tag> existingTag = tagRepository.findByTagNameIgnoreCase(normalizedTagName);

            if (existingTag.isPresent()) {
                tags.add(existingTag.get());
                logger.debug("Row {}: Found existing tag: {} (ID: {})", rowNum, existingTag.get().getTagName(),
                        existingTag.get().getTagId());
            } else {
                logger.info("Row {}: Tag not found matching name: '{}'. Creating new Tag entity.", rowNum, tagName);
                Tag newTag = new Tag();
                newTag.setTagName(tagName);

                // Add logging before saving
                logger.debug("Row {}: Attempting to save new Tag with name '{}'. Current ID: {}", rowNum,
                        newTag.getTagName(), newTag.getTagId());
                // Removed the try-catch block here to allow exceptions to propagate
                Tag savedTag = tagRepository.save(newTag);
                // Add logging after saving
                logger.debug("Row {}: Successfully saved new Tag. Name: '{}', Assigned ID: {}", rowNum,
                        savedTag.getTagName(), savedTag.getTagId());
                tags.add(savedTag);
                logger.info("Row {}: Created new tag with ID: {}", rowNum, savedTag.getTagId());
            }
        }
        return tags;
    }

    // New method for combined filtering
    @Override
    public List<SPDTO> filterSPs(List<Integer> adviserIds, List<Integer> tagIds, Integer facultyId, String searchTerm) {
        // If searchTerm is not null and not empty, pass it to the repository method
        String finalSearchTerm = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim().toLowerCase()
                : null;
        List<SP> filteredSPs = spRepository.findSPsByFilters(adviserIds, tagIds, facultyId, finalSearchTerm);
        return filteredSPs.stream().map(this::toDTO).collect(Collectors.toList());
    }
}