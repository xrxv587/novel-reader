const DB_NAME = 'novel_reader.db';
let dbInstance: any = null;
let isInit = false;

const SQL_CREATE_BOOKS = `
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  source_type TEXT NOT NULL,
  file_path TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  source_id INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 0,
  total_size INTEGER DEFAULT 0,
  last_read_chapter INTEGER DEFAULT 0,
  last_read_position INTEGER DEFAULT 0,
  cover_image TEXT DEFAULT '',
  encoding TEXT DEFAULT 'utf-8',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const SQL_CREATE_CHAPTERS = `
CREATE TABLE IF NOT EXISTS chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  chapter_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_offset INTEGER NOT NULL DEFAULT 0,
  end_offset INTEGER NOT NULL DEFAULT 0,
  content_url TEXT DEFAULT '',
  content TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  UNIQUE(book_id, chapter_index)
)
`;

const SQL_CREATE_BOOKMARKS = `
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  chapter_index INTEGER NOT NULL,
  position INTEGER NOT NULL,
  title TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const SQL_CREATE_BOOK_SOURCES = `
CREATE TABLE IF NOT EXISTS book_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  selectors TEXT NOT NULL,
  charset TEXT DEFAULT 'UTF-8',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const SQL_CREATE_SETTINGS = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
)
`;

export function openDB(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    
    // #ifdef APP-PLUS
    plus.sqlite.openDatabase({
      name: DB_NAME,
      path: `_doc/${DB_NAME}`,
      success: () => {
        dbInstance = { name: DB_NAME };
        resolve(dbInstance);
      },
      fail: (err: any) => reject(err)
    });
    // #endif
    
    // #ifndef APP-PLUS
    const mockDB = {
      name: DB_NAME,
      data: {
        books: [],
        chapters: [],
        bookmarks: [],
        book_sources: [],
        settings: {}
      }
    };
    dbInstance = mockDB;
    resolve(dbInstance);
    // #endif
  });
}

export function executeSql(sql: string, params?: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    openDB().then(() => {
      // #ifdef APP-PLUS
      plus.sqlite.selectSql({
        name: DB_NAME,
        sql: sql,
        success: (res: any) => resolve(res),
        fail: (err: any) => {
          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            reject(err);
          } else {
            plus.sqlite.executeSql({
              name: DB_NAME,
              sql: sql,
              success: () => resolve(null),
              fail: (e: any) => reject(e)
            });
          }
        }
      });
      // #endif
      
      // #ifndef APP-PLUS
      resolve(mockExecute(sql, params));
      // #endif
    }).catch(reject);
  });
}

function mockExecute(sql: string, params?: any[]): any[] {
  const db = (dbInstance as any).data;
  const sqlUpper = sql.trim().toUpperCase();
  
  if (sqlUpper.startsWith('CREATE TABLE')) {
    return [];
  }
  
  if (sqlUpper.startsWith('INSERT INTO')) {
    const tableMatch = sql.match(/INSERT INTO (\w+)/i);
    if (tableMatch) {
      const table = tableMatch[1] as keyof typeof db;
      const id = (db[table] as any[]).length + 1;
      return [{ insertId: id }];
    }
    return [];
  }
  
  if (sqlUpper.startsWith('SELECT')) {
    const tableMatch = sql.match(/FROM (\w+)/i);
    if (tableMatch) {
      const table = tableMatch[1] as keyof typeof db;
      if (table === 'settings') {
        const result: any[] = [];
        for (const key in db.settings) {
          result.push({ key, value: (db.settings as any)[key] });
        }
        return result;
      }
      return (db[table] as any[]) || [];
    }
    return [];
  }
  
  if (sqlUpper.startsWith('UPDATE')) {
    return [];
  }
  
  if (sqlUpper.startsWith('DELETE')) {
    return [];
  }
  
  return [];
}

export function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isInit) {
      resolve();
      return;
    }
    
    openDB().then(() => {
      const createTables = async () => {
        try {
          await executeSql(SQL_CREATE_BOOKS);
          await executeSql(SQL_CREATE_CHAPTERS);
          await executeSql(SQL_CREATE_BOOKMARKS);
          await executeSql(SQL_CREATE_BOOK_SOURCES);
          await executeSql(SQL_CREATE_SETTINGS);
          isInit = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      createTables();
    }).catch(reject);
  });
}

export default {
  openDB,
  executeSql,
  initDB
};
