export interface ChapterInfo {
  title: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
}

const CHAPTER_REGEX = /^\s*(第[一二三四五六七八九十百千零\d]+[章节回卷部][\s、．。：:]*.*)$/gm;

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
  
  if (chapters.length > 0) {
    chapters[chapters.length - 1].endIndex = content.length;
    chapters[chapters.length - 1].wordCount = 
      chapters[chapters.length - 1].endIndex - 
      chapters[chapters.length - 1].startIndex;
  }
  
  if (chapters.length === 0) {
    return createSingleChapter(content);
  }
  
  return chapters;
}

export function createSingleChapter(content: string): ChapterInfo[] {
  let title = '正文';
  const firstLine = content.split('\n')[0].trim();
  if (firstLine && firstLine.length > 0) {
    title = firstLine.substring(0, 30);
  }
  
  return [{
    title,
    startIndex: 0,
    endIndex: content.length,
    wordCount: content.length
  }];
}

export function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

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
  createSingleChapter,
  splitIntoParagraphs,
  getChapterByOffset
};
