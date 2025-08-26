// 설문 관리 API 서비스

import { apiClient } from './api';

export interface PsychTest {
  id: number;
  title: string;
  description?: string;
  logic_type: 'mbti' | 'scale' | 'category';
  is_active: boolean;
  max_score?: number;
  estimated_time: number;
  instruction?: string;
  questions_count: number;
  created_at: string;
  updated_at: string;
}

export interface PsychTestDetail extends PsychTest {
  scoring_rules?: Record<string, any>;
  result_ranges?: Record<string, any>;
  questions: PsychQuestion[];
}

export interface PsychQuestion {
  id: number;
  testId: number;
  testTitle?: string;
  question: string;
  questionOrder: number;
  questionType: 'multiple_choice' | 'scale' | 'text' | 'yes_no';
  options?: QuestionOption[];
  isRequired: boolean;
  helpText?: string;
  createdAt: string;
}

export interface QuestionOption {
  value: string | number;
  text: string;
  score?: number;
}

export interface CreateQuestionRequest {
  testId: number;
  question: string;
  questionType: 'multiple_choice' | 'scale' | 'text' | 'yes_no';
  questionOrder: number;
  options?: QuestionOption[];
  isRequired?: boolean;
  helpText?: string;
}

export interface UpdateQuestionRequest {
  question?: string;
  questionType?: 'multiple_choice' | 'scale' | 'text' | 'yes_no';
  questionOrder?: number;
  options?: QuestionOption[];
  isRequired?: boolean;
  helpText?: string;
}

export const surveyService = {
  // 설문 테스트 목록 조회
  async getAllPsychTests(): Promise<PsychTest[]> {
    return apiClient.get<PsychTest[]>('/admin/psych-tests');
  },

  // 설문 테스트 상세 조회
  async getPsychTestById(testId: number): Promise<PsychTestDetail> {
    return apiClient.get<PsychTestDetail>(`/admin/psych-tests/${testId}`);
  },

  // 설문 문항 목록 조회
  async getAllPsychQuestions(testId?: number): Promise<PsychQuestion[]> {
    const params = testId ? `?testId=${testId}` : '';
    return apiClient.get<PsychQuestion[]>(`/admin/psych-questions${params}`);
  },

  // 설문 문항 생성
  async createPsychQuestion(questionData: CreateQuestionRequest): Promise<PsychQuestion> {
    return apiClient.post<PsychQuestion>('/admin/psych-questions', questionData);
  },

  // 설문 문항 수정
  async updatePsychQuestion(questionId: number, questionData: UpdateQuestionRequest): Promise<PsychQuestion> {
    return apiClient.put<PsychQuestion>(`/admin/psych-questions/${questionId}`, questionData);
  },

  // 설문 문항 삭제
  async deletePsychQuestion(questionId: number): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/psych-questions/${questionId}`);
  }
};