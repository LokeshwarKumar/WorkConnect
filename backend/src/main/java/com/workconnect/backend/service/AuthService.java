package com.workconnect.backend.service;

import com.workconnect.backend.dto.request.LoginRequest;
import com.workconnect.backend.dto.request.SignupRequest;
import com.workconnect.backend.dto.response.JwtResponse;
import com.workconnect.backend.entity.User;
import com.workconnect.backend.entity.Worker;
import com.workconnect.backend.enums.Role;
import com.workconnect.backend.exception.InvalidRequestException;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerRepository;
import com.workconnect.backend.security.jwt.JwtUtils;
import com.workconnect.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    WorkerRepository workerRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                roles);
    }

    public void registerUser(SignupRequest signUpRequest) {
        // Check if email exists in either table
        boolean emailExistsInUser = userRepository.existsByEmail(signUpRequest.getEmail());
        boolean emailExistsInWorker = workerRepository.existsByEmail(signUpRequest.getEmail());
        
        if (emailExistsInUser || emailExistsInWorker) {
            throw new InvalidRequestException("Error: Email is already in use!");
        }

        Role userRole;
        try {
            userRole = Role.valueOf(signUpRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException("Error: Role must be either USER or WORKER");
        }
        
        if (userRole == Role.ADMIN) {
             throw new InvalidRequestException("Error: Cannot register as ADMIN directly");
        }

        if (userRole == Role.USER) {
            User user = User.builder()
                    .name(signUpRequest.getName())
                    .email(signUpRequest.getEmail())
                    .password(encoder.encode(signUpRequest.getPassword()))
                    .contactDetails("")
                    .address("")
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
        } else if (userRole == Role.WORKER) {
            Worker worker = Worker.builder()
                    .name(signUpRequest.getName())
                    .email(signUpRequest.getEmail())
                    .password(encoder.encode(signUpRequest.getPassword()))
                    .contactDetails("")
                    .address("")
                    .location("")
                    .description("")
                    .serviceType("")
                    .minimumCharge(0.0)
                    .hourlyCharge(0.0)
                    .availability(true)
                    .rating(0.0)
                    .approved(true)
                    .build();
            workerRepository.save(worker);
        }
    }
}
