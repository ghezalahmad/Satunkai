import * as SQLite from 'expo-sqlite';
import { Download, DownloadStatus } from '../types';

const DATABASE_NAME = 'afgdown.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 */
export async function initDatabase(): Promise<void> {
    try {
        db = await SQLite.openDatabaseAsync(DATABASE_NAME);

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS downloads (
        id TEXT PRIMARY KEY NOT NULL,
        url TEXT NOT NULL,
        filename TEXT NOT NULL,
        localPath TEXT NOT NULL,
        size INTEGER DEFAULT 0,
        downloadedSize INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        progress REAL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        completedAt INTEGER,
        error TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status);
      CREATE INDEX IF NOT EXISTS idx_downloads_createdAt ON downloads(createdAt);
    `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}

/**
 * Get the database instance, initializing if needed
 */
async function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!db) {
        await initDatabase();
    }
    return db!;
}

/**
 * Insert a new download record
 */
export async function insertDownload(download: Download): Promise<void> {
    const database = await getDb();

    await database.runAsync(
        `INSERT INTO downloads (id, url, filename, localPath, size, downloadedSize, status, progress, createdAt, completedAt, error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            download.id,
            download.url,
            download.filename,
            download.localPath,
            download.size,
            download.downloadedSize,
            download.status,
            download.progress,
            download.createdAt,
            download.completedAt || null,
            download.error || null,
        ]
    );
}

/**
 * Update a download record
 */
export async function updateDownload(download: Partial<Download> & { id: string }): Promise<void> {
    const database = await getDb();

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (download.status !== undefined) {
        fields.push('status = ?');
        values.push(download.status);
    }
    if (download.progress !== undefined) {
        fields.push('progress = ?');
        values.push(download.progress);
    }
    if (download.downloadedSize !== undefined) {
        fields.push('downloadedSize = ?');
        values.push(download.downloadedSize);
    }
    if (download.size !== undefined) {
        fields.push('size = ?');
        values.push(download.size);
    }
    if (download.completedAt !== undefined) {
        fields.push('completedAt = ?');
        values.push(download.completedAt);
    }
    if (download.error !== undefined) {
        fields.push('error = ?');
        values.push(download.error || null);
    }
    if (download.localPath !== undefined) {
        fields.push('localPath = ?');
        values.push(download.localPath);
    }

    if (fields.length === 0) return;

    values.push(download.id);

    await database.runAsync(
        `UPDATE downloads SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
}

/**
 * Get all downloads, ordered by creation date (newest first)
 */
export async function getAllDownloads(): Promise<Download[]> {
    const database = await getDb();

    const results = await database.getAllAsync<Download>(
        'SELECT * FROM downloads ORDER BY createdAt DESC'
    );

    return results;
}

/**
 * Get downloads by status
 */
export async function getDownloadsByStatus(status: DownloadStatus): Promise<Download[]> {
    const database = await getDb();

    const results = await database.getAllAsync<Download>(
        'SELECT * FROM downloads WHERE status = ? ORDER BY createdAt DESC',
        [status]
    );

    return results;
}

/**
 * Get a single download by ID
 */
export async function getDownloadById(id: string): Promise<Download | null> {
    const database = await getDb();

    const result = await database.getFirstAsync<Download>(
        'SELECT * FROM downloads WHERE id = ?',
        [id]
    );

    return result || null;
}

/**
 * Delete a download record
 */
export async function deleteDownload(id: string): Promise<void> {
    const database = await getDb();

    await database.runAsync('DELETE FROM downloads WHERE id = ?', [id]);
}

/**
 * Search downloads by filename
 */
export async function searchDownloads(query: string): Promise<Download[]> {
    const database = await getDb();

    const results = await database.getAllAsync<Download>(
        'SELECT * FROM downloads WHERE filename LIKE ? ORDER BY createdAt DESC',
        [`%${query}%`]
    );

    return results;
}

/**
 * Get download statistics
 */
export async function getDownloadStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    totalSize: number;
}> {
    const database = await getDb();

    const stats = await database.getFirstAsync<{
        total: number;
        completed: number;
        failed: number;
        totalSize: number;
    }>(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN size ELSE 0 END), 0) as totalSize
    FROM downloads
  `);

    return stats || { total: 0, completed: 0, failed: 0, totalSize: 0 };
}
