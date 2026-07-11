import fileUtil from './file';
import chapterUtil, { type ChapterInfo } from './chapter';
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
    
    const { encoding, hasBom } = await fileUtil.detectEncoding(destPath);
    
    const fileSize = await fileUtil.getFileSize(destPath);
    const effectiveSize = hasBom ? fileSize - 3 : fileSize;
    const startOffset = hasBom ? 3 : 0;
    
    const bookshelfStore = useBookshelfStore();
    const bookId = await bookshelfStore.addBook({
      title,
      author: '',
      source_type: 'local',
      file_path: destPath,
      source_url: '',
      source_id: 0,
      total_chapters: 0,
      total_size: effectiveSize,
      last_read_chapter: 0,
      last_read_position: 0,
      cover_image: '',
      encoding
    });
    
    parseBookChapters(bookId, destPath, encoding, effectiveSize, startOffset);
    
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

function getByteOffset(content: string, charIndex: number, encoding: string): number {
  if (encoding.toLowerCase() === 'gbk' || encoding.toLowerCase() === 'gb2312') {
    return charIndex * 2;
  }
  
  let byteOffset = 0;
  for (let i = 0; i < charIndex && i < content.length; i++) {
    const charCode = content.charCodeAt(i);
    if (charCode < 0x80) {
      byteOffset += 1;
    } else if (charCode < 0x800) {
      byteOffset += 2;
    } else if (charCode < 0x10000) {
      byteOffset += 3;
    } else {
      byteOffset += 4;
    }
  }
  return byteOffset;
}

async function parseBookChapters(bookId: number, filePath: string, encoding: string, fileSize: number, startOffset: number = 0) {
  try {
    const content = await fileUtil.readFileWithEncoding(filePath, startOffset, startOffset + fileSize, encoding);
    
    const chapters: ChapterInfo[] = chapterUtil.parseChapters(content);
    
    const byteChapters = chapters.map(ch => ({
      ...ch,
      startIndex: startOffset + getByteOffset(content, ch.startIndex, encoding),
      endIndex: startOffset + getByteOffset(content, ch.endIndex - 1, encoding)
    }));
    
    await chapterDB.saveChapters(bookId, byteChapters);
    
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
