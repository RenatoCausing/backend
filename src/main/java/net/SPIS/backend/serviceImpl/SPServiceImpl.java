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
    
        @Tansactionalpublic vo

        t}
    s

    @Override
    public List<SPDTO> getMostViewedSPs(Integer limit) {
        PageRequest pageable = PageRequest.of(0, limit);
        return sp

                .collect(Collecto
                }
    

    SP sp = s
    .orElseThrow(() -> new ResponseStatusExceptio
        return sp.getViewCount();
                }
        
    @

    Pageable 
    List<Object[]> results = spRepository.findTopAdvi
        return results.stem().filter(result-> resut1] != null && (Long) result[1] > 0).map(result -> {Admin adviser  (dmin) reslt0];AdviserDTO to=dto.setAdminI(dviser.etAdminId(dto.setFirstNaeadviser.getFirstNdto.setLastName(adviser.getLastName()dto.setMiddleName(adviser.getMiddleName()if (adviser.getFaculty() != null) {dto.setFacultyId(adviser.getFaculty().getFa} lse {dto.setFacultyId(null);}dto.setEm

        ddto.setRole(adviser.getRole());return dto;}).collect(Collectors.toList());}@Override
    @

    logger.in
    logger.debug("
    SP sp = spRepository.findById(spId)
        .orElseThrow(() -> new ResponseStatusEceptioif (sDO.getTitle() != null) {sp.setTitle(spDO.etTitle());

        if(spDTO.getYear() = ull) sp.setYear(spDTO.getYear());}if(spDTO.getSemestr( != nlsp.setSemester(spDTO.getSeme}if(spDTO.getAbstractTet( != nlsp.setAbstractText(spDTO.getAbstract}if(spDTO.getUri() != null){sp.setUri(spDTO.getUri());}if(spDTO.getDocumntath()!sp.setDocumentPath(spDTO.g}if(spDTO.getDateIssued() ! nll) {sp.setDateIssued(spDTO.getDateIssued());}if (spDTO.getAdviserId() != null) {l

        .oElseThrow(() -> new RspnseStt"Adviser not found with ID: " + spDTO.getAviserId()));sp.setAdviseraviser);} else {logger.debug("Adviser ID fiel s null in update DTO, ssp.setAdviser(null);}S

        Set<Tag> tag = newHshSet<>();if(!tagId.iEmpty)tags = tagIds.stream().map(tagd ->tgRepository.find.oElseThrow(() -> newR"Tagwth ID " + tagId.collect(Cllctors.toSet());}sp.setTags(tag)} else {lsp.setTags(new Ha}L

        Set<Student> tudents = e HashSet<>();if(!studentId.iEmpty)students = studentIds.stream().map(studentd -> stuetRepository.find.oElseThrow(() -> new Reso"Studentwth ID " + studentId.collect(Colletos.toSet());}sp.setStudents(stuets);} els

        s.sett}S

        SPDTO resutTO = toDTO(savedSP);logger.debug("Returning updated DTO: {}", resutDTO);return resultDT;}
    

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
@Transactiona

    tring, Object> processSPUpload(MultipartFile file, Integer uploadedById) throws IOException {
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
if (line.length < EXPECTED_COLUMNS) {
errors.add("Row " + processedRows + ": Incorrect number of columns. Expected " + EXPECTED_COLUMNS + ", found " + line.length + ". Skipping row.");
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
// Pass processedRows to findOrCreateAdviser
adviser = findOrCreateAdviser(adviserStr, processedRows);
if (adviser == null) {
errors.add("Row " + processedRows + ": Failed to process adviser '" + adviserStr + "'. Skipping row.");
logger.warn("Row {} skipped: Failed to process adviser '{}'.", processedRows, adviserStr);
continue;
}
} catch (IllegalArgumentException e) {
errors.add("Row " + processedRows + ": Invalid adviser format '" + adviserStr + "': " + e.getMessage() + ". Skipping row.");
logger.warn("Row {} skipped: Invalid adviser format '{}'.", processedRows, adviserStr, e);
continue;
} catch (RuntimeException e) {
errors.add("Row " + processedRows + ": Error processing adviser '" + adviserStr + "': " + e.getMessage() + ". Skipping row.");
logger.error("Row {} skipped: Error processing adviser '{}'.", processedRows, adviserStr, e);
continue;
}
} else {
logger.debug("Row {}: Adviser column is empty, setting adviser to null.", processedRows);
}


if (!authorsStr.isEmpty() {

    
try {
// processedRows is already passed to findOrCreateStudents
students = findOrCreateStuden

    d tudents could be proces
    ed from '{}'. Skipping row.", processedRows, authorsStr);
continue;
}
} catch (IllegalArgumentException e) {
errors.add("Row " + processedRows + ": Invalid author format '" + authorsStr + "': " + e.getMessage() + ". Skipping row.");
logger.warn("Row {} skipped: Invalid author format '{}'.", processedRows, authorsStr, e);
continue;
} catch (RuntimeException e) {
errors.add("Row " + processedRows + ": Error processing authors '" + authorsStr + "': " + e.getMessage() + ". Skipping row.");
logger.error("Row {} skipped: Error processing authors '{}'.", processedRows, authorsStr, e);
continue;
}
    
} else {s column is empty, setting students to empty set.", proc
    
    
if (!tagsStr.isEmpty()) {
try {
// processedRows is already passed to findOrCreateTags
tags = findOrCreateTags(tagsStr, errors, processedRows);
} catch (RuntimeExcepesedRw 

    
    olumn is empty, setting tags to empty set."
    
    
    

try {
if (!dateIssuedStr.isEmpty()) {
// Parse to YearMonth and the

    te

    s

    skipp 
    
    y if the column is empty ar column

    skip
    rim();
    ()) 

     olumn is eaesedRoss

    

     
    
     ter);btractTet);  ocumentPath);eIssued);o

    nts);


    sfully saved SP

    utOfBoundsException e) {
    processedRows + ": Error accessing column data (likely due to insufficient columns). Skipping row.");
logger.warn("Row {} skipped due to column access error.", processedRows, e);
continue;) {processedRows + ": Unexpected error processi

    n 

    CV Vald
    ation Error at line " + e.getLineurror("CSV Validato
     Error", e);
throw new RuntimeException("CSV Validation Error: " + e.getMessage()xception Eror ra
    ding CSV fil:rror("Error readig
    CSV file", e);
throw e; // Re-throw IOException
    eption e) {
    An unexpected error occurred during the upload process: " +egetMessage());r

    
    

    ng, Object> result = new HashMap<>();u("suce
    ssCount", succsut("errorCount", errors.size(ut("errors", errors);ut("processedRows", processedRows);
retur

    sactional
private Admin findOrCreateAdviser(String adviserStr, int rowNum) {
if (adviserStr == null || adviserStr.trim().isEmpty()) {
logger.debug("Row {}: Adviser name string is empty or null, returning null.", rowNum);
return null;

    nameslegth = ) {
logger.warn("Row {}: Invalid adviser format: '{}'. Expected 'LastName, FirstName'. Cannot process.", rowNum, adviserStr);
throw new IllegalArgumentException("Invalid adviser format: Expected 'LastName, FirstName'");
}

S

    lastName.isEmpy( || firstName.

List<Admin> potentialAdvisers = adminRepository.findByFirstNameAndLastName(firstName, lastName);
o

    dFirst();


if (foundAdviser.isPresent()) {
logger.debug("Row {}: Found exisrn foundAdviser.get();
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
d

    eption e) {
logger.error("Row {}: Failed to crea
    eException("Failed to create new adviser

    
    


     students = new HashSet<>();
if (authorsStr == null || authorsStr.trim().isEmpty()) {
logger.debug("Row {}: Authors string is emp

    airs = authorsStr.trim().split(";");
for (String a

    ir.isEmpt

    " + rowNum + ": Invalid author for
     {}: Invalid author format '{}'.", 

    
    
String lastName = names[0].trim();
String firstName = names[1].trim();

if (lastName.isEmpty() || firstName.isEmpty()) {
errors.add("Row "

    
    
Optional<Student> existingStudent = studentRepository.findByLastNameIgnoreCaseAndFirstNameIgnoreCase(lastName, firstName);

if (existingS
    . ebug("R
    w {}: Fo se {logger.info("Row {}: Student not Student newStudent = new Student();
                                                                                                                 // 
                                                                                                                 // 
                                                                                                                 // 
                                                                                                                 // 
                                                                                                                 // 
                                                                                                                 // 
                                                                                                                 // 
    newStudent.setFirstName(firstName);
    newStudent.setLastName(lastName);
    newStudent.setMiddleName(null); // Assuming middle name is not in this form
    // t
    newStudent.setFaculty(null); // Assuming faculty is no in thi formatn

    students.add(savedStudent);
logger.info("Row {}: Created new student with ID: {}", rowNum, savedStudent.getStudentId());
}

    
    
        @Transactional
        private Set<
    S

    logger.debug("Row {}: Tags string is empty or retr
    n tags;
    
        }

        for (String tagName : taNmes) {

        if (tagName.iEmpty()) cotnue;

        Sting normalizedTagName = tgOptional<Tag> existingTag = tagRepository.findByTagNamegnoreCae(normalizedTagName);if (existingTag.isPresent()) {tags.add(eitingTag.gelogger.debug("Row {}: Found

        logger.in
        T newTag.setTagName(tagName);

        // Add logging befologger.debug("Row {}: Attempting to save new Tag wth name'{}'. Current ID: {}"
    /Tag savedTag = tagRepository.save(newTag);

// Add logging after saving
logger.debug("Row {}: Successfully saved new Tag. Name: '{}', Assigned ID: {}", rowNum, savedTag.getTagName(), savedTag.getTagId());

        
        tags.add(savedTag);
        logger.info("Row {}: Created new tag with ID: {}", ro
        }
        }

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
