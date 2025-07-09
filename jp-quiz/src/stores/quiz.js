import { defineStore } from 'pinia'

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    quizData: [],
    selectedQuiz: null,
    currentLevel: null
  }),
  
  getters: {
    // Getter để lấy câu hỏi theo level
    getQuestionsByLevel: (state) => {
      return (level) => {
        return state.quizData.filter(question => question.level === level);
      }
    },
    
    // Getter để đếm số câu hỏi theo level
    getQuestionCountByLevel: (state) => {
      return (level) => {
        return state.quizData.filter(question => question.level === level).length;
      }
    },
    
    // Getter để lấy tất cả level có sẵn
    availableLevels: (state) => {
      const levels = [...new Set(state.quizData.map(q => q.level))];
      return levels.sort();
    }
  },
  
  actions: {
    setQuizData(data) {
      this.quizData = Array.isArray(data) ? data : [];
      console.log('Quiz data set in store:', this.quizData.length, 'questions');
    },
    
    setSelectedQuiz(quiz) {
      this.selectedQuiz = quiz;
      this.currentLevel = Array.isArray(quiz) && quiz.length > 0 ? quiz[0].level : null;
      console.log('Selected quiz set:', this.selectedQuiz?.length || 0, 'questions for level', this.currentLevel);
    },
    
    getQuizByLevel(level) {
      const questions = this.quizData.filter(question => question.level === level);
      console.log(`Found ${questions.length} questions for level ${level}`);
      return questions;
    },
    
    clearSelectedQuiz() {
      this.selectedQuiz = null;
      this.currentLevel = null;
    },
    
    // Action để clear toàn bộ dữ liệu (nếu cần reset)
    clearAllData() {
      this.quizData = [];
      this.selectedQuiz = null;
      this.currentLevel = null;
    }
  }
})
