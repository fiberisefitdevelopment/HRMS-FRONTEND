"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Can } from "@/components/guards/permission-guard";
import {
  useDeleteMyPhotoMutation,
  useDeletePhotoMutation,
  useUploadMyPhotoMutation,
  useUploadPhotoMutation,
} from "@/hooks/mutations/use-employee-mutations";
import { getMediaUrl } from "@/lib/api/media-url";

interface EmployeePhotoUploadProps {
  /** Employee profile id — required for admin uploads */
  employeeId?: string;
  /** Self-service uses POST/DELETE /employees/me/photo */
  mode?: "self" | "admin";
  fullName: string;
  profilePhoto?: string | null;
  initials: string;
}

export function EmployeePhotoUpload({
  employeeId,
  mode = "admin",
  fullName,
  profilePhoto,
  initials,
}: EmployeePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadAdmin = useUploadPhotoMutation();
  const deleteAdmin = useDeletePhotoMutation();
  const uploadSelf = useUploadMyPhotoMutation();
  const deleteSelf = useDeleteMyPhotoMutation();
  const [preview, setPreview] = useState<string | null>(null);

  const isSelf = mode === "self";
  const uploadMutation = isSelf ? uploadSelf : uploadAdmin;
  const deleteMutation = isSelf ? deleteSelf : deleteAdmin;
  const displayUrl = preview ?? getMediaUrl(profilePhoto);
  const isUploading = uploadMutation.isPending;
  const permission = isSelf ? "profile.upload" : "profile.upload";

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    if (isSelf) {
      uploadSelf.mutate(file, {
        onSettled: () => {
          URL.revokeObjectURL(url);
          setPreview(null);
        },
      });
      return;
    }
    if (!employeeId) return;
    uploadAdmin.mutate(
      { id: employeeId, file },
      {
        onSettled: () => {
          URL.revokeObjectURL(url);
          setPreview(null);
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="h-28 w-28">
          {displayUrl && <AvatarImage src={displayUrl} alt={fullName} />}
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <Can permission={permission}>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            aria-label="Upload photo"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </Can>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {isUploading && (
        <div className="w-full max-w-[140px] space-y-1">
          <Progress value={70} />
          <p className="text-center text-xs text-muted-foreground">Uploading...</p>
        </div>
      )}

      <Can permission={permission}>
        {profilePhoto && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            isLoading={deleteMutation.isPending}
            onClick={() => {
              if (isSelf) deleteSelf.mutate();
              else if (employeeId) deleteAdmin.mutate(employeeId);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Photo
          </Button>
        )}
      </Can>
    </div>
  );
}
