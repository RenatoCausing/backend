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
import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.PageImpl; // Import PageImpl
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable; // Import Pageable
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.YearMonth;
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

    // Define the date formatter for yyyy-MM format
    private static final DateTimeFormatter YEAR_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    @Override
    public SPDTO getSP(Integer spId) {
        SP sp = spRepository.findById(spId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SP not found"));
        incrementViewCount(spId);
        return toDTO(sp);
    }

    @Override
    public Page<SPDTO> getAllSP(Pageable pageable) {
        Page<SP> spPage = spRepository.findAll(pageable);
        return spPage.map(this::toDTO); // Use map to convert Page<SP> to Page<SPDTO>
    }

    @Override
    public Page<SPDTO> getSPFromAdviser(Integer adviserId, Pageable pageable) {
        Page<SP> spPage = spRepository.findByAdviserAdminId(adviserId, pageable);
        return spPage.map(this::toDTO);
    }

    @Override
    public Page<SPDTO> getSPFromStudent(Integer studentId, Pageable pageable) {
        Page<SP> spPage = spRepository.findByStudentsStudentId(studentId, pageable);
        return spPage.map(this::toDTO);
    }

    @Override
    public Page<SPDTO> getSPFromFaculty(Integer facultyId, Pageable pageable) {
        Page<SP> spPage = spRepository.findByAdviserFacultyId(facultyId, pageable);
        return spPage.map(this::toDTO);
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
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Uploader Admin not found with ID: " + spDTO.getUploadedById());
                });
        logger.debug("Found uploader: {}", uploadedBy.getAdminId());
        sp.setUploadedBy(uploadedBy);

        if (spDTO.getAdviserId() != null) {
            Admin adviser = adminRepository.findById(spDTO.getAdviserId())
                    .orElseThrow(() -> {
                        logger.error("Adviser Admin not found with ID: {}", spDTO.getAdviserId());
                        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Adviser Admin not found with ID: " + spDTO.getAdviserId());
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

        SP savedSP = spRepository.save(sp);
        logger.info("Successfully created SP with ID: {}", savedSP.getSpId());
        return toDTO(savedSP);
    }

    @Override
    public Page<SPDTO> getSPsWithTags(List<Integer> tagIds, Pageable pageable) {
        if (tagIds == null || tagIds.isEmpty()) {
            return getAllSP(pageable);
        }
        Page<SP> spPage = spRepository.findByTagsTagIdIn(tagIds, pageable);
        return spPage.map(this::toDTO);
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

    @Override
    public List<AdviserDTO> getTopAdvisersByViews() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Object[]> results = spRepository.findTopAdvisersByViews(pageable);
        return results.stream()
                .filter(result -> result[1] != null && (Long) result[1] > 0)
                .map(result -> {
                    Admin adviser = (Admin) result[0];
                    AdviserDTO dto = new AdviserDTO();
                    dto.setAdminId(adviser.getAdminId());
                    dto.setFirstName(adviser.getFirstName());
                    dto.setLastName(adviser.getLastName());
                    dto.setMiddleName(adviser.getMiddleName());
                    if (adviser.getFaculty() != null) {
                        dto.setFacultyId(adviser.getFaculty().getFacultyId());
                    } else {
                        dto.setFacultyId(null);
                    }
                    dto.setEmail(adviser.getEmail());
                    dto.setImagePath(adviser.getImagePath());
                    dto.setDescription(adviser.getDescription());
                    dto.setRole(adviser.getRole());
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Uploading Admin not found with ID: " + uploadedById));

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
         

                logger.w
                continue;
            }

            String tit

            String advise
            String dateIss
            String uri = n
            String abstractTex

            String tagsSt

          
        Admin adviser =

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
                            // Pass processedRows to findOrCreateAdviser
                            adviser = findOrCreateAdviser(adviserStr, processedRows);
                     

                errors.add("Row " + processedRows + ": Failed to process adviser '" + adviserStr + "'. Skipping row.");
                                logger.warn("Row {} skipped: Failed to process adviser '{}'.", processedRows, adviserStr);
                                continue;
                            }
                        } catch (IllegalArgumentException e) {
                 

              errors.add("Row " + processedRows + ": Invalid adviser format '" + adviserStr + "': " + e.getMessage() + ". Skipping row.");
                            logger.wan"Row {} skippd Invalid adviser format '{}'." rocessedRos ad

               

    logger.debug("o

    !authorsS          // processedRos s alread     students = fidrCreateStudensauthorsStr, errors, processedRows);if (students.isEmpty( && !authorsStr.        errors.add("Row " + processedRows + ": No valid students could be processed       

            }
                        } catch (IllegalArgumentException e) {
                            errors.add("Row " + processedRows + ": Invalid author format '" + authorsStr + "': " + e.getMessage() + ". Skipping row.");
                            logger.warn("Row {} skipped: Invalid author format '{}'.", processedRows, authorsStr, e);
                            continue;
                 

          } catch (RuntimeException e) {
                            errors.ad(Row " + procesdRows + ": Error processing auhrs '" + auhrsStr+"

            logger.debug("Row {}: Authors column is empty, set

    if (!tagsStr.ism

     
            t

                logger.ero("Row {} skipe: Error processing tags '{}., procesdRows 

                 logger.debug("Row {}: T

         if (!dateIssuedStr.ism
            // Parse t
            YearMonth yearMonth = YearMonth.parse(dateIssuedStr, YEAR_MONTH_FOR

          
            // Allow dateIssued to be null if the column 

            logr.deb    }

              c

        if (!yearStr.ism

          
            // Allow year to be null if the column 

          logg    }

            logger.wan"Row {         continue;    }

            f(semester.isEmpty()

             semester =n

       } else if (!semester.equalsIgno
           e

        }

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
                    e

            continue;
                } catch (Exception e) {
                    errors.add("Row " + processedRows + ": Unexpected error processing row - " + e.getMessage());
                    logger.error("Unexpected error processing row {}: {}", processedRows, Arrays.toString(line), e);
         

             } 
    (CsvValidationException e) {
    rs.add("CSV Validation Error at 

    l 

        logger.error("Error reading CSV file", e);
            throw e; // Re-throw IOException
        } catch (Exception e) {
            errors.add("An unexpected error occurred during the upload process: " + e.getMessage());
            logger.error("Unexpected error during upload", e);
     

    }

        logger.info("SP upload finished. Processed: {}, Succeeded: {}, Failed: {}", processedRows, successCount, errors.size());

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("errorCount", errors.size());
        result.put("errors", errors);
        result.put("processedRows", processedRows);
        return result;
    }



        if (adviserStr == null || adviserStr.trim().isEmpty()) {
            logger.debug("Row {}: Adviser name string is empty or null, returning null.", rowNum);
            return null;
        }

        String[] names = adviserStr.trim().split(",", 2);
        if (names.length != 2) {
            logger.warn("Row {}: Invalid adviser format: '{}'. Expected 'LastName, FirstName'. Cannot process.", rowNum, adviserStr);
            throw new IllegalArgumentException("Invalid adviser format: Expected 'LastName, FirstName'");
        }
                    

        String lastName = names[0].trim();
        String firstName = names[1].trim();

        if (lastName.isEmpty() || firstName.isEmpty()) {
             logger.warn("Row {}: Empty first or last name after parsing adviser: '{}'. Cannot process.", rowNum, adviserStr);
             throw new IllegalArgumentException("Invalid
            
                    
            


        Optional<Admin> foundAdviser = potentialAdvisers.stream()
                                                .filter(admin -> "faculty".equalsIgnoreCase(admin.getRole()))
                                                .findFirst();
                
                

            return foundAdviser.get();
        } else {
                    
            logger.info("Row {}: Faculty adviser not found matching name: {} {}. Creating new Admin entity.", rowNum, firstName, lastName);
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
                logger.info("Row {}: Created new faculty adviser with ID: {}", rowNum, savedAdviser.getAdminId());
                return savedAdviser;
            } catch (Exception e) {
                logger.error("Row {}: Failed to create new adviser '{} {}'", rowNum, firstName, lastName, e);
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
            if (authorPair.isEmpty()) continue;

            String[] names = authorPa
                r.split(",", 2);
            if (names.length != 2) {
                errors.add("Row " + rowNum + ": Invalid author format '" + authorPair + "'. Expected 'LastName, FirstName'. Skipping this author.");
                logger.warn("Row {}: Invalid author format '{}'.", rowNum, authorPair);
                continue;
                        
            }

            String lastName = names[0].trim();
            String firstName = names[1].trim();

             if (lastName.isEmpty() || firstNam

               logger.warn("Row {}: Invalid author format '{}' resulted in empty name part.", rowNum, authorPair);
                continue;
                        
            }



            if (existingStudent.isPresent()) {
                    
                students.add(existingStudent.get());
                logger.debug("Row {}: Found existing student: {} {} (ID: {})", rowNum, firstName, lastName, existingStudent.get().getStudentId());
            } else {
                logger.info("Row {}: Student not found matching name: {} {}. Creating new Student entity.",
                        rowNum, firstName, lastName);
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
            if (tagName.isEmpty()) continue;

            String normalizedTagNa
                e = tagName.toLowerCase();

            Optional<Tag> existingTag = tagRepository.findByTagNameIgnoreCase(normalizedTagName);

            if (existingTag.isPresent()) {
                tags.add(existingTag.get());
                 logger.debug("Row {}: Found existing tag: {} (ID: {})", rowNum, existingTag.get().getTagName(), existingTag.get().getTagId());
            } else {
                ogger.info("Row {}: Tag not found matching name: '{}'. Creating new Tag entity.", rowNum, tagNa
                        e);
                Tag newTag = new Tag();
                newTag.setTagName(tagName);

                // Add logging before saving
                logger.debug("Row {}: Attempting to save new Tag with name '{}'. Current ID: {}", rowNum, newTag.getTagName(), newTag.getTagId());

                // Removed the try-catch block here to allow exceptions to propagate
                        
                Tag savedTag = tagRepository.save(newTag);

                // Add logging after saving
                logger.debug("Row {}: Successfully saved new Tag. Name: '{}', Assigned ID: {}", rowNum, savedTag.getTagName(), savedTag.getTagId());

                tags.add(savedTag);
                        
                logger.info("Row {}: Created new tag with ID: {}", rowNum, savedTag.getTagId());
            }
        }
        return tags;
    }

    @Override
    public Page<SPDTO> filterSPs(List<Integer> adviserIds, List<Integer> tagIds, Integer facultyId, String searchTerm, Pageable pageable) {
        // Handle empty lists for adviserIds and tagIds by converting them to null
        // so the JPQL query's IS NULL checks work correctly.
            
        List<Integer> finalAdviserIds = (adviserIds != null && adviserIds.isEmpty()) ? null : adviserIds;
        List<Integer> finalTagIds = (tagIds != null && tagIds.isEmpty()) ? null : tagIds;

        Page<SP> spPage = spRepository.filterSPs(finalAdviserIds, finalTagIds, facultyId, searchTerm, pageable);
        return spPage.map(this::toDTO);
    }
}
