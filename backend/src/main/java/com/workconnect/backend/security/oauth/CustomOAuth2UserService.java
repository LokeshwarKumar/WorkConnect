package com.workconnect.backend.security.oauth;

import com.workconnect.backend.security.services.UserDetailsImpl;
import com.workconnect.backend.service.OAuthAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    public static final String USER_DETAILS_ATTR = "workconnectUserDetails";

    @Autowired
    private OAuthAccountService oauthAccountService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        String email = extractEmail(oauth2User, registrationId);
        String name = extractName(oauth2User, registrationId);

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not available from " + registrationId);
        }

        UserDetailsImpl userDetails = oauthAccountService.resolveOAuthUser(email, name);

        Map<String, Object> attributes = new HashMap<>(oauth2User.getAttributes());
        attributes.put(USER_DETAILS_ATTR, userDetails);

        String nameAttributeKey = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();

        return new DefaultOAuth2User(userDetails.getAuthorities(), attributes, nameAttributeKey);
    }

    private String extractEmail(OAuth2User user, String provider) {
        if ("google".equals(provider)) {
            return (String) user.getAttribute("email");
        }
        if ("github".equals(provider)) {
            String email = (String) user.getAttribute("email");
            if (email != null && !email.isBlank()) {
                return email;
            }
            String login = (String) user.getAttribute("login");
            if (login != null) {
                return login + "@users.noreply.github.com";
            }
        }
        return null;
    }

    private String extractName(OAuth2User user, String provider) {
        if ("google".equals(provider)) {
            return (String) user.getAttribute("name");
        }
        if ("github".equals(provider)) {
            String name = (String) user.getAttribute("name");
            if (name != null && !name.isBlank()) {
                return name;
            }
            return (String) user.getAttribute("login");
        }
        return null;
    }
}
