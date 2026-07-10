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

/**
 * 校验字节流是否为合法 UTF-8
 * 中文小说 txt 实际只有 UTF-8 和 GBK 两种，不是合法 UTF-8 即为 GBK
 */
function isValidUtf8(bytes: Uint8Array): boolean {
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 0x80) {
      i++;
    } else if (b >= 0xC2 && b < 0xE0) {
      if (i + 1 >= bytes.length || (bytes[i + 1] & 0xC0) !== 0x80) return false;
      i += 2;
    } else if (b >= 0xE0 && b < 0xF0) {
      if (i + 2 >= bytes.length) return false;
      if ((bytes[i + 1] & 0xC0) !== 0x80) return false;
      if ((bytes[i + 2] & 0xC0) !== 0x80) return false;
      i += 3;
    } else if (b >= 0xF0 && b < 0xF5) {
      if (i + 3 >= bytes.length) return false;
      if ((bytes[i + 1] & 0xC0) !== 0x80) return false;
      if ((bytes[i + 2] & 0xC0) !== 0x80) return false;
      if ((bytes[i + 3] & 0xC0) !== 0x80) return false;
      i += 4;
    } else {
      return false;
    }
  }
  return true;
}

export async function detectEncoding(filePath: string): Promise<string> {
  try {
    const buffer = await readFileAsArrayBuffer(filePath, 0, 2048);
    const bytes = new Uint8Array(buffer);

    // BOM 检测
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return 'utf-8';
    }

    // 合法 UTF-8 则为 UTF-8，否则视为 GBK
    return isValidUtf8(bytes) ? 'utf-8' : 'gbk';
  } catch (e) {
    console.error('Detect encoding error:', e);
    return 'utf-8';
  }
}

export function decodeBuffer(buffer: ArrayBuffer, encoding: string): string {
  try {
    const label = encoding.toLowerCase() === 'gbk' || encoding.toLowerCase() === 'gb2312' ? 'gbk' : 'utf-8';
    // TextDecoder：H5 浏览器原生支持 GBK
    // APP-PLUS 推荐通过 readFileRange 使用原生 readAsText 解码
    return new TextDecoder(label).decode(new Uint8Array(buffer));
  } catch (e) {
    console.error('Decode buffer error:', e);
    return '';
  }
}

export async function readFileWithEncoding(filePath: string, start: number, end: number, encoding: string): Promise<string> {
  // 统一走 readFileRange，底层通过原生 FileReader.readAsText(blob, encoding) 解码
  // APP-PLUS: plus.io.FileReader 原生支持 GBK
  // H5: 浏览器 FileReader 原生支持 GBK
  return readFileRange(filePath, start, end, encoding);
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
