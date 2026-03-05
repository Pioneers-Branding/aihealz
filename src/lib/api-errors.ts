import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

/**
 * Standardized API Error Codes
 * Use these codes for consistent error handling across the API
 */
export const ErrorCodes = {
    // Validation errors (400)
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_FIELD: 'MISSING_FIELD',
    INVALID_FORMAT: 'INVALID_FORMAT',

    // Authentication errors (401)
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

    // Authorization errors (403)
    FORBIDDEN: 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',

    // Not found errors (404)
    NOT_FOUND: 'NOT_FOUND',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    DOCTOR_NOT_FOUND: 'DOCTOR_NOT_FOUND',
    CONDITION_NOT_FOUND: 'CONDITION_NOT_FOUND',

    // Conflict errors (409)
    CONFLICT: 'CONFLICT',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

    // Rate limiting (429)
    RATE_LIMITED: 'RATE_LIMITED',
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

    // Server errors (500)
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

    // Service unavailable (503)
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    MAINTENANCE: 'MAINTENANCE',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
    error: {
        code: ErrorCode;
        message: string;
        details?: Record<string, unknown>;
        field?: string;
        timestamp: string;
        requestId?: string;
    };
}

/**
 * Standard API success response structure
 */
export interface ApiSuccessResponse<T> {
    data: T;
    meta?: {
        page?: number;
        pageSize?: number;
        total?: number;
        totalPages?: number;
    };
}

/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
    constructor(
        public code: ErrorCode,
        message: string,
        public statusCode: number = 500,
        public details?: Record<string, unknown>,
        public field?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }

    toResponse(): NextResponse<ApiErrorResponse> {
        return NextResponse.json(
            {
                error: {
                    code: this.code,
                    message: this.message,
                    details: this.details,
                    field: this.field,
                    timestamp: new Date().toISOString(),
                },
            },
            { status: this.statusCode }
        );
    }
}

// Pre-defined error factories
export const Errors = {
    // 400 Bad Request
    validation: (message: string, field?: string, details?: Record<string, unknown>) =>
        new ApiError(ErrorCodes.VALIDATION_ERROR, message, 400, details, field),

    invalidInput: (field: string, expected?: string) =>
        new ApiError(
            ErrorCodes.INVALID_INPUT,
            `Invalid value for '${field}'${expected ? `. Expected: ${expected}` : ''}`,
            400,
            undefined,
            field
        ),

    missingField: (field: string) =>
        new ApiError(ErrorCodes.MISSING_FIELD, `Missing required field: ${field}`, 400, undefined, field),

    invalidFormat: (field: string, format: string) =>
        new ApiError(ErrorCodes.INVALID_FORMAT, `Invalid format for '${field}'. Expected: ${format}`, 400, undefined, field),

    // 401 Unauthorized
    unauthorized: (message = 'Authentication required') =>
        new ApiError(ErrorCodes.UNAUTHORIZED, message, 401),

    invalidToken: (message = 'Invalid or malformed token') =>
        new ApiError(ErrorCodes.INVALID_TOKEN, message, 401),

    tokenExpired: () =>
        new ApiError(ErrorCodes.TOKEN_EXPIRED, 'Token has expired', 401),

    invalidCredentials: () =>
        new ApiError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password', 401),

    // 403 Forbidden
    forbidden: (message = 'Access denied') =>
        new ApiError(ErrorCodes.FORBIDDEN, message, 403),

    insufficientPermissions: (action: string) =>
        new ApiError(ErrorCodes.INSUFFICIENT_PERMISSIONS, `Insufficient permissions to ${action}`, 403),

    subscriptionRequired: (tier: string) =>
        new ApiError(ErrorCodes.SUBSCRIPTION_REQUIRED, `${tier} subscription required for this feature`, 403),

    // 404 Not Found
    notFound: (resource: string) =>
        new ApiError(ErrorCodes.NOT_FOUND, `${resource} not found`, 404),

    doctorNotFound: (identifier?: string) =>
        new ApiError(ErrorCodes.DOCTOR_NOT_FOUND, identifier ? `Doctor '${identifier}' not found` : 'Doctor not found', 404),

    conditionNotFound: (slug?: string) =>
        new ApiError(ErrorCodes.CONDITION_NOT_FOUND, slug ? `Condition '${slug}' not found` : 'Condition not found', 404),

    // 409 Conflict
    conflict: (message: string) =>
        new ApiError(ErrorCodes.CONFLICT, message, 409),

    alreadyExists: (resource: string, identifier?: string) =>
        new ApiError(ErrorCodes.ALREADY_EXISTS, `${resource}${identifier ? ` '${identifier}'` : ''} already exists`, 409),

    duplicateEntry: (field: string, value: string) =>
        new ApiError(ErrorCodes.DUPLICATE_ENTRY, `A record with ${field} '${value}' already exists`, 409, undefined, field),

    // 429 Too Many Requests
    rateLimited: (retryAfter?: number) =>
        new ApiError(
            ErrorCodes.RATE_LIMITED,
            'Too many requests. Please try again later.',
            429,
            retryAfter ? { retryAfter } : undefined
        ),

    // 500 Internal Server Error
    internal: (message = 'An unexpected error occurred') =>
        new ApiError(ErrorCodes.INTERNAL_ERROR, message, 500),

    database: (operation?: string) =>
        new ApiError(ErrorCodes.DATABASE_ERROR, `Database ${operation || 'operation'} failed`, 500),

    externalService: (service: string) =>
        new ApiError(ErrorCodes.EXTERNAL_SERVICE_ERROR, `External service '${service}' is unavailable`, 500),

    // 503 Service Unavailable
    serviceUnavailable: (message = 'Service temporarily unavailable') =>
        new ApiError(ErrorCodes.SERVICE_UNAVAILABLE, message, 503),

    maintenance: () =>
        new ApiError(ErrorCodes.MAINTENANCE, 'Service is under maintenance', 503),
};

/**
 * Validate request body against a Zod schema
 * Throws ApiError with detailed validation errors
 */
export function validateBody<T>(body: unknown, schema: ZodSchema<T>): T {
    const result = schema.safeParse(body);
    if (!result.success) {
        const issues = result.error.issues;
        const firstError = issues[0];
        throw new ApiError(
            ErrorCodes.VALIDATION_ERROR,
            firstError.message,
            400,
            {
                errors: issues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                    code: e.code,
                })),
            },
            firstError.path.join('.')
        );
    }
    return result.data;
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(searchParams: URLSearchParams, schema: ZodSchema<T>): T {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return validateBody(params, schema);
}

/**
 * Parse and validate a numeric ID parameter
 */
export function parseId(value: string | undefined | null, paramName = 'id'): number {
    if (!value) {
        throw Errors.missingField(paramName);
    }
    const id = parseInt(value, 10);
    if (isNaN(id) || id < 1) {
        throw Errors.invalidInput(paramName, 'positive integer');
    }
    return id;
}

/**
 * Parse and validate pagination parameters
 */
export function parsePagination(
    searchParams: URLSearchParams,
    defaults: { page?: number; pageSize?: number; maxPageSize?: number } = {}
): { page: number; pageSize: number; skip: number; take: number } {
    const { page: defaultPage = 1, pageSize: defaultPageSize = 20, maxPageSize = 100 } = defaults;

    const page = Math.max(1, parseInt(searchParams.get('page') || String(defaultPage), 10));
    const requestedSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || String(defaultPageSize), 10);
    const pageSize = Math.min(maxPageSize, Math.max(1, requestedSize));

    return {
        page,
        pageSize,
        skip: (page - 1) * pageSize,
        take: pageSize,
    };
}

/**
 * Wrap an async API handler with error handling
 */
export function withErrorHandling<T>(
    handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
    return handler().catch((error: unknown) => {
        // Handle ApiError
        if (error instanceof ApiError) {
            return error.toResponse();
        }

        // Handle Zod validation errors
        if (error instanceof ZodError) {
            const firstError = error.issues[0];
            return new ApiError(
                ErrorCodes.VALIDATION_ERROR,
                firstError.message,
                400,
                {
                    errors: error.issues.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                }
            ).toResponse();
        }

        // Handle Prisma errors
        if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
            const prismaError = error as Error & { code: string; meta?: { target?: string[] } };
            switch (prismaError.code) {
                case 'P2002': // Unique constraint violation
                    return new ApiError(
                        ErrorCodes.DUPLICATE_ENTRY,
                        'A record with this value already exists',
                        409,
                        { fields: prismaError.meta?.target }
                    ).toResponse();
                case 'P2025': // Record not found
                    return Errors.notFound('Resource').toResponse();
                default:
                    return Errors.database().toResponse();
            }
        }

        // Log unexpected errors
        console.error('Unhandled API error:', error);

        // Return generic error for unknown errors
        return Errors.internal().toResponse();
    });
}

/**
 * Create a success response with optional pagination metadata
 */
export function success<T>(
    data: T,
    statusOrMeta?: number | ApiSuccessResponse<T>['meta'],
    meta?: ApiSuccessResponse<T>['meta']
): NextResponse<ApiSuccessResponse<T>> {
    const status = typeof statusOrMeta === 'number' ? statusOrMeta : 200;
    const responseMeta = typeof statusOrMeta === 'number' ? meta : statusOrMeta;
    return NextResponse.json({ data, meta: responseMeta }, { status });
}

/**
 * Create a paginated success response
 */
export function paginated<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number
): NextResponse<ApiSuccessResponse<T[]>> {
    return NextResponse.json({
        data,
        meta: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        },
    });
}

/**
 * Assert a condition or throw an error
 */
export function assert(condition: boolean, error: ApiError): asserts condition {
    if (!condition) {
        throw error;
    }
}

/**
 * Assert that a value exists (is not null/undefined) or throw NotFound
 */
export function assertExists<T>(value: T | null | undefined, resource: string): asserts value is T {
    if (value === null || value === undefined) {
        throw Errors.notFound(resource);
    }
}
