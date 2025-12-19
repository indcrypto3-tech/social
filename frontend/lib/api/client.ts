import { toast } from "@/hooks/use-toast";

const API_BASE_URL = "/api";

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
    skipErrorToast?: boolean;
    successMessage?: string;
}

export class ApiClientError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public details?: any
    ) {
        super(message);
        this.name = "ApiClientError";
    }
}

/**
 * Centralized API client for Autopostr.
 * - Automatically attaches credentials (cookies)
 * - Normalizes errors to human-friendly messages
 * - Handles Success/Error toasts
 * - Returns typed responses
 */
export const apiClient = async <T>(
    endpoint: string,
    { params, skipErrorToast = false, successMessage, ...options }: RequestOptions = {}
): Promise<T> => {
    // Normalize endpoint to ensure it points to /api/*
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    const url = new URL(`${API_BASE_URL}/${cleanEndpoint}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
    }

    try {
        const response = await fetch(url.toString(), {
            credentials: "include", // Ensure session cookies are sent
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            let errorMessage = "Something went wrong";
            let statusCode = response.status;
            let details = null;

            try {
                const errorData = await response.json();
                // Prioritize 'message' or 'error' fields
                if (errorData.message) errorMessage = errorData.message;
                else if (errorData.error) errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);

                details = errorData;
            } catch (e) {
                // JSON parsing failed, rely on status code
            }

            // Strict Error Normalization
            if (statusCode === 401) {
                errorMessage = "Authentication expired. Please login again.";
            } else if (statusCode === 403) {
                errorMessage = "You do not have permission to perform this action.";
            } else if (statusCode === 404) {
                errorMessage = "Resource not found.";
            } else if (statusCode >= 500) {
                errorMessage = "Internal server error. Please try again later.";
            } else if (errorMessage === "Failed to fetch") {
                errorMessage = "Failed to connect to the server.";
            }

            throw new ApiClientError(errorMessage, statusCode, details);
        }

        // Handle Success Toast
        if (successMessage) {
            toast({
                variant: "success", // Uses the new green variant
                title: "Success",
                description: successMessage,
            } as any);
        }

        // Normalize Response Data
        // Expects standard { data: ... } or raw JSON
        const responseData = await response.json();
        return (responseData.data !== undefined ? responseData.data : responseData) as T;

    } catch (error: any) {
        // Final normalization for network errors or unexpected throws
        let message = error.message || "An unexpected error occurred.";

        if (message === "Failed to fetch" || message.includes("NetworkError") || message.includes("connection refused")) {
            message = "Network connection failed. Please check your internet.";
        }

        // Handle Error Toast
        if (!skipErrorToast) {
            // Prevent duplicate toasts if called rapidly? (Toast hook handles limit=1 usually)
            toast({
                variant: "destructive", // Red toast
                title: "Error",
                description: message,
            });
        }

        // Re-throw to allow component-level loading state updates
        throw error;
    }
};
