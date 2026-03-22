package com.workconnect.backend.security.services;

import com.workconnect.backend.entity.User;
import com.workconnect.backend.entity.Worker;
import com.workconnect.backend.repository.UserRepository;
import com.workconnect.backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    WorkerRepository workerRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try to find user in User table first
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user != null) {
            return UserDetailsImpl.build(user);
        }
        
        // Try to find user in Worker table
        Worker worker = workerRepository.findByEmail(email).orElse(null);
        
        if (worker != null) {
            return UserDetailsImpl.build(worker);
        }
        
        throw new UsernameNotFoundException("User Not Found with email: " + email);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserByJwtSubject(String subject) {
        if (subject == null || subject.length() < 2) {
            throw new UsernameNotFoundException("Invalid token subject");
        }
        // Backward compatibility:
        // - Old tokens used the email as the JWT subject.
        // - New tokens use U{userId} / W{workerId} as the JWT subject.
        String s = subject.trim();
        char kind = s.charAt(0);
        String rest = s.substring(1);
        boolean restIsDigits = !rest.isBlank() && rest.matches("\\d+");

        if ((kind == 'U' || kind == 'u' || kind == 'W' || kind == 'w') && restIsDigits) {
            long id = Long.parseLong(rest);
            if (kind == 'W' || kind == 'w') {
                Worker worker = workerRepository.findById(id)
                        .orElseThrow(() -> new UsernameNotFoundException("Worker Not Found with id: " + id));
                return UserDetailsImpl.build(worker);
            }
            if (kind == 'U' || kind == 'u') {
                User user = userRepository.findById(id)
                        .orElseThrow(() -> new UsernameNotFoundException("User Not Found with id: " + id));
                return UserDetailsImpl.build(user);
            }
        }

        // Fallback: treat subject as email and resolve account from either table.
        User user = userRepository.findByEmail(s).orElse(null);
        if (user != null) {
            return UserDetailsImpl.build(user);
        }
        Worker worker = workerRepository.findByEmail(s).orElse(null);
        if (worker != null) {
            return UserDetailsImpl.build(worker);
        }

        throw new UsernameNotFoundException("User Not Found with subject: " + subject);
    }
}
