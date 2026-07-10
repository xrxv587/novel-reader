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

  // INSERT：解析列名，构造行对象并真正写入数组
  if (sqlUpper.startsWith('INSERT INTO')) {
    const m = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (m) {
      const table = m[1] as keyof typeof db;
      const columns = m[2].split(',').map((s: string) => s.trim());
      const arr = (db[table] as any[]) || [];
      const id = arr.length + 1;
      const row: any = { id };
      columns.forEach((col: string, i: number) => { row[col] = params?.[i]; });
      // books 表补时间戳，与建表语句默认值对齐
      if (table === 'books') {
        const now = new Date().toISOString();
        row.created_at = row.created_at || now;
        row.updated_at = row.updated_at || now;
      }
      arr.push(row);
      (db[table] as any) = arr;
      return [{ insertId: id }];
    }
    return [];
  }

  // SELECT
  if (sqlUpper.startsWith('SELECT')) {
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (tableMatch) {
      const table = tableMatch[1] as keyof typeof db;
      // settings 表特殊处理（保留原逻辑）
      if (table === 'settings') {
        const result: any[] = [];
        for (const key in db.settings) {
          result.push({ key, value: (db.settings as any)[key] });
        }
        return result;
      }
      let rows = ((db[table] as any[]) || []).slice();
      // WHERE col = ? [AND col = ?] 条件过滤（按出现顺序匹配 params）
      const whereMatches = [...sql.matchAll(/WHERE\s+(\w+)\s*=\s*\?/gi)];
      if (whereMatches.length > 0 && params && params.length > 0) {
        whereMatches.forEach((wm, i) => {
          const col = wm[1];
          rows = rows.filter(r => r[col] === params[i]);
        });
      }
      // COUNT(*) 聚合
      if (/COUNT\s*\(\s*\*\s*\)/i.test(sql)) {
        return [{ count: rows.length }];
      }
      // ORDER BY col ASC|DESC
      const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)\s+(ASC|DESC)/i);
      if (orderMatch) {
        const col = orderMatch[1];
        const dir = orderMatch[2].toUpperCase() === 'DESC' ? -1 : 1;
        rows.sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * dir);
      }
      return rows;
    }
    return [];
  }

  // UPDATE：按 SET col=?, ... 解析并更新匹配行
  if (sqlUpper.startsWith('UPDATE')) {
    const m = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
    if (m) {
      const table = m[1] as keyof typeof db;
      const setClause = m[2];
      const whereClause = m[3];
      const setCols = [...setClause.matchAll(/(\w+)\s*=\s*\?/gi)].map(x => x[1]);
      const whereCols = [...whereClause.matchAll(/(\w+)\s*=\s*\?/gi)].map(x => x[1]);
      const arr = (db[table] as any[]) || [];
      const setParams = params ? params.slice(0, setCols.length) : [];
      const whereParams = params ? params.slice(setCols.length, setCols.length + whereCols.length) : [];
      arr.forEach(row => {
        const matched = whereCols.every((col, i) => row[col] === whereParams[i]);
        if (matched) {
          setCols.forEach((col, i) => { row[col] = setParams[i]; });
          row.updated_at = new Date().toISOString();
        }
      });
    }
    return [];
  }

  // DELETE：真实删除匹配行
  if (sqlUpper.startsWith('DELETE')) {
    const m = sql.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+)/i);
    if (m) {
      const table = m[1] as keyof typeof db;
      const whereClause = m[2];
      const whereCols = [...whereClause.matchAll(/(\w+)\s*=\s*\?/gi)].map(x => x[1]);
      const arr = (db[table] as any[]) || [];
      (db[table] as any) = arr.filter(row => !whereCols.every((col, i) => row[col] === params?.[i]));
    }
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
