package org.quangdn.his_crm_system.config;

import org.quangdn.his_crm_system.enums.Role;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Restricts a controller method (or every method of a controller) to the given roles.
 * A method-level annotation overrides the class-level one.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    Role[] value();
}
