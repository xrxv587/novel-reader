import { detect } from 'jschardet';
import * as iconv from 'iconv-lite';

// #ifndef APP-PLUS
// H5 模式下，用户选择的 File 对象暂存到内存，key 为 mem:// 路径
const memoryFileStore = new Map<string, File>();

export function getMemoryFile(path: string): File | undefined {
  return memoryFileStore.get(path);
}

function isMemoryPath(path: string): boolean {
  return !!(path && path.startsWith('mem://'));
}
// #endif

export function readFileRange(filePath: string, start: number, end: number, encoding: string = 'utf-8'): Promise<string> {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.io.requestFileSystem(
      plus.io.PRIVATE_DOC,
      (fs: any) => {
        fs.root.getFile(
          filePath,
          { create: false },
          (fileEntry: any) => {
            fileEntry.file(
              (file: any) => {
                const reader = new plus.io.FileReader();
                reader.onload = (e: any) => {
                  resolve(e.target.result);
                };
                reader.onerror = reject;
                const blob = file.slice(start, end - 1);
                reader.readAsText(blob, encoding);
              },
              reject
            );
          },
          reject
        );
      },
      reject
    );
    // #endif

    // #ifndef APP-PLUS
    if (isMemoryPath(filePath)) {
      const file = memoryFileStore.get(filePath);
      if (!file) {
        reject(new Error('Memory file not found'));
        return;
      }
      const blob = file.slice(start, end);
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target as any).result as string);
      reader.onerror = () => reject(new Error('Read file range failed'));
      reader.readAsText(blob, encoding);
    } else {
      resolve('');
    }
    // #endif
  });
}

export function readFileAsArrayBuffer(filePath: string, start: number, end: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.io.requestFileSystem(
      plus.io.PRIVATE_DOC,
      (fs: any) => {
        fs.root.getFile(
          filePath,
          { create: false },
          (fileEntry: any) => {
            fileEntry.file(
              (file: any) => {
                const reader = new plus.io.FileReader();
                reader.onload = (e: any) => {
                  resolve(e.target.result);
                };
                reader.onerror = reject;
                const blob = file.slice(start, end - 1);
                reader.readAsArrayBuffer(blob);
              },
              reject
            );
          },
          reject
        );
      },
      reject
    );
    // #endif

    // #ifndef APP-PLUS
    if (isMemoryPath(filePath)) {
      const file = memoryFileStore.get(filePath);
      if (!file) {
        reject(new Error('Memory file not found'));
        return;
      }
      const blob = file.slice(start, end);
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target as any).result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Read file as arraybuffer failed'));
      reader.readAsArrayBuffer(blob);
    } else {
      resolve(new ArrayBuffer(0));
    }
    // #endif
  });
}

export async function detectEncoding(filePath: string): Promise<string> {
  try {
    const buffer = await readFileAsArrayBuffer(filePath, 0, 2048);
    const result = detect(Buffer.from(buffer));
    let encoding = result.encoding?.toLowerCase() || 'utf-8';
    
    if (encoding === 'gb2312' || encoding === 'gbk' || encoding === 'gb18030') {
      encoding = 'gbk';
    } else if (encoding === 'utf-8' || encoding === 'utf8') {
      encoding = 'utf-8';
    }
    
    return encoding;
  } catch (e) {
    console.error('Detect encoding error:', e);
    return 'utf-8';
  }
}

export function decodeBuffer(buffer: ArrayBuffer, encoding: string): string {
  try {
    const buf = Buffer.from(buffer);
    if (encoding.toLowerCase() === 'gbk' || encoding.toLowerCase() === 'gb2312') {
      return iconv.decode(buf, 'gbk');
    }
    return iconv.decode(buf, 'utf-8');
  } catch (e) {
    console.error('Decode buffer error:', e);
    return '';
  }
}

export async function readFileWithEncoding(filePath: string, start: number, end: number, encoding: string): Promise<string> {
  if (encoding.toLowerCase() === 'utf-8') {
    return readFileRange(filePath, start, end, 'utf-8');
  }
  
  const buffer = await readFileAsArrayBuffer(filePath, start, end);
  return decodeBuffer(buffer, encoding);
}

export function getFileSize(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.io.requestFileSystem(
      plus.io.PRIVATE_DOC,
      (fs: any) => {
        fs.root.getFile(
          filePath,
          { create: false },
          (fileEntry: any) => {
            fileEntry.file(
              (file: any) => {
                resolve(file.size);
              },
              reject
            );
          },
          reject
        );
      },
      reject
    );
    // #endif

    // #ifndef APP-PLUS
    if (isMemoryPath(filePath)) {
      const file = memoryFileStore.get(filePath);
      resolve(file ? file.size : 0);
    } else {
      resolve(0);
    }
    // #endif
  });
}

export function copyFileToPrivate(srcPath: string, destName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.io.requestFileSystem(
      plus.io.PRIVATE_DOC,
      (fs: any) => {
        const destPath = `books/${destName}`;
        fs.root.getFile(
          srcPath,
          { create: false },
          (srcEntry: any) => {
            fs.root.getDirectory(
              'books',
              { create: true },
              (dirEntry: any) => {
                srcEntry.copyTo(
                  dirEntry,
                  destName,
                  (entry: any) => {
                    resolve(`books/${destName}`);
                  },
                  reject
                );
              },
              reject
            );
          },
          reject
        );
      },
      reject
    );
    // #endif

    // #ifndef APP-PLUS
    // H5 无文件系统，内存文件无需复制，直接沿用原 mem:// 路径
    if (isMemoryPath(srcPath)) {
      resolve(srcPath);
    } else {
      resolve('');
    }
    // #endif
  });
}

export function chooseTxtFile(): Promise<{ path: string; name: string }> {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.io.chooseFile({
      filter: ['txt'],
      success: (res: any) => {
        if (res.files && res.files.length > 0) {
          const file = res.files[0];
          resolve({
            path: file.fullPath || file.path,
            name: file.name
          });
        } else {
          reject(new Error('No file selected'));
        }
      },
      fail: reject
    });
    // #endif

    // #ifndef APP-PLUS
    // H5 模式：用 <input type="file"> 选择 txt，把 File 对象存入内存
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,text/plain';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      const memPath = `mem://${Date.now()}_${file.name}`;
      memoryFileStore.set(memPath, file);
      resolve({ path: memPath, name: file.name });
    };
    input.onerror = () => reject(new Error('File choose failed'));
    input.click();
    // #endif
  });
}

export default {
  readFileRange,
  readFileAsArrayBuffer,
  detectEncoding,
  decodeBuffer,
  readFileWithEncoding,
  getFileSize,
  copyFileToPrivate,
  chooseTxtFile
};
