const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_BASE_URL is not defined!");
}

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export interface ApiError {
    success: false;
    statusCode: number;
    message: string;
    details?: any;
}

class ApiClientError extends Error {
    public statusCode: number;
    public details?: any;

    constructor(message: string, statusCode: number, details?: any) {
        super(message);
        this.name = "ApiClientError";
        this.statusCode = statusCode;
        this.details = details;
    }
}

export const apiClient = async <T>(
    endpoint: string,
    { params, ...options }: RequestOptions = {}
): Promise<T> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    try {
        const response = await fetch(url.toString(), {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            let errorData: ApiError;
            try {
                errorData = await response.json();
            } catch (e) {
                // Fallback if JSON parsing fails
                throw new ApiClientError(
                    `Request failed with status ${response.status}`,
                    response.status
                );
            }

            // Handle 401 specifically
            if (response.status === 401) {
                console.error("Unauthorized access. Redirecting to login...");
                // In a real app, trigger logout or redirect
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }

            throw new ApiClientError(
                errorData.message || "An unknown error occurred",
                response.status,
                errorData.details
            );
        }

        // Assume standardized success response: { success: true, data: T }
        // If backend returns raw data, adjust here.
        const responseData = await response.json();
        return responseData.data || responseData;

    } catch (error) {
        if (error instanceof ApiClientError) {
            throw error;
        }
        // Handle network errors
        throw new ApiClientError(
            error instanceof Error ? error.message : "Network Error",
            0
        );
    }
};
