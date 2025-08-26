// 분기 로직 관리 API 서비스

import { apiClient } from './api';

export interface LogicRule {
  id: number;
  testId: number;
  name: string;
  description?: string;
  sourceQuestionId: number;
  condition: {
    type: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
    value: string | number | string[] | { min: number; max: number };
    operator?: 'and' | 'or';
  };
  action: {
    type: 'show_question' | 'hide_question' | 'jump_to_question' | 'end_survey' | 'show_message';
    targetQuestionId?: number;
    message?: string;
  };
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogicRuleRequest {
  testId: number;
  name: string;
  description?: string;
  sourceQuestionId: number;
  condition: LogicRule['condition'];
  action: LogicRule['action'];
  priority: number;
  isActive?: boolean;
}

export interface UpdateLogicRuleRequest {
  name?: string;
  description?: string;
  sourceQuestionId?: number;
  condition?: LogicRule['condition'];
  action?: LogicRule['action'];
  priority?: number;
  isActive?: boolean;
}

export const logicService = {
  // 분기 로직 목록 조회
  async getAllLogicRules(testId?: number): Promise<LogicRule[]> {
    const params = testId ? `?testId=${testId}` : '';
    return apiClient.get<LogicRule[]>(`/admin/logic-rules${params}`);
  },

  // 분기 로직 상세 조회
  async getLogicRuleById(ruleId: number): Promise<LogicRule> {
    return apiClient.get<LogicRule>(`/admin/logic-rules/${ruleId}`);
  },

  // 분기 로직 생성
  async createLogicRule(ruleData: CreateLogicRuleRequest): Promise<LogicRule> {
    return apiClient.post<LogicRule>('/admin/logic-rules', ruleData);
  },

  // 분기 로직 수정
  async updateLogicRule(ruleId: number, ruleData: UpdateLogicRuleRequest): Promise<LogicRule> {
    return apiClient.put<LogicRule>(`/admin/logic-rules/${ruleId}`, ruleData);
  },

  // 분기 로직 삭제
  async deleteLogicRule(ruleId: number): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/logic-rules/${ruleId}`);
  },

  // 분기 로직 활성/비활성 토글
  async toggleLogicRuleStatus(ruleId: number): Promise<LogicRule> {
    return apiClient.patch<LogicRule>(`/admin/logic-rules/${ruleId}/toggle`);
  }
};