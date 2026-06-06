package com.workconnect.backend.service;

import com.workconnect.backend.entity.User;
import com.workconnect.backend.enums.Role;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerRepository;
import com.workconnect.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OAuthAccountService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private PasswordEncoder encoder;

    /**
     * Find existing account by email or create a new USER profile for OAuth sign-in.
     */
    public UserDetailsImpl resolveOAuthUser(String email, String name) {
        var existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return UserDetailsImpl.build(existingUser.get());
        }

        var existingWorker = workerRepository.findByEmail(email);
        if (existingWorker.isPresent()) {
            return UserDetailsImpl.build(existingWorker.get());
        }

        String displayName = (name != null && !name.isBlank()) ? name : email.split("@")[0];
        User user = User.builder()
                .name(displayName)
                .email(email)
                .password(encoder.encode(UUID.randomUUID().toString()))
                .contactDetails("")
                .address("")
                .role(Role.USER)
                .build();
        userRepository.save(user);
        return UserDetailsImpl.build(user);
    }
}
