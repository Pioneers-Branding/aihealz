import prisma from './db';
import { Prisma } from '@prisma/client';

/**
 * Database Utilities
 * Helper functions for optimized database operations
 */

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Execute multiple operations in a single transaction
 */
export async function batchTransaction<T>(
    operations: Prisma.PrismaPromise<T>[]
): Promise<T[]> {
    return prisma.$transaction(operations);
}

/**
 * Batch upsert records (create or update)
 * More efficient than individual upserts in a loop
 */
export async function batchUpsert<T extends { id?: number | string }>(
    model: keyof typeof prisma,
    records: T[],
    uniqueField: string
): Promise<number> {
    const prismaModel = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any)[model] as {
        upsert: (args: unknown) => Promise<unknown>;
    };

    const operations = records.map((record) =>
        prismaModel.upsert({
            where: { [uniqueField]: record[uniqueField as keyof T] },
            create: record,
            update: record,
        })
    );

    const results = await prisma.$transaction(operations as Prisma.PrismaPromise<unknown>[]);
    return results.length;
}

/**
 * Batch delete records by IDs
 */
export async function batchDelete(
    model: 'medicalCondition' | 'doctorProvider' | 'localizedContent',
    ids: number[]
): Promise<number> {
    if (ids.length === 0) return 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaModel = (prisma as any)[model];
    const result = await prismaModel.deleteMany({
        where: { id: { in: ids } },
    });

    return result.count;
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

interface PaginationParams {
    page?: number;
    pageSize?: number;
    maxPageSize?: number;
}

interface PaginationResult {
    skip: number;
    take: number;
    page: number;
    pageSize: number;
}

/**
 * Calculate pagination parameters
 */
export function getPagination({
    page = 1,
    pageSize = 20,
    maxPageSize = 100,
}: PaginationParams): PaginationResult {
    const safePage = Math.max(1, page);
    const safePageSize = Math.min(maxPageSize, Math.max(1, pageSize));

    return {
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
        page: safePage,
        pageSize: safePageSize,
    };
}

/**
 * Create paginated response with metadata
 */
export function paginatedResponse<T>(
    data: T[],
    total: number,
    { page, pageSize }: PaginationResult
) {
    return {
        data,
        meta: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
            hasMore: page * pageSize < total,
        },
    };
}

// ============================================================================
// QUERY OPTIMIZATION HELPERS
// ============================================================================

/**
 * Select only needed fields to reduce data transfer
 */
export function selectFields<T extends string>(fields: T[]): Record<T, true> {
    return fields.reduce(
        (acc, field) => {
            acc[field] = true;
            return acc;
        },
        {} as Record<T, true>
    );
}

/**
 * Build a where clause from optional filters
 */
export function buildWhere<T extends Record<string, unknown>>(
    filters: Partial<T>
): Prisma.JsonObject {
    const where: Prisma.JsonObject = {};

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'string' && !key.endsWith('Id')) {
                // Text search - case insensitive contains
                where[key] = { contains: value, mode: 'insensitive' };
            } else {
                where[key] = value as Prisma.JsonValue;
            }
        }
    }

    return where;
}

// ============================================================================
// CACHING HELPERS (for frequently accessed data)
// ============================================================================

const cache = new Map<string, { data: unknown; expires: number }>();

/**
 * Simple in-memory cache with TTL
 */
export async function cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttlSeconds = 60
): Promise<T> {
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && cached.expires > now) {
        return cached.data as T;
    }

    const data = await queryFn();
    cache.set(key, { data, expires: now + ttlSeconds * 1000 });

    return data;
}

/**
 * Invalidate cache entries by prefix
 */
export function invalidateCache(prefix: string): void {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
            cache.delete(key);
        }
    }
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
    cache.clear();
}

// ============================================================================
// AGGREGATION HELPERS
// ============================================================================

/**
 * Get counts for multiple conditions in a single query
 */
export async function getCounts(
    model: 'medicalCondition' | 'doctorProvider' | 'localizedContent' | 'leadLog',
    groupByField: string,
    where?: Prisma.JsonObject
): Promise<Map<string, number>> {
    const prismaModel = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any)[model] as {
        groupBy: (args: unknown) => Promise<Array<{ [key: string]: unknown; _count: { id: number } }>>;
    };

    const results = await prismaModel.groupBy({
        by: [groupByField],
        where,
        _count: { id: true },
    });

    return new Map(results.map((r) => [String(r[groupByField]), r._count.id]));
}

// ============================================================================
// RELATION LOADING HELPERS
// ============================================================================

interface LoadRelationOptions {
    where?: Prisma.JsonObject;
    select?: Record<string, boolean>;
    take?: number;
}

/**
 * Load related records in a single batch query instead of N+1 queries
 *
 * Instead of:
 *   doctors.map(async d => await prisma.specialty.findMany({ where: { doctorId: d.id } }))
 *
 * Use:
 *   const specialtiesByDoctor = await loadRelatedRecords('doctorSpecialty', doctors.map(d => d.id), 'doctorId');
 */
export async function loadRelatedRecords<T>(
    model: keyof typeof prisma,
    parentIds: (number | string)[],
    foreignKey: string,
    options: LoadRelationOptions = {}
): Promise<Map<number | string, T[]>> {
    if (parentIds.length === 0) return new Map();

    const prismaModel = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any)[model] as {
        findMany: (args: unknown) => Promise<T[]>;
    };

    const records = await prismaModel.findMany({
        where: {
            [foreignKey]: { in: parentIds },
            ...options.where,
        },
        select: options.select,
        take: options.take,
    });

    // Group by parent ID
    const grouped = new Map<number | string, T[]>();
    for (const id of parentIds) {
        grouped.set(id, []);
    }

    for (const record of records) {
        const parentId = (record as Record<string, unknown>)[foreignKey] as number | string;
        const existing = grouped.get(parentId) || [];
        existing.push(record);
        grouped.set(parentId, existing);
    }

    return grouped;
}

// ============================================================================
// BULK INSERT HELPERS
// ============================================================================

/**
 * Chunk array into smaller batches for bulk operations
 */
export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Bulk insert with chunking to avoid memory issues
 */
export async function bulkInsert(
    model: 'medicalCondition' | 'doctorProvider' | 'localizedContent',
    records: unknown[],
    chunkSize = 100
): Promise<number> {
    let totalInserted = 0;

    for (const batch of chunk(records, chunkSize)) {
        const prismaModel = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any)[model] as {
            createMany: (args: { data: unknown[]; skipDuplicates?: boolean }) => Promise<{ count: number }>;
        };

        const result = await prismaModel.createMany({
            data: batch,
            skipDuplicates: true,
        });

        totalInserted += result.count;
    }

    return totalInserted;
}

// ============================================================================
// SOFT DELETE HELPERS
// ============================================================================

/**
 * Soft delete - set isActive to false instead of actual delete
 */
export async function softDelete(
    model: 'medicalCondition' | 'doctorProvider' | 'diagnosticProvider',
    id: number
): Promise<boolean> {
    const prismaModel = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any)[model] as {
        update: (args: { where: { id: number }; data: { isActive: boolean } }) => Promise<unknown>;
    };

    try {
        await prismaModel.update({
            where: { id },
            data: { isActive: false },
        });
        return true;
    } catch {
        return false;
    }
}

/**
 * Restore soft-deleted record
 */
export async function restore(
    model: 'medicalCondition' | 'doctorProvider' | 'diagnosticProvider',
    id: number
): Promise<boolean> {
    const prismaModel = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any)[model] as {
        update: (args: { where: { id: number }; data: { isActive: boolean } }) => Promise<unknown>;
    };

    try {
        await prismaModel.update({
            where: { id },
            data: { isActive: true },
        });
        return true;
    } catch {
        return false;
    }
}
