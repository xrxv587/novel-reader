import db from './db';
import type { ChapterInfo } from './chapter';

export interface ChapterRecord {
  id: number;
  book_id: number;
  chapter_index: number;
  title: string;
  start_offset: number;
  end_offset: number;
  content_url: string;
  content: string;
  word_count: number;
}

export async function saveChapters(bookId: number, chapters: ChapterInfo[]): Promise<void> {
  await db.initDB();
  
  await db.executeSql(`DELETE FROM chapters WHERE book_id = ?`, [bookId]);
  
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const sql = `
      INSERT INTO chapters (book_id, chapter_index, title, start_offset, end_offset, word_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.executeSql(sql, [bookId, i, ch.title, ch.startIndex, ch.endIndex, ch.wordCount]);
  }
}

export async function getChapters(bookId: number): Promise<ChapterRecord[]> {
  await db.initDB();
  const result: ChapterRecord[] = await db.executeSql(
    `SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_index ASC`,
    [bookId]
  );
  return result || [];
}

export async function getChapter(bookId: number, chapterIndex: number): Promise<ChapterRecord | null> {
  await db.initDB();
  const result: ChapterRecord[] = await db.executeSql(
    `SELECT * FROM chapters WHERE book_id = ? AND chapter_index = ?`,
    [bookId, chapterIndex]
  );
  return result?.[chapterIndex] || null;
}

export async function updateChapterContent(bookId: number, chapterIndex: number, content: string): Promise<void> {
  await db.initDB();
  await db.executeSql(
    `UPDATE chapters SET content = ? WHERE book_id = ? AND chapter_index = ?`,
    [content, bookId, chapterIndex]
  );
}

export async function getChapterCount(bookId: number): Promise<number> {
  await db.initDB();
  const result: any[] = await db.executeSql(
    `SELECT COUNT(*) as count FROM chapters WHERE book_id = ?`,
    [bookId]
  );
  return result?.[0]?.count || 0;
}

export default {
  saveChapters,
  getChapters,
  getChapter,
  updateChapterContent,
  getChapterCount
};
