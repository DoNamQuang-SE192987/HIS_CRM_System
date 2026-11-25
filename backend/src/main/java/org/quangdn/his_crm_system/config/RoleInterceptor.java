package org.quangdn.his_crm_system.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.quangdn.his_crm_system.enums.Role;
import org.quangdn.his_crm_system.exception.ForbiddenException;
import org.quangdn.his_crm_system.exception.UnauthorizedException;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.Locale;

/**
 * MVP role guard: reads the caller's role from the {@value #ROLE_HEADER} header and checks it
 * against {@link RequireRole}.
 * <p>
 * This is a placeholder until real authentication (e.g. JWT) is added - the header is trusted as-is.
 * When that happens, only {@link #resolveRole} needs to change.
 */
@Component
public class RoleInterceptor implements HandlerInterceptor {

    public static final String ROLE_HEADER = "X-User-Role";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod method)) {
            return true;
        }
        RequireRole required = AnnotatedElementUtils.findMergedAnnotation(method.getMethod(), RequireRole.class);
        if (required == null) {
            required = AnnotatedElementUtils.findMergedAnnotation(method.getBeanType(), RequireRole.class);
        }
        if (required == null) {
            return true;
        }

        Role role = resolveRole(request);
        if (Arrays.stream(required.value()).noneMatch(r -> r == role)) {
            throw new ForbiddenException("Role " + role + " is not allowed to perform this action");
        }
        return true;
    }

    private Role resolveRole(HttpServletRequest request) {
        String header = request.getHeader(ROLE_HEADER);
        if (header == null || header.isBlank()) {
            throw new UnauthorizedException("Missing " + ROLE_HEADER + " header");
        }
        try {
            return Role.valueOf(header.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new UnauthorizedException("Unknown role: " + header);
        }
    }
}
