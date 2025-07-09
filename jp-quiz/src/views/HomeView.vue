<template>
  <div class="home-container">
    <header class="header">
      <h1 class="title">Trắc Nghiệm Tiếng Nhật Mỗi Ngày</h1>
      <p class="subtitle">Cung cấp 5 câu trắc nghiệm mỗi ngày theo từng trình độ</p>
    </header>

    <main class="main-content">
      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">
            {{ selectedLevel ? `Đang tải bài quiz ${selectedLevel}...` : 'Đang tải dữ liệu...' }}
          </p>
        </div>
      </div>

      <!-- Main content -->
      <div v-else class="level-selection">
        <div class="level-card n5" @click="selectLevel('N5')">
          <div class="level-icon">🌸</div>
          <h2 class="level-title">N5</h2>
          <p class="level-description">
            Trình độ cơ bản<br>
            Hiragana, Katakana, Kanji cơ bản
          </p>
          <div class="level-stats">
            <span>~800 từ vựng</span>
          </div>
        </div>

        <div class="level-card n4" @click="selectLevel('N4')">
          <div class="level-icon">🏯</div>
          <h2 class="level-title">N4</h2>
          <p class="level-description">
            Trình độ sơ cấp<br>
            Ngữ pháp và từ vựng mở rộng
          </p>
          <div class="level-stats">
            <span>~1,500 từ vựng</span>
          </div>
        </div>

        <div class="level-card n3" @click="selectLevel('N3')">
          <div class="level-icon">⛩️</div>
          <h2 class="level-title">N3</h2>
          <p class="level-description">
            Trình độ trung cấp<br>
            Hiểu văn bản phức tạp hơn
          </p>
          <div class="level-stats">
            <span>~3,000 từ vựng</span>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>&copy; {{ new Date().getFullYear() }} Daily Japanese Quiz - Cố gắng mỗi ngày</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';
import apiConfig from '../configs/apiConfig';
import apiService from '../services/apiService';

const router = useRouter();
const quizStore = useQuizStore();

const isLoading = ref(true);
const selectedLevel = ref('');

onMounted(async () => {
  try {
    // Kiểm tra xem đã có dữ liệu trong store chưa
    if (quizStore.quizData.length > 0) {
      console.log('Quiz data already loaded from store');
      isLoading.value = false;
      return;
    }

    // Tải dữ liệu quiz một lần duy nhất
    await loadQuizData();
    
  } catch (error) {
    console.error('Error in onMounted:', error);
  } finally {
    isLoading.value = false;
  }
});

const loadQuizData = async () => {
  try {
    // Ưu tiên tải từ API trước
    try {
      const response = await apiService.get(apiConfig.GET_DAILY_QUIZ, {
        action: 'get_daily_quiz',
      });
      
      if (response && Array.isArray(response) && response.length > 0) {
        quizStore.setQuizData(response);
        console.log('Quiz data loaded from API:', response.length, 'questions');
        return;
      }
    } catch (apiError) {
      console.warn('API failed, falling back to sample data:', apiError);
    }

    // Fallback: tải từ file JSON sample
    const sampleResponse = await fetch('/quiz-sample.json');
    const sampleData = await sampleResponse.json();
    
    if (sampleData && Array.isArray(sampleData)) {
      quizStore.setQuizData(sampleData);
      console.log('Quiz data loaded from sample file:', sampleData.length, 'questions');
    } else {
      throw new Error('No valid quiz data found');
    }
    
  } catch (error) {
    console.error('Error loading quiz data:', error);
    throw error;
  }
};

const selectLevel = async (level) => {
  if (isLoading.value) return; // Prevent multiple clicks while loading
  
  selectedLevel.value = level;
  isLoading.value = true;
  
  try {
    console.log(`Selected level: ${level}`);
    
    // Đảm bảo đã có dữ liệu quiz
    if (quizStore.quizData.length === 0) {
      console.log('No quiz data, loading...');
      await loadQuizData();
    }
    
    // Lấy quiz theo level từ store
    const quizByLevel = quizStore.getQuizByLevel(level);
    if (!quizByLevel || (Array.isArray(quizByLevel) && quizByLevel.length === 0)) {
      console.error(`No quiz found for level ${level}`);
      alert(`Không tìm thấy câu hỏi cho level ${level}. Vui lòng thử lại sau.`);
      isLoading.value = false;
      selectedLevel.value = '';
      return;
    }
    
    // Lưu quiz được chọn vào store (lưu array các câu hỏi của level đó)
    const questionsForLevel = Array.isArray(quizByLevel) ? quizByLevel : [quizByLevel];
    quizStore.setSelectedQuiz(questionsForLevel);
    
    console.log(`Navigating to quiz for level: ${level}, questions:`, questionsForLevel.length);
    
    // Chuyển đến trang quiz
    router.push(`/quiz/${level}`);
    
  } catch (error) {
    console.error('Error selecting level:', error);
    alert('Có lỗi xảy ra khi tải quiz. Vui lòng thử lại.');
  } finally {
    isLoading.value = false;
    selectedLevel.value = '';
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  padding: 2rem;
  color: white;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.level-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.level-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.level-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.level-card.n5:hover {
  border-color: #FF6B9D;
}

.level-card.n4:hover {
  border-color: #4ECDC4;
}

.level-card.n3:hover {
  border-color: #45B7D1;
}

.level-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.level-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.level-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.level-stats {
  background: #f8f9fa;
  padding: 0.8rem;
  border-radius: 10px;
  font-weight: 600;
  color: #555;
}

/* Loading Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  color: white;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

.footer {
  background: rgba(0,0,0,0.2);
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .home-container {
    min-height: 100vh;
  }
  
  .header {
    padding: 1.5rem 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .level-selection {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .level-card {
    padding: 1.5rem;
    border-radius: 16px;
    /* Better touch interaction */
    -webkit-tap-highlight-color: rgba(0,0,0,0.1);
    user-select: none;
  }
  
  .level-icon {
    font-size: 3rem;
    margin-bottom: 0.8rem;
  }
  
  .level-title {
    font-size: 2rem;
    margin-bottom: 0.8rem;
  }
  
  .level-description {
    font-size: 1rem;
    margin-bottom: 1.2rem;
    line-height: 1.5;
  }
  
  .level-stats {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 1rem 0.8rem;
  }
  
  .title {
    font-size: 1.8rem;
    margin-bottom: 0.3rem;
  }
  
  .subtitle {
    font-size: 0.95rem;
  }
  
  .main-content {
    padding: 0.8rem;
  }
  
  .level-selection {
    gap: 0.8rem;
    margin-bottom: 1.5rem;
  }
  
  .level-card {
    padding: 1.2rem;
    border-radius: 12px;
  }
  
  .level-icon {
    font-size: 2.5rem;
    margin-bottom: 0.6rem;
  }
  
  .level-title {
    font-size: 1.8rem;
    margin-bottom: 0.6rem;
  }
  
  .level-description {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
  
  .level-stats {
    padding: 0.5rem;
    font-size: 0.85rem;
    border-radius: 8px;
  }
  
  .footer {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
}

/* Landscape mobile orientation */
@media (max-height: 600px) and (orientation: landscape) {
  .header {
    padding: 0.8rem 1rem;
  }
  
  .title {
    font-size: 1.5rem;
    margin-bottom: 0.2rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
  
  .main-content {
    padding: 0.8rem;
  }
  
  .level-selection {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .level-card {
    padding: 1rem;
  }
  
  .level-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .level-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .level-description {
    font-size: 0.85rem;
    margin-bottom: 0.8rem;
  }
  
  .footer {
    padding: 0.6rem;
    font-size: 0.85rem;
  }
}
</style>
