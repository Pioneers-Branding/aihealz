import { z } from 'zod';

/**
 * Form Validation Utilities
 * Reusable Zod schemas and validation helpers
 */

// ============================================================================
// BASE VALIDATORS
// ============================================================================

/**
 * Email validation
 */
export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long');

/**
 * Password validation with strength requirements
 */
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Simple password (no strength requirements)
 */
export const simplePasswordSchema = z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long');

/**
 * Phone number validation (international format)
 */
export const phoneSchema = z
    .string()
    .min(10, 'Phone number is too short')
    .max(15, 'Phone number is too long')
    .regex(
        /^\+?[1-9]\d{9,14}$/,
        'Please enter a valid phone number (e.g., +91XXXXXXXXXX)'
    );

/**
 * Indian phone number
 */
export const indianPhoneSchema = z
    .string()
    .regex(
        /^(\+91)?[6-9]\d{9}$/,
        'Please enter a valid Indian phone number'
    );

/**
 * Name validation
 */
export const nameSchema = z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters');

/**
 * URL validation
 */
export const urlSchema = z
    .string()
    .url('Please enter a valid URL')
    .max(2000, 'URL is too long');

/**
 * Optional URL
 */
export const optionalUrlSchema = z
    .string()
    .url('Please enter a valid URL')
    .max(2000, 'URL is too long')
    .optional()
    .or(z.literal(''));

/**
 * Slug validation (URL-friendly string)
 */
export const slugSchema = z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(200, 'Slug is too long')
    .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug can only contain lowercase letters, numbers, and hyphens'
    );

/**
 * Date validation
 */
export const dateSchema = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date');

/**
 * Future date validation
 */
export const futureDateSchema = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date')
    .refine(
        (val) => new Date(val) > new Date(),
        'Date must be in the future'
    );

/**
 * Past date validation
 */
export const pastDateSchema = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date')
    .refine(
        (val) => new Date(val) < new Date(),
        'Date must be in the past'
    );

/**
 * Positive number
 */
export const positiveNumberSchema = z
    .number()
    .positive('Must be a positive number');

/**
 * Non-negative number
 */
export const nonNegativeNumberSchema = z
    .number()
    .min(0, 'Cannot be negative');

/**
 * Percentage (0-100)
 */
export const percentageSchema = z
    .number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage cannot exceed 100');

/**
 * Rating (1-5)
 */
export const ratingSchema = z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5');

// ============================================================================
// MEDICAL DOMAIN VALIDATORS
// ============================================================================

/**
 * ICD-10 code validation
 */
export const icd10Schema = z
    .string()
    .regex(
        /^[A-Z]\d{2}(\.\d{1,4})?$/,
        'Please enter a valid ICD-10 code (e.g., E11.9)'
    );

/**
 * Medical license number (generic)
 */
export const medicalLicenseSchema = z
    .string()
    .min(4, 'License number is too short')
    .max(50, 'License number is too long')
    .regex(
        /^[A-Z0-9\-\/]+$/i,
        'License number contains invalid characters'
    );

/**
 * Indian Medical Council registration
 */
export const imcRegistrationSchema = z
    .string()
    .regex(
        /^[A-Z]{2,3}\d{4,8}$/i,
        'Please enter a valid Medical Council registration number'
    );

/**
 * Years of experience
 */
export const experienceSchema = z
    .number()
    .int('Experience must be a whole number')
    .min(0, 'Experience cannot be negative')
    .max(70, 'Experience seems too high');

/**
 * Consultation fee
 */
export const consultationFeeSchema = z
    .number()
    .min(0, 'Fee cannot be negative')
    .max(100000, 'Fee seems too high');

// ============================================================================
// ADDRESS VALIDATORS
// ============================================================================

/**
 * Pincode (Indian)
 */
export const pincodeSchema = z
    .string()
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode');

/**
 * ZIP code (US)
 */
export const zipCodeSchema = z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code');

/**
 * Address line
 */
export const addressLineSchema = z
    .string()
    .min(5, 'Address is too short')
    .max(200, 'Address is too long');

// ============================================================================
// COMPOSITE SCHEMAS
// ============================================================================

/**
 * Login form schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
});

/**
 * Registration form schema
 */
export const registrationSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

/**
 * Contact form schema
 */
export const contactSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema.optional(),
    subject: z.string().min(3, 'Subject is too short').max(200, 'Subject is too long'),
    message: z.string().min(10, 'Message is too short').max(5000, 'Message is too long'),
});

/**
 * Doctor profile schema
 */
export const doctorProfileSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    specialization: z.string().min(2, 'Specialization is required'),
    qualification: z.string().min(2, 'Qualification is required'),
    experience: experienceSchema,
    registrationNumber: medicalLicenseSchema,
    consultationFee: consultationFeeSchema.optional(),
    bio: z.string().max(2000, 'Bio is too long').optional(),
    address: addressLineSchema.optional(),
    city: z.string().min(2, 'City is required').max(100),
    pincode: pincodeSchema.optional(),
});

/**
 * Appointment booking schema
 */
export const appointmentSchema = z.object({
    patientName: nameSchema,
    patientEmail: emailSchema,
    patientPhone: phoneSchema,
    doctorId: z.number().int().positive(),
    appointmentDate: futureDateSchema,
    appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    reason: z.string().min(5, 'Please provide a reason').max(500),
    notes: z.string().max(1000).optional(),
});

/**
 * Lead/enquiry form schema
 */
export const leadSchema = z.object({
    name: nameSchema,
    email: emailSchema.optional(),
    phone: phoneSchema,
    condition: z.string().min(2, 'Please specify the condition'),
    message: z.string().max(1000).optional(),
    preferredTime: z.string().optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate data against a schema and return errors
 */
export function validateForm<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
            errors[path] = err.message;
        }
    });

    return { success: false, errors };
}

/**
 * Get first error for a field
 */
export function getFieldError(
    errors: z.ZodError | null,
    field: string
): string | undefined {
    if (!errors) return undefined;

    const fieldError = errors.issues.find(
        (err) => err.path.join('.') === field
    );

    return fieldError?.message;
}

/**
 * Transform Zod errors to field-message map
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};

    error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
            errors[path] = err.message;
        }
    });

    return errors;
}

/**
 * Create a partial schema (all fields optional)
 */
export function makePartial<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>
): z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }> {
    return schema.partial() as z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }>;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type LeadFormData = z.infer<typeof leadSchema>;
