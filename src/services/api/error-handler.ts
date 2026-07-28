import type { AxiosError } from "axios";
import { ApiError } from "@/types/api";

interface BackendErrorBody {
  success?: boolean;
  message?: string;
  error?: {
    code?: string;
    details?: {
      errors?: Array<{ field: string; message: string }>;
      geofence?: {
        allowed?: boolean;
        distanceMeters?: number | null;
        nearestOffice?: {
          name?: string;
          distanceMeters?: number | null;
          radiusMeters?: number;
        } | null;
      };
      [key: string]: unknown;
    };
  };
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<BackendErrorBody>;
    const status = axiosError.response?.status ?? 500;
    const body = axiosError.response?.data;
    const fieldErrors = body?.error?.details?.errors;

    const errors: Record<string, string[]> | undefined = fieldErrors?.reduce(
      (acc, item) => {
        if (!acc[item.field]) acc[item.field] = [];
        acc[item.field].push(item.message);
        return acc;
      },
      {} as Record<string, string[]>
    );

    return new ApiError({
      message: body?.message ?? axiosError.message ?? "An unexpected error occurred",
      code: body?.error?.code,
      errors,
      statusCode: status,
      details: body?.error?.details,
    });
  }

  if (error instanceof Error) {
    if (error.message === "Network Error") {
      return new ApiError({ message: "Network error. Please check your connection.", statusCode: 0 });
    }
    const fetchLike = error as Error & { response?: { status?: number; data?: BackendErrorBody } };
    if (fetchLike.response?.data?.message) {
      return new ApiError({
        message: fetchLike.response.data.message,
        code: fetchLike.response.data.error?.code,
        statusCode: fetchLike.response.status ?? 0,
        details: fetchLike.response.data.error?.details,
      });
    }
    return new ApiError({ message: error.message, statusCode: 0 });
  }

  return new ApiError({ message: "An unexpected error occurred", statusCode: 500 });
}

export function getErrorMessage(error: unknown): string {
  const apiError = handleApiError(error);
  const geofence = apiError.details?.geofence as
    | {
        nearestOffice?: { name?: string; distanceMeters?: number | null; radiusMeters?: number } | null;
      }
    | undefined;

  if (apiError.statusCode === 403 && geofence) {
    const nearest = geofence.nearestOffice;
    if (nearest?.name && nearest.distanceMeters != null) {
      return `Outside office geofence. Nearest office "${nearest.name}" is ${nearest.distanceMeters}m away${
        nearest.radiusMeters != null ? ` (allowed ${nearest.radiusMeters}m)` : ""
      }.`;
    }
    return apiError.message || "Outside office geofence";
  }

  if (
    apiError.statusCode === 400 &&
    /latitude|longitude|location/i.test(apiError.message)
  ) {
    return "Location is required. Please enable GPS and try again.";
  }

  // Surface conflict messages as-is (leave/reg/WFH date conflicts, etc.)
  if (apiError.statusCode === 409) {
    return apiError.message || "This action conflicts with an existing record.";
  }

  return apiError.message;
}

export function getFieldErrors(error: unknown): Record<string, string[]> | undefined {
  return handleApiError(error).errors;
}
