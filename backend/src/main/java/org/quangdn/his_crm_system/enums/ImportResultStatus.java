package org.quangdn.his_crm_system.enums;

/** Outcome of one order in a CSV import. */
public enum ImportResultStatus {
    /** Order created (status NEW). */
    CREATED,
    /** Marketplace order no already in the system - re-uploading the same file is safe. */
    SKIPPED,
    /** Not created; see message (unknown SKU, bad quantity, discontinued product...). */
    FAILED
}
