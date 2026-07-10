/**
 * 书架状态管理
 * 管理书籍列表、阅读进度等数据
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import db from '@/utils/db';

export interface Book {
  id: number;
  title: string;
  author: string;
  source_type: 'local' | 'online';
  file_path: string;
  source_url: string;
  source_id: number;
  total_chapters: number;
  total_size: number;
  last_read_chapter: number;
  last_read_position: number;
  cover_image: string;
  encoding: string;
  created_at: string;
  updated_at: string;
}

export const useBookshelfStore = defineStore('bookshelf', () => {
  const books = ref<Book[]>([]);

  /** 从数据库加载书籍列表 */
  const loadBooks = async () => {
    await db.initDB();
    const sql = `SELECT * FROM books ORDER BY updated_at DESC`;
    const result: any[] = await db.executeSql(sql);
    books.value = result || [];
  };

  /** 添加新书 */
  const addBook = async (book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
    await db.initDB();
    const sql = `
      INSERT INTO books (title, author, source_type, file_path, source_url, source_id, total_chapters, total_size, last_read_chapter, last_read_position, cover_image, encoding)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      book.title,
      book.author || '',
      book.source_type,
      book.file_path || '',
      book.source_url || '',
      book.source_id || 0,
      book.total_chapters || 0,
      book.total_size || 0,
      book.last_read_chapter || 0,
      book.last_read_position || 0,
      book.cover_image || '',
      book.encoding || 'utf-8'
    ];
    const result: any = await db.executeSql(sql, params);
    await loadBooks();
    return result?.[0]?.insertId || 0;
  };

  /** 更新阅读进度 */
  const updateBookProgress = async (bookId: number, chapter: number, position: number) => {
    await db.initDB();
    const sql = `
      UPDATE books 
      SET last_read_chapter = ?, last_read_position = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.executeSql(sql, [chapter, position, bookId]);
    await loadBooks();
  };

  /** 删除书籍及其关联数据 */
  const deleteBook = async (bookId: number) => {
    await db.initDB();
    await db.executeSql(`DELETE FROM books WHERE id = ?`, [bookId]);
    await db.executeSql(`DELETE FROM chapters WHERE book_id = ?`, [bookId]);
    await db.executeSql(`DELETE FROM bookmarks WHERE book_id = ?`, [bookId]);
    await loadBooks();
  };

  const getBookById = async (bookId: number): Promise<Book | null> => {
    await db.initDB();
    const result: any[] = await db.executeSql(`SELECT * FROM books WHERE id = ?`, [bookId]);
    return result?.[0] || null;
  };

  return {
    books,
    loadBooks,
    addBook,
    updateBookProgress,
    deleteBook,
    getBookById
  };
});
