/**
 * 章节解析工具模块
 * 提供章节识别、分章、段落分割等功能
 */

export interface ChapterInfo {
  title: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
}

// 章节匹配正则：匹配「第X章/节/回/卷/部」格式
const CHAPTER_REGEX = /^\s*(第[一二三四五六七八九十百千零\d]+[章节回卷部][\s、．。：:]*.*)$/gm;

/**
 * 解析章节
 * 优先正则匹配，无匹配时按固定字数分章
 */
export function parseChapters(content: string): ChapterInfo[] {
  const chapters: ChapterInfo[] = [];
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  
  const regex = new RegExp(CHAPTER_REGEX.source, 'gm');
  
  while ((match = regex.exec(content)) !== null) {
    if (chapters.length > 0) {
      chapters[chapters.length - 1].endIndex = match.index;
      chapters[chapters.length - 1].wordCount = 
        chapters[chapters.length - 1].endIndex - 
        chapters[chapters.length - 1].startIndex;
    }
    
    chapters.push({
      title: match[1].trim(),
      startIndex: match.index,
      endIndex: content.length,
      wordCount: 0
    });
    
    lastIndex = match.index;
  }
  
  // 修正最后一章的结束位置
  if (chapters.length > 0) {
    chapters[chapters.length - 1].endIndex = content.length;
    chapters[chapters.length - 1].wordCount = 
      chapters[chapters.length - 1].endIndex - 
      chapters[chapters.length - 1].startIndex;
  }
  
  // 无章节匹配时，按固定字数分章（默认 5000 字）
  if (chapters.length === 0) {
    return splitBySize(content);
  }
  
  return chapters;
}

/** 按固定字数分章（fallback 方案） */
export function splitBySize(content: string, chunkSize: number = 5000): ChapterInfo[] {
  const chapters: ChapterInfo[] = [];
  
  for (let i = 0; i < content.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, content.length);
    const chapterNum = Math.floor(i / chunkSize) + 1;
    
    let title = `第${chapterNum}章`;
    const firstLine = content.slice(i, i + 50).split('\n')[0].trim();
    if (firstLine && firstLine.length > 0) {
      title = firstLine.substring(0, 30);
    }
    
    chapters.push({
      title,
      startIndex: i,
      endIndex: end,
      wordCount: end - i
    });
  }
  
  return chapters;
}

/** 将文本按换行符分割成段落数组 */
export function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/** 根据字符偏移定位所属章节 */
export function getChapterByOffset(chapters: ChapterInfo[], offset: number): number {
  for (let i = 0; i < chapters.length; i++) {
    if (offset >= chapters[i].startIndex && offset < chapters[i].endIndex) {
      return i;
    }
  }
  return 0;
}

export default {
  parseChapters,
  splitBySize,
  splitIntoParagraphs,
  getChapterByOffset
};
