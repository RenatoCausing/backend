package net.SPIS.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        // Set timeouts
        factory.setConnectTimeout(5000); // 5 seconds
        factory.setReadTimeout(30000);   // 30 seconds
        return new RestTemplate(factory);
    }
}