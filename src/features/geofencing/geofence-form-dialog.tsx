"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GeoMap } from "@/components/geo/geo-map";
import type { Geofence } from "@/types/geofence";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().min(20, "Minimum 20m").max(5000, "Maximum 5000m"),
  address: z.string().optional(),
  isActive: z.boolean(),
});

export type GeofenceFormValues = z.infer<typeof schema>;

interface GeofenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  geofence?: Geofence | null;
  isLoading?: boolean;
  onSubmit: (values: GeofenceFormValues) => void;
}

const DEFAULTS: GeofenceFormValues = {
  name: "",
  latitude: 19.1136,
  longitude: 72.8697,
  radiusMeters: 200,
  address: "",
  isActive: true,
};

export function GeofenceFormDialog({
  open,
  onOpenChange,
  geofence,
  isLoading,
  onSubmit,
}: GeofenceFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GeofenceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const radiusMeters = watch("radiusMeters");
  const name = watch("name");

  useEffect(() => {
    if (!open) return;
    reset({
      name: geofence?.name ?? "",
      latitude: geofence?.latitude ?? DEFAULTS.latitude,
      longitude: geofence?.longitude ?? DEFAULTS.longitude,
      radiusMeters: geofence?.radiusMeters ?? DEFAULTS.radiusMeters,
      address: geofence?.address ?? "",
      isActive: geofence?.isActive ?? true,
    });
  }, [open, geofence, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{geofence ? "Edit office geofence" : "Create office geofence"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} placeholder="Shared HQ" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input type="number" step="any" {...register("latitude", { valueAsNumber: true })} />
              {errors.latitude && (
                <p className="text-xs text-destructive">{errors.latitude.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input type="number" step="any" {...register("longitude", { valueAsNumber: true })} />
              {errors.longitude && (
                <p className="text-xs text-destructive">{errors.longitude.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Radius (m)</Label>
              <Input type="number" {...register("radiusMeters", { valueAsNumber: true })} />
              {errors.radiusMeters && (
                <p className="text-xs text-destructive">{errors.radiusMeters.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input {...register("address")} placeholder="Optional address" />
          </div>

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Inactive fences are ignored at punch time</p>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Map — click to set location</Label>
            <GeoMap
              center={{ latitude: Number(latitude) || DEFAULTS.latitude, longitude: Number(longitude) || DEFAULTS.longitude }}
              pickMode
              height={260}
              onMapClick={({ latitude: lat, longitude: lng }) => {
                setValue("latitude", Number(lat.toFixed(6)), { shouldValidate: true });
                setValue("longitude", Number(lng.toFixed(6)), { shouldValidate: true });
              }}
              markers={[
                {
                  id: "draft",
                  latitude: Number(latitude) || DEFAULTS.latitude,
                  longitude: Number(longitude) || DEFAULTS.longitude,
                  label: name || "New office",
                  color: "blue",
                  radiusMeters: Number(radiusMeters) || 200,
                },
              ]}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {geofence ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
