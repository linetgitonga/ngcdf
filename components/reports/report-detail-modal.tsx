"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Report {
  id: string
  ref_code: string
  citizen: string
  ward: string
  category_en: string
  description: string
  status_en: string
  priority_level_en: string
  created_at: string
}

interface Props {
  isOpen: boolean
  report: Report | null
  onClose: () => void
}

export default function ReportDetailModal({ isOpen, report, onClose }: Props) {
  if (!report) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle>Report {report.ref_code}</DialogTitle>
              <DialogDescription className="mt-1">
                Detailed information for this report
              </DialogDescription>
            </div>
            <Button variant="ghost" onClick={onClose} className="h-9 w-9 p-0">
              <X />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-medium text-foreground/90">Category</h4>
            <p className="text-foreground-muted capitalize">{report.category_en.replace(/_/g, " ")}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground/90">Status</h4>
            <p className="text-foreground-muted capitalize">{report.status_en.replace(/_/g, " ")}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground/90">Priority</h4>
            <p className="text-foreground-muted">{report.priority_level_en.toUpperCase()}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground/90">Description</h4>
            <p className="text-foreground-muted whitespace-pre-wrap">{report.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground/90">Citizen</h4>
            <p className="text-foreground-muted">{report.citizen}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground/90">Ward</h4>
            <p className="text-foreground-muted">{report.ward}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground/90">Created</h4>
            <p className="text-foreground-muted">{new Date(report.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
