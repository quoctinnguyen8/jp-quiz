<template>
    <div class="quiz-container">
        <header class="quiz-header">
            <button @click="goBack" class="back-button">
                ← Quay lại
            </button>
            <div class="quiz-info">
                <h1 class="quiz-title">Quiz {{ level }}</h1>
                <div class="progress-info">
                    <span>Câu {{ currentQuestionIndex + 1 }}/{{ quizQuestions.length }}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                    </div>
                </div>
            </div>
        </header>

        <main class="quiz-main">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Đang tải câu hỏi...</p>
                </div>
            </div>

            <!-- Quiz Questions -->
            <div v-else-if="!showResults && quizQuestions.length > 0" class="quiz-content">
                <div class="question-card">
                    <div class="question-number">
                        Câu {{ currentQuestionIndex + 1 }}
                    </div>
                    
                    <div class="question-text" v-html="currentQuestion.question"></div>
                    
                    <div class="options-container">
                        <div 
                            v-for="option in ['A', 'B', 'C', 'D']" 
                            :key="option"
                            class="option-item"
                            :class="{ 'selected': userAnswers[currentQuestionIndex] === option }"
                            @click="selectAnswer(option)"
                        >
                            <div class="option-label">{{ option }}</div>
                            <div class="option-text">{{ getOptionText(option) }}</div>
                        </div>
                    </div>

                    <div class="quiz-actions">
                        <button 
                            v-if="currentQuestionIndex > 0"
                            @click="goToPrevious"
                            class="nav-button prev-button"
                        >
                            ← Câu trước
                        </button>
                        
                        <button 
                            v-if="currentQuestionIndex < quizQuestions.length - 1"
                            @click="goToNext"
                            class="nav-button next-button"
                        >
                            Câu tiếp → 
                        </button>
                        
                        <button 
                            v-if="currentQuestionIndex === quizQuestions.length - 1"
                            @click="submitQuiz"
                            class="submit-button"
                            :disabled="!allQuestionsAnswered"
                        >
                            Hoàn thành
                        </button>
                    </div>
                </div>
            </div>

            <!-- Results -->
            <div v-else-if="showResults" class="results-container">
                <div class="results-header">
                    <div class="score-display">
                        <div class="score-number">{{ score }}/{{ quizQuestions.length }}</div>
                    </div>
                    <h2 class="results-title">
                        {{ score === quizQuestions.length ? 'Hoàn hảo!' : 
                           score >= quizQuestions.length * 0.8 ? 'Tốt lắm!' : 
                           score >= quizQuestions.length * 0.6 ? 'Khá tốt!' : 'Cần cố gắng thêm!' }}
                    </h2>
                </div>

                <div class="results-details">
                    <div 
                        v-for="(question, index) in quizQuestions" 
                        :key="question.id"
                        class="result-item"
                        :class="{ 'correct': userAnswers[index] === question.correctAnswer,
                                 'incorrect': userAnswers[index] !== question.correctAnswer }"
                    >
                        <div class="result-header">
                            <span class="question-number">Câu {{ index + 1 }}</span>
                            <span class="result-status">
                                {{ userAnswers[index] === question.correctAnswer ? '✓ Đúng' : '✗ Sai' }}
                            </span>
                        </div>
                        
                        <div class="result-question" v-html="question.question"></div>
                        
                        <div class="result-answers">
                            <div class="answer-row">
                                <strong>Bạn chọn:</strong> 
                                <span class="user-answer">{{ userAnswers[index] }} - {{ getOptionText(userAnswers[index], question) }}</span>
                            </div>
                            <div class="answer-row">
                                <strong>Đáp án đúng:</strong> 
                                <span class="correct-answer">{{ question.correctAnswer }} - {{ getOptionText(question.correctAnswer, question) }}</span>
                            </div>
                        </div>

                        <div 
                            v-if="question.explanation && userAnswers[index] !== question.correctAnswer" 
                            class="explanation"
                        >
                            <strong>Giải thích:</strong> {{ question.explanation }}
                        </div>
                    </div>
                </div>

                <div class="results-actions">
                    <button @click="retakeQuiz" class="retry-button">
                        Làm lại
                    </button>
                    <button @click="goBack" class="home-button">
                        Về trang chủ
                    </button>
                </div>
            </div>

            <!-- No Questions -->
            <div v-else class="no-questions">
                <p>Không tìm thấy câu hỏi cho level {{ level }}</p>
                <button @click="loadQuestionsFromStore" class="load-sample-button">
                    🔄 Tải lại câu hỏi
                </button>
            </div>
        </main>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const level = route.params.level;
const selectedQuiz = computed(() => quizStore.selectedQuiz);

// Quiz state
const isLoading = ref(false);
const currentQuestionIndex = ref(0);
const userAnswers = ref([]);
const showResults = ref(false);
const quizQuestions = ref([]);

// Computed properties
const currentQuestion = computed(() => quizQuestions.value[currentQuestionIndex.value]);
const progressPercent = computed(() => 
    quizQuestions.value.length > 0 ? ((currentQuestionIndex.value + 1) / quizQuestions.value.length) * 100 : 0
);
const allQuestionsAnswered = computed(() => 
    userAnswers.value.length === quizQuestions.value.length && 
    userAnswers.value.every(answer => answer !== null && answer !== undefined)
);
const score = computed(() => {
    return userAnswers.value.reduce((total, answer, index) => {
        return total + (answer === quizQuestions.value[index]?.correctAnswer ? 1 : 0);
    }, 0);
});

// Methods
const loadQuestionsFromStore = () => {
    console.log('Loading questions for level:', level);
    console.log('Store quiz data:', quizStore.quizData.length, 'total questions');
    
    // Lấy câu hỏi theo level từ store
    const levelQuestions = quizStore.getQuizByLevel(level);
    
    if (levelQuestions.length > 0) {
        quizQuestions.value = levelQuestions;
        initializeAnswers();
        console.log(`Loaded ${levelQuestions.length} questions for level ${level}`);
    } else {
        console.error(`No questions found for level ${level} in store`);
    }
};

const initializeAnswers = () => {
    userAnswers.value = new Array(quizQuestions.value.length).fill(null);
};

const getOptionText = (option, question = null) => {
    const q = question || currentQuestion.value;
    if (!q) return '';
    
    const optionKey = `option${option}`;
    const optionText = q[optionKey] || '';
    
    // Loại bỏ phần "A. ", "B. ", etc. nếu có
    return optionText.replace(/^[A-D]\.\s*/, '');
};

const selectAnswer = (option) => {
    userAnswers.value[currentQuestionIndex.value] = option;
};

const goToNext = () => {
    if (currentQuestionIndex.value < quizQuestions.value.length - 1) {
        currentQuestionIndex.value++;
    }
};

const goToPrevious = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
    }
};

const submitQuiz = () => {
    if (allQuestionsAnswered.value) {
        showResults.value = true;
    }
};

const retakeQuiz = () => {
    currentQuestionIndex.value = 0;
    showResults.value = false;
    initializeAnswers();
};

const goBack = () => {
    quizStore.clearSelectedQuiz();
    router.push('/');
};

onMounted(() => {
    console.log('Quiz page mounted for level:', level);
    console.log('Selected quiz from store:', selectedQuiz.value?.length || 0, 'questions');
    
    // Nếu có dữ liệu từ store, sử dụng luôn
    if (selectedQuiz.value && Array.isArray(selectedQuiz.value) && selectedQuiz.value.length > 0) {
        quizQuestions.value = selectedQuiz.value;
        initializeAnswers();
        console.log('Using quiz data from store');
    } else {
        // Nếu không có, thử tải từ store theo level
        loadQuestionsFromStore();
    }
});
</script>

<style scoped>
.quiz-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    flex-direction: column;
}

.quiz-header {
    background: rgba(255, 255, 255, 0.95);
    padding: 0.8rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}

.back-button {
    background: #f8f9fa;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    color: #495057;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.back-button:hover {
    background: #e9ecef;
    transform: translateX(-2px);
}

.quiz-info {
    flex: 1;
    min-width: 0;
}

.quiz-title {
    color: #333;
    font-size: 1.3rem;
    margin: 0 0 0.3rem 0;
    font-weight: 600;
}

.progress-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.9rem;
}

.progress-bar {
    flex: 1;
    height: 6px;
    background: #e9ecef;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4ECDC4, #45B7D1);
    transition: width 0.3s ease;
}

.quiz-main {
    flex: 1;
    padding: 1rem;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow-y: auto;
}

.loading-state, .no-questions {
    text-align: center;
    color: white;
    padding: 2rem 1rem;
    width: 100%;
}

.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.quiz-content, .results-container {
    background: white;
    border-radius: 16px;
    padding: 1.2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}

.question-card {
    text-align: center;
}

.question-number {
    background: #667eea;
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 16px;
    font-weight: 600;
    display: inline-block;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.question-text {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 1.5rem;
    line-height: 1.5;
    text-align: left;
    white-space: pre-line;
}

.options-container {
    display: grid;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
}

.option-item {
    display: flex;
    align-items: center;
    padding: 0.8rem;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    min-height: 48px; /* Tối thiểu cho touch target */
}

.option-item:hover {
    border-color: #667eea;
    background: #f8f9ff;
}

.option-item.selected {
    border-color: #667eea;
    background: #e8f0fe;
}

.option-label {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #667eea;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 0.8rem;
    flex-shrink: 0;
    font-size: 0.9rem;
}

.option-text {
    flex: 1;
    font-size: 1rem;
    line-height: 1.4;
}

.quiz-actions {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    flex-wrap: wrap;
}

.nav-button, .submit-button, .retry-button, .home-button, .load-sample-button {
    padding: 0.7rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    min-height: 44px; /* Touch target size */
}

.nav-button {
    background: #6c757d;
    color: white;
}
.next-button {
    background: #4ECDC4;
    color: white;
}

.submit-button {
    background: #28a745;
    color: white;
}

.submit-button:disabled {
    background: #adb5bd;
    cursor: not-allowed;
}

.retry-button {
    background: #007bff;
    color: white;
}

.home-button {
    background: #6c757d;
    color: white;
}

.load-sample-button {
    background: #17a2b8;
    color: white;
}

/* Results Styles - Optimized for mobile */
.results-header {
    text-align: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e9ecef;
}

.score-display {
    margin-bottom: 0.5rem;
}

.score-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #667eea;
}

.score-percent {
    font-size: 1.3rem;
    color: #666;
}

.results-title {
    color: #333;
    font-size: 1.5rem;
}

.results-details {
    margin-bottom: 1.5rem;
    max-height: 50vh;
    overflow-y: auto;
}

.result-item {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 10px;
    border-left: 4px solid;
    font-size: 0.9rem;
}

.result-item.correct {
    background: #d4edda;
    border-left-color: #28a745;
}

.result-item.incorrect {
    background: #f8d7da;
    border-left-color: #dc3545;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.result-header .question-number {
    font-weight: 600;
    background: none;
    color: #333;
    padding: 0;
    font-size: 0.9rem;
}

.result-status {
    font-weight: 600;
    font-size: 0.9rem;
}

.result-question {
    margin-bottom: 0.8rem;
    font-weight: 500;
    white-space: pre-line;
    line-height: 1.4;
}

.result-answers {
    margin-bottom: 0.8rem;
}

.answer-row {
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
    line-height: 1.3;
}

.user-answer {
    color: #dc3545;
}

.correct-answer {
    color: #28a745;
}

.explanation {
    background: #fff3cd;
    padding: 0.8rem;
    border-radius: 6px;
    border-left: 3px solid #ffc107;
    margin-top: 0.8rem;
    text-align: left;
    font-size: 0.85rem;
    line-height: 1.4;
}

.results-actions {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    flex-wrap: wrap;
}

/* Mobile Specific Optimizations */
@media (max-width: 768px) {
    .quiz-container {
        height: 100vh;
        overflow: hidden;
    }
    
    .quiz-header {
        padding: 0.8rem;
        gap: 0.8rem;
    }
    
    .quiz-title {
        font-size: 1.2rem;
    }
    
    .progress-info {
        font-size: 0.85rem;
    }
    
    .quiz-main {
        padding: 0.8rem;
        height: calc(100vh - 80px);
        margin-top: 10px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    }
    
    .quiz-content, .results-container {
        padding: 1rem;
        height: fit-content;
        max-height: 100%;
        overflow-y: auto;
    }
    
    .question-text {
        font-size: 1rem;
        margin-bottom: 1.2rem;
    }
    
    .options-container {
        gap: 0.6rem;
        margin-bottom: 1.2rem;
    }
    
    .option-item {
        padding: 0.7rem;
        /* Improved touch targets */
        -webkit-tap-highlight-color: rgba(102, 126, 234, 0.1);
    }
    
    .option-text {
        font-size: 0.95rem;
    }
    
    .quiz-actions, .results-actions {
        gap: 0.6rem;
    }
    
    .nav-button, .submit-button, .retry-button, .home-button, .load-sample-button {
        padding: 0.6rem 1rem;
        font-size: 0.85rem;
        flex: 1;
        max-width: 120px;
        /* Improved button appearance on mobile */
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        -webkit-tap-highlight-color: transparent;
    }
    
    .results-details {
        max-height: 40vh;
        -webkit-overflow-scrolling: touch;
    }
    
    .result-item {
        padding: 0.8rem;
        margin-bottom: 0.8rem;
    }
}

@media (max-width: 480px) {
    .quiz-header {
        padding: 0.6rem;
    }
    
    .quiz-title {
        font-size: 1.1rem;
    }
    
    .quiz-main {
        padding: 0.6rem;
        height: calc(100vh - 70px);
    }
    
    .quiz-content, .results-container {
        padding: 0.8rem;
        border-radius: 12px;
    }
    
    .question-text {
        font-size: 0.95rem;
    }
    
    .option-item {
        padding: 0.6rem;
        min-height: 44px;
    }
    
    .option-label {
        width: 28px;
        height: 28px;
        margin-right: 0.6rem;
        font-size: 0.8rem;
    }
    
    .option-text {
        font-size: 0.9rem;
    }
    
    .score-number {
        font-size: 2rem;
    }
    
    .score-percent {
        font-size: 1.1rem;
    }
    
    .results-title {
        font-size: 1.3rem;
    }
}

/* Landscape mobile orientation */
@media (max-height: 500px) and (orientation: landscape) {
    .quiz-header {
        padding: 0.5rem 0.8rem;
    }
    
    .quiz-title {
        font-size: 1rem;
    }
    
    .progress-info {
        font-size: 0.8rem;
    }
    
    .quiz-main {
        height: calc(100vh - 60px);
        padding: 0.5rem;
    }
    
    .quiz-content {
        padding: 0.8rem;
    }
    
    .question-number {
        margin-bottom: 0.8rem;
        padding: 0.3rem 0.8rem;
        font-size: 0.8rem;
    }
    
    .question-text {
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }
    
    .options-container {
        margin-bottom: 1rem;
        gap: 0.5rem;
    }
    
    .option-item {
        padding: 0.5rem;
        min-height: 40px;
    }
    
    .results-details {
        max-height: 30vh;
    }
}
</style>
