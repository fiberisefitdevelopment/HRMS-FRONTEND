"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useImportExecuteMutation,
  useImportPreviewMutation,
} from "@/hooks/mutations/use-employee-mutations";
import type { ImportResult } from "@/types/employee";

interface EmployeeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeImportDialog({ open, onOpenChange }: EmployeeImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const previewMutation = useImportPreviewMutation();
  const importMutation = useImportExecuteMutation();

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(null);
      previewMutation.mutate(selected, {
        onSuccess: (result) => setPreview(result),
      });
    }
  };

  const handleImport = () => {
    if (!file) return;
    importMutation.mutate(file, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  const failedRows = preview?.report.filter((r) => !r.imported && r.status !== "valid") ?? [];

  const downloadErrorReport = () => {
    if (!preview?.report.length) return;
    const header = "Row,Status,Reason\n";
    const rows = preview.report
      .filter((r) => r.status !== "valid" && !r.imported)
      .map((r) => `${r.rowNumber},${r.status},"${r.reason ?? ""}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Employees</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 hover:bg-muted/50">
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">
              {file ? file.name : "Click to upload Excel file"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {previewMutation.isPending && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Validating file...</p>
              <Progress value={60} />
            </div>
          )}

          {preview && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <FileSpreadsheet className="mr-1 h-3 w-3" />
                  Total: {preview.summary.total}
                </Badge>
                <Badge variant="success">Valid: {preview.summary.imported + preview.summary.skipped}</Badge>
                <Badge variant="destructive">Failed: {preview.summary.failed}</Badge>
              </div>

              {failedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Validation Issues</p>
                    <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                      <Download className="mr-2 h-4 w-4" />
                      Error Report
                    </Button>
                  </div>
                  <div className="max-h-48 overflow-auto rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {failedRows.slice(0, 20).map((row) => (
                          <TableRow key={row.rowNumber}>
                            <TableCell>{row.rowNumber}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>{row.reason ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          {importMutation.isPending && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Importing employees...</p>
              <Progress value={80} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            isLoading={importMutation.isPending}
            disabled={!file || !preview || preview.summary.failed === preview.summary.total}
            onClick={handleImport}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
