package org.example.modules.auth.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.example.modules.auth.dto.AuthResponse;
import org.example.modules.auth.dto.LoginRequest;
import org.example.modules.auth.dto.RegisterRequest;
import org.example.modules.auth.dto.RecuperarClaveRequest;
import org.example.modules.auth.service.CuentaService;
import org.example.modules.auth.entity.AuthUser;
import org.example.modules.auth.service.AuthRegistrationService;
import org.example.security.JwtAuthenticationFilter;
import org.example.security.TokenService;
import org.example.security.jaas.JaasAuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


/**
 * Documentación JavaDoc de la clase AuthController.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.auth.controller.AuthController.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Controlador REST de APEX FIT que expone endpoints HTTP para el módulo auth.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final JaasAuthenticationService jaasAuthenticationService;
    private final AuthRegistrationService registrationService;
    private final CuentaService cuentaService;

    public AuthController(AuthenticationManager authenticationManager,
                          TokenService tokenService,
                          JaasAuthenticationService jaasAuthenticationService,
                          AuthRegistrationService registrationService,
                          CuentaService cuentaService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.jaasAuthenticationService = jaasAuthenticationService;
        this.registrationService = registrationService;
        this.cuentaService = cuentaService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) throws Exception {
        jaasAuthenticationService.authenticate(request.getUsername(), request.getPassword());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String role = obtenerRol(authentication);
        String token = tokenService.generateToken(authentication.getName(), role);
        agregarCookieJwt(response, token);

        return ResponseEntity.ok(new AuthResponse(true, authentication.getName(), role, token));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthUser user = registrationService.registerClient(request.getUsername(), request.getPassword());
        String token = tokenService.generateToken(user.getUsername(), user.getRole());
        agregarCookieJwt(response, token);

        return ResponseEntity.ok(new AuthResponse(true, user.getUsername(), user.getRole(), token));
    }

    /** Recuperación de clave (pública): verifica usuario + cédula. Solo CLIENTE y ENTRENADOR. */
    @PostMapping("/recuperar-clave")
    public ResponseEntity<java.util.Map<String, String>> recuperarClave(@Valid @RequestBody RecuperarClaveRequest request) {
        cuentaService.recuperarClave(request.getUsername(), request.getCedula(), request.getNuevaClave());
        return ResponseEntity.ok(java.util.Map.of("message", "Contraseña restablecida. Ya puedes iniciar sesión."));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie(JwtAuthenticationFilter.COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(new AuthResponse(false, null));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new AuthResponse(false, null));
        }
        return ResponseEntity.ok(new AuthResponse(true, authentication.getName(), obtenerRol(authentication)));
    }

    private void agregarCookieJwt(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(JwtAuthenticationFilter.COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(tokenService.getExpirationSeconds());
        response.addCookie(cookie);
        response.setHeader("Authorization", "Bearer " + token);
    }

    private String obtenerRol(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElse(null);
    }
}
