import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Chapter {
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

export const useReaderStore = defineStore('reader', () => {
  const currentBookId = ref<number>(0);
  const currentChapterIndex = ref<number>(0);
  const currentPosition = ref<number>(0);
  const chapters = ref<Chapter[]>([]);
  const isMenuVisible = ref<boolean>(false);
  const isLoading = ref<boolean>(false);

  const setBook = (bookId: number) => {
    currentBookId.value = bookId;
  };

  const setChapter = (index: number) => {
    currentChapterIndex.value = index;
  };

  const setPosition = (position: number) => {
    currentPosition.value = position;
  };

  const setChapters = (chapterList: Chapter[]) => {
    chapters.value = chapterList;
  };

  const toggleMenu = () => {
    isMenuVisible.value = !isMenuVisible.value;
  };

  const showMenu = () => {
    isMenuVisible.value = true;
  };

  const hideMenu = () => {
    isMenuVisible.value = false;
  };

  const nextChapter = () => {
    if (currentChapterIndex.value < chapters.value.length - 1) {
      currentChapterIndex.value++;
      currentPosition.value = 0;
      return true;
    }
    return false;
  };

  const prevChapter = () => {
    if (currentChapterIndex.value > 0) {
      currentChapterIndex.value--;
      currentPosition.value = 0;
      return true;
    }
    return false;
  };

  const getCurrentChapter = (): Chapter | null => {
    return chapters.value[currentChapterIndex.value] || null;
  };

  return {
    currentBookId,
    currentChapterIndex,
    currentPosition,
    chapters,
    isMenuVisible,
    isLoading,
    setBook,
    setChapter,
    setPosition,
    setChapters,
    toggleMenu,
    showMenu,
    hideMenu,
    nextChapter,
    prevChapter,
    getCurrentChapter
  };
});
