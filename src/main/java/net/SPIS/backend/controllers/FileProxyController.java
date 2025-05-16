package net.SPIS.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.net.URI;

@RestController
@RequestMapping("/api/files")
public class FileProxyController {

    private final RestTemplate restTemplate;

    @Autowired
    public FileProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Proxy endpoint for Google Drive files
     * @param type Type of request (thumbnail, download, preview)
     * @param fileId Google Drive file ID
     * @return ResponseEntity with the requested content
     */
    @GetMapping("/proxy/{type}/{fileId}")
    public ResponseEntity<?> proxyGoogleDriveFile(
            @PathVariable String type,
            @PathVariable String fileId) {
        
        try {
            String url;
            MediaType mediaType;
            HttpHeaders headers = new HttpHeaders();
            
            switch (type) {
                case "thumbnail":
                    url = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w400-h400";
                    mediaType = MediaType.IMAGE_JPEG;
                    break;
                case "download":
                    url = "https://drive.google.com/uc?export=download&id=" + fileId;
                    mediaType = MediaType.APPLICATION_PDF;
                    headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document.pdf\"");
                    break;
                case "preview":
                    // For preview, we'll return a URL that points to our own proxy endpoint
                    // This avoids embedding Google Drive directly
                    return ResponseEntity.ok().body("/api/files/proxy/download/" + fileId);
                default:
                    return ResponseEntity.badRequest().body("Invalid proxy type");
            }
            
            // Get content from Google Drive
            ResponseEntity<byte[]> response = restTemplate.getForEntity(new URI(url), byte[].class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                headers.setContentType(mediaType);
                InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(response.getBody()));
                
                return ResponseEntity.ok()
                        .headers(headers)
                        .contentLength(response.getBody().length)
                        .body(resource);
            } else {
                return ResponseEntity.status(response.getStatusCode()).build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error accessing file: " + e.getMessage());
        }
    }
}