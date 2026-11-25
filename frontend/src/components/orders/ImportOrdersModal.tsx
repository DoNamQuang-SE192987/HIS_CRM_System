"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ErrorBanner } from "@/components/common";
import { BUTTON, FORM_CONTROL_CLASS, FormField, Icon, Modal, Select } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { ImportResultStatus, OrderImportResult, SalesChannel } from "@/interfaces";
import { orderService } from "@/services";
import { cn, errorMessage } from "@/utils";

const RESULT_STYLE: Record<ImportResultStatus, string> = {
  CREATED: "bg-primary-fixed text-on-primary-fixed-variant",
  SKIPPED: "bg-surface-container-high text-secondary",
  FAILED: "bg-error-container text-on-error-container",
};

interface ImportOrdersModalProps {
  onClose: () => void;
  onImported: () => void;
}

/** Upload the Walmart / Amazon order export and see a per-order report. */
export function ImportOrdersModal({ onClose, onImported }: ImportOrdersModalProps) {
  const [channel, setChannel] = useState<Exclude<SalesChannel, "WHOLESALE">>("WALMART");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OrderImportResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const report = await orderService.importCsv(channel, file);
      setResult(report);
      if (report.created > 0) onImported();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const csv = await orderService.importTemplate();
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "marketplace-orders-template.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(new Error(errorMessage(err)));
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title="Import Marketplace Orders"
      subtitle="Upload the order export from Walmart Seller Center / Amazon Seller Central"
      icon="upload_file"
    >
      <form className="p-space-lg flex flex-col gap-space-md" onSubmit={submit}>
        <ErrorBanner error={error} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md items-end">
          <FormField label="Marketplace" htmlFor="imp-channel">
            <Select
              id="imp-channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value as Exclude<SalesChannel, "WHOLESALE">)}
            >
              <option value="WALMART">Walmart</option>
              <option value="AMAZON">Amazon</option>
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="CSV / TSV file" htmlFor="imp-file" hint="Same order # on several rows = one order with several SKUs">
              <input
                id="imp-file"
                type="file"
                accept=".csv,.tsv,.txt,text/csv"
                className={cn(FORM_CONTROL_CLASS, "py-1.5 h-auto")}
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setResult(null);
                }}
              />
            </FormField>
          </div>
        </div>
        <div className="flex items-center justify-between gap-space-sm">
          <button className={cn(BUTTON.ghost, "px-0")} type="button" onClick={downloadTemplate}>
            <Icon name="download" className="text-[16px]" />
            Download template
          </button>
          <div className="flex items-center gap-space-sm">
            <button className={BUTTON.ghost} type="button" onClick={onClose}>
              Close
            </button>
            <button className={BUTTON.primary} type="submit" disabled={!file || busy}>
              <Icon name="upload" className="text-[18px]" />
              {busy ? "Importing..." : "Import"}
            </button>
          </div>
        </div>

        {result && (
          <div className="flex flex-col gap-space-sm">
            <div className="flex flex-wrap gap-space-sm font-label-md text-label-md">
              <span className="px-2.5 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed-variant">
                Created {result.created}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-secondary">
                Skipped {result.skipped}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-error-container text-on-error-container">
                Failed {result.failed}
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-lg bg-surface-container-low">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead className="sticky top-0 bg-surface-container">
                  <tr className="text-secondary font-label-sm text-label-sm uppercase">
                    <th className="py-2 px-3">Marketplace order #</th>
                    <th className="py-2 px-3">Lines</th>
                    <th className="py-2 px-3">Result</th>
                    <th className="py-2 px-3">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {result.results.map((row, index) => (
                    <tr key={`${row.externalOrderNo}-${index}`}>
                      <td className="py-2 px-3 font-data-mono">{row.externalOrderNo ?? "—"}</td>
                      <td className="py-2 px-3 font-data-mono text-secondary">{row.lines.join(", ")}</td>
                      <td className="py-2 px-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", RESULT_STYLE[row.status])}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {row.orderId ? (
                          <Link className="text-primary hover:underline font-data-mono" href={ROUTES.orderDetail(row.orderId)}>
                            {row.orderCode}
                          </Link>
                        ) : (
                          <span className="text-secondary">{row.message}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
