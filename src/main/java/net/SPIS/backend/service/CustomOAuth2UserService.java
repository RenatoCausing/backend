package net.SPIS.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import net.SPIS.backend.entities.Admin;
import net.SPIS.backend.repositories.AdminRepository;

import java.util.Collections;
import java.util.Map;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Autowired
    private AdminRepository adminRepository;

    @Transactional
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
            OAuth2User oauth2User = delegate.loadUser(userRequest);

            Map<String, Object> attributes = oauth2User.getAttributes();

            System.out.println("OAuth attributes received:");
            attributes.forEach((key, value) -> System.out.println(key + ": " + value));

            String email = (String) attributes.get("email");

            System.out.println("OAuth login attempt with email: " + email);

            // Check if admin exists with this email
            Admin admin = adminRepository.findByEmail(email).orElse(null);

            if (admin == null) {
                // Create new admin
                admin = new Admin();
                admin.setEmail(email);
                admin.setFirstName((String) attributes.get("given_name"));
                admin.setLastName((String) attributes.get("family_name"));
                admin.setImagePath((String) attributes.get("picture"));
                admin.setRole(null); // Role is set manually later

                System.out.println("Creating new admin for: " + email);

                try {
                    admin = adminRepository.save(admin);
                    System.out.println("Admin saved successfully with ID: " + admin.getAdminId());
                } catch (Exception e) {
                    System.err.println("Error saving admin: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("Admin already exists with ID: " + admin.getAdminId());
            }

            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                    attributes,
                    "email");
        } catch (Exception e) {
            System.err.println("Unexpected error in OAuth2 user loading: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}