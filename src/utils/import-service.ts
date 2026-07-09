import fileUtil from './file';
import chapterUtil, { ChapterInfo } from './chapter';
import chapterDB from './chapter-db';
import { useBookshelfStore } from '@/store/bookshelf';

export interface ImportResult {
  bookId: number;
  title: string;
  success: boolean;
  error?: string;
}

export async function importLocalTxt(): Promise<ImportResult> {
  try {
    const { path: srcPath, name } = await fileUtil.chooseTxtFile();
    
    const title = name.replace(/\.txt$/i, '');
    const destName = `${Date.now()}_${name}`;
    
    const destPath = await fileUtil.copyFileToPrivate(srcPath, destName);
    
    const encoding = await fileUtil.detectEncoding(destPath);
    
    const fileSize = await fileUtil.getFileSize(destPath);
    
    const bookshelfStore = useBookshelfStore();
    const bookId = await bookshelfStore.addBook({
      title,
      author: '',
      source_type: 'local',
      file_path: destPath,
      source_url: '',
      source_id: 0,
      total_chapters: 0,
      total_size: fileSize,
      last_read_chapter: 0,
      last_read_position: 0,
      cover_image: '',
      encoding
    });
    
    parseBookChapters(bookId, destPath, encoding, fileSize);
    
    return {
      bookId,
      title,
      success: true
    };
  } catch (e: any) {
    console.error('Import txt error:', e);
    return {
      bookId: 0,
      title: '',
      success: false,
      error: e?.message || '导入失败'
    };
  }
}

async function parseBookChapters(bookId: number, filePath: string, encoding: string, fileSize: number) {
  try {
    const content = await fileUtil.readFileWithEncoding(filePath, 0, fileSize, encoding);
    
    const chapters: ChapterInfo[] = chapterUtil.parseChapters(content);
    
    await chapterDB.saveChapters(bookId, chapters);
    
    const bookshelfStore = useBookshelfStore();
    await bookshelfStore.loadBooks();
    
    console.log(`Book ${bookId} parsed, ${chapters.length} chapters`);
  } catch (e) {
    console.error('Parse chapters error:', e);
  }
}

export async function getChapterContent(bookId: number, chapterIndex: number, filePath: string, encoding: string): Promise<string[]> {
  try {
    const chapter = await chapterDB.getChapter(bookId, chapterIndex);
    
    if (!chapter) {
      return [];
    }
    
    if (chapter.content && chapter.content.length > 0) {
      return JSON.parse(chapter.content);
    }
    
    const content = await fileUtil.readFileWithEncoding(
      filePath,
      chapter.start_offset,
      chapter.end_offset,
      encoding
    );
    
    const paragraphs = chapterUtil.splitIntoParagraphs(content);
    
    await chapterDB.updateChapterContent(bookId, chapterIndex, JSON.stringify(paragraphs));
    
    return paragraphs;
  } catch (e) {
    console.error('Get chapter content error:', e);
    return [];
  }
}

export default {
  importLocalTxt,
  getChapterContent
};
