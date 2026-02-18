import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongo, getMongoDb, isMongoEnabled } from './mongoService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const FILES = {
  users: 'users.json',
  jobs: 'jobs.json',
  savedJobs: 'savedJobs.json',
  applications: 'applications.json',
};

const writeLocks = new Map();

const ensureDataDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const getFilePath = (table) => path.join(DATA_DIR, FILES[table]);

const withWriteLock = async (table, operation) => {
  const previous = writeLocks.get(table) || Promise.resolve();
  const current = previous.then(operation, operation);
  writeLocks.set(table, current.catch(() => {}));
  return current;
};

const readTableFromMongo = async (table) => {
  await connectMongo();
  const db = getMongoDb();
  return db.collection(table).find({}, { projection: { _id: 0 } }).toArray();
};

const writeTableToMongo = async (table, rows) => {
  await connectMongo();
  const db = getMongoDb();
  const collection = db.collection(table);
  const safeRows = Array.isArray(rows) ? rows : [];
  await collection.deleteMany({});
  if (safeRows.length) {
    await collection.insertMany(safeRows, { ordered: false });
  }
};

const ensureTableFile = async (table) => {
  await ensureDataDir();
  const filePath = getFilePath(table);
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
  return filePath;
};

export const readTable = async (table) => {
  if (isMongoEnabled()) {
    return readTableFromMongo(table);
  }

  const filePath = await ensureTableFile(table);
  const raw = await fs.readFile(filePath, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTableUnlocked = async (table, rows) => {
  if (isMongoEnabled()) {
    await writeTableToMongo(table, rows);
    return;
  }

  const filePath = await ensureTableFile(table);
  const safeRows = Array.isArray(rows) ? rows : [];
  await fs.writeFile(filePath, JSON.stringify(safeRows, null, 2), 'utf-8');
};

export const writeTable = async (table, rows) => {
  return withWriteLock(table, async () => {
    await writeTableUnlocked(table, rows);
  });
};

export const upsertTable = async (table, updater) => {
  return withWriteLock(table, async () => {
    const rows = await readTable(table);
    const nextRows = await updater(rows);
    await writeTableUnlocked(table, nextRows);
    return nextRows;
  });
};

export const TABLES = FILES;
