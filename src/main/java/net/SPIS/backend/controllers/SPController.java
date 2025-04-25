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

    private static final Lo

        @Autowired

    
        @GetMapping("/{spId}")
        public
            SPDTO spDTO = spService.getSP(spId);

    
        // Modified to acc
        @GetMapping
            public ResponseEntity<Pag
     

        ) {
            Pageable pageable = Pag
                Page<SPDTO> spPage =
     

    
        // Modified to accept pagination parameters and return a Page
                @GetMapping("/adviser/{adviserId}")
                public ResponseEntity<Page<SPDTO>> getSPFromAdvis
                        @PathVariable Integer adviserId,
                        @RequestParam(defaultValue = "0") int pa

            ) {
                Pageable pageable = PageRequest.of(page, size);
                Page<SPDTO> spPage = spService.getSPFromAdvi

            }
                

            @GetMapping("/st

                    @PathVariable Integer studentId,
                    @RequestPara
                        @RequestParam(defaultValue = "10") int siz
                ) {
                Pageable pageable = PageRequest.of(page, size);
                    Page<SPDTO> spPage = spService.getSPFromStudent(
                    return ResponseEntity.ok(spPage);
                }
            
            // Modified to accept pagination parameters a
                @GetMapping("/faculty/{facultyId}")
                public ResponseEntity<Page<SPDTO>> getS
                
                        @RequestParam(defaultValue
                        @RequestParam(defaultValue = "10") int 
                ) {
                    Pageable pageable = Pag
         

            }
        // 

        
     

            try {
                SPDTO createdSP = spService.createSP(spDTO);
                    return new ResponseEntity<>(creat
     

            } catch (Exception e) {
                logger.error("Error creating SP", e);
                    return ResponseEntity.status(Http
     

    
        // Modified to accept pagination parameters and return a Page
            @GetMapping("/tags")
            public ResponseEntity<Page<SPDT
     

                @RequestParam(defaultVa
        ) {
                Pageable pageable = PageRequest.of(pa
     

        }
    
            @PutMapping("/{spId}/view")
        // 
            p
                    spService.incrementViewCount(spId);
                    return ResponseEntity.ok().build();
            }
            
                @GetMapping("/most-viewed")
                public ResponseEntity<List<SPDTO>> getMostViewedSPs(
                List<SPDTO> sps
                    return ResponseEntity.ok(sps);
                }
        
     

            Integer view
            return ResponseEntity.ok(viewCount);
            }
    

        public ResponseEntity<List<Ad
            List<AdviserDTO> advisers = spService.getTopAdvisersByViews();
             
                }
        
                @PutMapping("/{spId}/update")
         
     

                return Resp
            } catch (ResponseStatusException e) {
                    throw e;
                } catch (Exception e) {
                    logger.erro
                        return ResponseEntity.status(H
         
            }
    

        public ResponseEntity<Ma
                @RequestParam("file") MultipartFile file,
                    @RequestParam("uploadedById") Intege
                logger.info("Received request to upload SP CSV by Admin I

                    return ResponseE
                    }
                    try {
         

                } catch (ResponseStatusException e) {
                    logger.error("Upload faile
     

                logger.error("Err
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error
                } catch (RuntimeException e) { // Catch the Runtime
                     logger.error("Critical error during upload process", e);

             
                        logger.error("An unexpected error occu
                        return ResponseEntity.st
                }
                }
            
            // New endpoint for
                @GetMapping("/filter")
                public ResponseEntity<Page<SPDTO>> filterSPs(
         
     

                @RequestParam(required = f
                @RequestParam(d
                @RequestParam(defaultValue = "10") int size
                ) {
                    Pageable pageable = PageRequest.of(page, size);
                    Page<SPDTO> spPage = spService.filterSPs(a   
            }

        
            
            
        

        
        
        
            
            
                    
        
        
        

        
            
            
                    
            
            
            
            
        
            
            
            
                    
        
            
            // 
            
                    
            
        
            
            
            
                    
        
    