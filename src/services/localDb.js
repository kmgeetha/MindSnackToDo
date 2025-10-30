// src/services/localDb.js
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔹 Global variable to store the opened database instance
let db;

export const initLocalDb = async () => {
    if (!db) {
        // For SDK 54, use openDatabaseAsync if available
        if (SQLite.openDatabaseAsync) {
            db = await SQLite.openDatabaseAsync('todos.db');
        } else {
            // fallback for classic API
            db = SQLite.openDatabase('todos.db');
        }
    }

    // Create tables
    db.exec?.([{
        sql: `
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      name TEXT,
      created_at INTEGER
    );
  `, args: []
    },
    {
        sql: `
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      title TEXT,
      description TEXT,
      is_completed INTEGER,
      group_id TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
  `, args: []
    }], false, () => { });
};

// 🔸 Helper function to ensure DB is ready
const ensureDb = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('todos.db');
    }
    return db;
};

// 🔸 Execute a SQL command and return results
export const runSql = async (sql, params = []) => {
    const database = await ensureDb();
    const statement = await database.prepareAsync(sql);
    const result = await statement.executeAsync(...params);
    await statement.finalizeAsync();
    return result;
};

// 🔸 Insert or update a todo record
export const upsertLocalTodo = async (todo) => {
    const isCompletedBool =
        todo.is_completed === true ||
        todo.is_completed === 'true' ||
        todo.is_completed === 1;
    const isCompletedInt = isCompletedBool ? 1 : 0;

    const {
        id,
        user_id,
        title,
        description = '',
        group_id = null,
        created_at,
        updated_at,
    } = todo;

    await runSql(
        `INSERT OR REPLACE INTO todos
     (id, user_id, title, description, is_completed, group_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            id,
            user_id,
            title,
            description,
            isCompletedInt,
            group_id,
            created_at,
            updated_at,
        ]
    );
};

// 🔸 Fetch todos for a specific user
export const fetchLocalTodosByUser = async (user_id) => {
    const database = await ensureDb();
    const todos = await database.getAllAsync('SELECT * FROM todos WHERE user_id = ?;', [user_id]);

    return todos.map((r) => ({
        ...r,
        is_completed:
            r.is_completed === true ||
            r.is_completed === 'true' ||
            r.is_completed === 1,
        created_at: Number(r.created_at) || Date.now(),
        updated_at: Number(r.updated_at) || Date.now(),
    }));
};

// 🔸 Delete a todo
export const deleteLocalTodo = async (id) => {
    await runSql('DELETE FROM todos WHERE id = ?;', [id]);
};

// 🔸 Queue offline changes in AsyncStorage
export const queueChange = async (change) => {
    const qRaw = await AsyncStorage.getItem('sync_queue');
    const q = qRaw ? JSON.parse(qRaw) : [];
    q.push(change);
    await AsyncStorage.setItem('sync_queue', JSON.stringify(q));
};

// 🔸 Retrieve queued offline changes
export const getQueue = async () => {
    const qRaw = await AsyncStorage.getItem('sync_queue');
    return qRaw ? JSON.parse(qRaw) : [];
};

// 🔸 Replace the entire sync queue (after successful sync)
export const setQueue = async (q) => {
    await AsyncStorage.setItem('sync_queue', JSON.stringify(q));
};
