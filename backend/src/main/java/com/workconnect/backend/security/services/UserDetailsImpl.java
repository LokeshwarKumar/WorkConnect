package com.workconnect.backend.security.services;

import com.workconnect.backend.entity.User;
import com.workconnect.backend.entity.Worker;
import com.workconnect.backend.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Getter
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String email;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String name, String email, String password,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        Role r = user.getRole() != null ? user.getRole() : Role.USER;
        String authority = r == Role.ADMIN ? "ROLE_ADMIN" : "ROLE_USER";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authority));

        return new UserDetailsImpl(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                authorities);
    }

    public static UserDetailsImpl build(Worker worker) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_WORKER"));

        return new UserDetailsImpl(
                worker.getId(),
                worker.getName(),
                worker.getEmail(),
                worker.getPassword(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}
