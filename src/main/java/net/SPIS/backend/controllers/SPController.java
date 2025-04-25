package net.SPIS.backend.controllers;

import net.SPIS.backend.DTO.AdviserDTO;
import net.SPIS.backend.DTO.SPDTO;
import net.SPIS.backend.service.SPService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.PageRequest; // Import PageRequest
import org.springframework.data.domain.Pageable; // Import Pageable
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sp")
public class SPController {

private static final Logger logger = LoggerFactory.getLogger(SPController.class);

@Autowired
private SPService spService;

@GetMapping("/{spId}")
public ResponseEntity<SPDTO> getSP(@PathVariable Integer spId) {
SPDTO spDTO = spService.getSP(spId);
return ResponseEntity.ok(spDTO);
}

// Modified to accept pagination parameters and return a Page
@GetMapping
public ResponseEntity<Page<SPDTO>> getAllSP(
@RequestParam(defaultValue = "0") int page, // Default page is 0
@RequestParam(defaultValue = "10") int size // Default size is 10
)

    Page<SPDTO> spPage = spService.getAllSP(pageable);
    return ResponseEntity.ok(spPage);
    }
            
            // Modified to accept pagination parameters
            @GetMapping("/adviser/{adviserId}")pub
        @PathVariable Integer adviserId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10"
    )

    Page<SPDTO> spPage = spService.getSPFromAdviser(adviserId, pa
    return ResponseEntity.ok(spPage);
    }
            
            // Modified to accept pagination parameters
            @GetMapping("/student/{studentId}")pub
        @PathVariable Integer studentId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10"
    )

    Page<SPDTO> spPage = spService.getSPFromStudent(studentId, pa
    return ResponseEntity.ok(spPage);
    }
            
            // Modified to accept pagination parameters
            @GetMapping("/faculty/{facultyId}")pub
        @PathVariable Integer facultyId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10"
    )

    return Respo
    }
        
            
            @PostMapping
        public ResponseEntity<SPDTO> createSP
            try {
        SPDTO createdSP = spSer
            return new ResponseEntity<>(createdSP
            } catch (ResponseStatusException e) {
        t
    }

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR
    }
    }
            
            // Modified to accept pagination parameters
            @GetMapping("/tags")pub
        @RequestParam List<Integer> tagIds,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10"
    )

    Page<SPDTO> spPage = spServ
    return ResponseEntity.ok(spPage);
        }
        
    @

    rn ResponseEntity.ok().build();
        }
        
    @

    rn ResponseEntity.ok(sps);
}

    
@GetMapping("/{spId}/view-c

    

@GetMapping("/top-advisers")
public ResponseEntity<List<AdviserDTO>> getTopAdvisersByViews() {
List<AdviserDTO> advisers = spService.getTopAdvisersByViews();
return ResponseEntity.ok(advisers);
}

@PutMapping("/{spId}/update")
public ResponseEntity<SPDTO> updateSP(@PathVariable Integer spId, @RequestBody SPDTO spDTO) {
try {
SPDTO updatedSP = spService.updateSP(spId, spDTO);
return ResponseEntity.ok(updatedSP);
} catch (ResponseStatusException e) {
throw e;
} catch (Exception e) {
logger.error("Error updating SP with ID: {}", spId, e);
return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
}
}

@PostMapping("/upload-csv")
public ResponseEntity<Map<String, Object>> uploadSPCSV(
@RequestParam("file") MultipartFile file,
@RequestParam("uploadedById") Integer uploadedById) {
logger.info("R

    file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "
            }
            try {
            Map<String, Object> result = spService.processSPUp
            return ResponseEntity.ok(result);
            } catch (ResponseStatusException e) {log
        return ResponseEntity.status(e.getStatusCode())
        } catch (IOException e) {
        logger.error("Error processing CS
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error processing CSV file: " + e.getMessage()));
}
return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "A critical error occurred during upload: " + e.getMessage()));
} catch (Exception e) {
logger.error("An unexpected error occurred during upload", e);
return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred during upload: " + e.getMessage()));
}
}

// New endpoint for filtering with pagination
@GetMapping("/filter")
public ResponseEntity<Page<SPDTO>> filterSPs(
@RequestParam(required = false) List<Integer> adviserIds,
@RequestParam(required = false) List<Integer> tagIds,
@RequestParam(required = false) Integer facultyId,
@RequestParam(required = false) String searchTerm,
@RequestParam(defaultValue = "0") int page,
@RequestParam(defaultValue = "10") int size
) {
Pageable pageable = PageRequest.of(page, size);
Page<SPDTO> spPage = spService.filterSPs(adviserIds, tagIds, facultyId, searchTerm, pageable);
return ResponseEntity.ok(spPage);
}
}
