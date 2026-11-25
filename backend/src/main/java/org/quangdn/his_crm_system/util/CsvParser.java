package org.quangdn.his_crm_system.util;

import java.util.ArrayList;
import java.util.List;

/**
 * Minimal RFC 4180 CSV reader - enough for marketplace order exports, no extra dependency.
 * <ul>
 *     <li>Delimiter auto-detected from the header line: comma, semicolon (EU Excel) or tab (Amazon reports).</li>
 *     <li>Quoted fields may contain delimiters, line breaks and escaped quotes ({@code ""}).</li>
 *     <li>A leading UTF-8 BOM (Excel "CSV UTF-8") is stripped; blank lines are skipped.</li>
 * </ul>
 */
public final class CsvParser {

    private CsvParser() {
    }

    /** A parsed record with the 1-based line number it started on (for error messages). */
    public record Row(int lineNumber, List<String> cells) {

        public String get(int index) {
            return index >= 0 && index < cells.size() ? cells.get(index).trim() : "";
        }
    }

    public static List<Row> parse(String content) {
        if (content.startsWith("﻿")) {
            content = content.substring(1);
        }
        char delimiter = detectDelimiter(content);

        List<Row> rows = new ArrayList<>();
        List<String> cells = new ArrayList<>();
        StringBuilder cell = new StringBuilder();
        boolean inQuotes = false;
        int line = 1;
        int rowStartLine = 1;

        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < content.length() && content.charAt(i + 1) == '"') {
                        cell.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    if (c == '\n') {
                        line++;
                    }
                    cell.append(c);
                }
            } else if (c == '"') {
                inQuotes = true;
            } else if (c == delimiter) {
                cells.add(cell.toString());
                cell.setLength(0);
            } else if (c == '\n' || c == '\r') {
                if (c == '\r' && i + 1 < content.length() && content.charAt(i + 1) == '\n') {
                    i++;
                }
                cells.add(cell.toString());
                cell.setLength(0);
                addIfNotBlank(rows, rowStartLine, cells);
                cells = new ArrayList<>();
                line++;
                rowStartLine = line;
            } else {
                cell.append(c);
            }
        }
        cells.add(cell.toString());
        addIfNotBlank(rows, rowStartLine, cells);
        return rows;
    }

    private static void addIfNotBlank(List<Row> rows, int lineNumber, List<String> cells) {
        if (cells.stream().anyMatch(value -> !value.isBlank())) {
            rows.add(new Row(lineNumber, List.copyOf(cells)));
        }
    }

    private static char detectDelimiter(String content) {
        int end = content.indexOf('\n');
        String header = end < 0 ? content : content.substring(0, end);
        long commas = header.chars().filter(ch -> ch == ',').count();
        long semicolons = header.chars().filter(ch -> ch == ';').count();
        long tabs = header.chars().filter(ch -> ch == '\t').count();
        if (tabs > commas && tabs > semicolons) {
            return '\t';
        }
        return semicolons > commas ? ';' : ',';
    }
}
