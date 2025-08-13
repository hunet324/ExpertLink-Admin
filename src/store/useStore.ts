import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { AuthState, LoginDto, RegisterDto } from '@/types/auth';
import { authService } from '@/services/auth';
import { tokenManager } from '@/services/api';

interface AppState extends AuthState {
  // UI 상태
  theme: 'light' | 'dark';
  
  // 관리자 상태
  pendingExpertsCount: number;
  
  // 인증 액션
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<any>;
  registerAndLogin: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  validateAuth: () => Promise<boolean>;
  
  // 사용자 액션
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (userData: Partial<User>) => void;
  
  // UI 액션
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  
  // 관리자 액션
  setPendingExpertsCount: (count: number) => void;
  decrementPendingExpertsCount: () => void;
  
  // 토큰 액션
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
}

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        user: null,
        access_token: null,
        refresh_token: null,
        isAuthenticated: false,
        isLoading: false,
        theme: 'light',
        pendingExpertsCount: 0,

        // 인증 액션
        login: async (credentials: LoginDto) => {
          try {
            set({ isLoading: true });
            
            const response = await authService.login(credentials);
            
            set({
              user: response.user,
              access_token: response.access_token,
              refresh_token: response.refresh_token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        register: async (userData: RegisterDto) => {
          try {
            set({ isLoading: true });
            
            const response = await authService.register(userData);
            
            // 회원가입 후 로그인 상태로 만들지 않음 (승인 대기)
            set({
              isLoading: false,
            });
            
            return response;
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        registerAndLogin: async (userData: RegisterDto) => {
          try {
            set({ isLoading: true });
            
            const response = await authService.registerAndLogin(userData);
            
            set({
              user: response.user,
              access_token: response.access_token,
              refresh_token: response.refresh_token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          try {
            set({ isLoading: true });
            
            await authService.logout();
            
            set({
              user: null,
              access_token: null,
              refresh_token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          } catch (error) {
            // 로그아웃은 에러가 발생해도 로컬 상태는 초기화
            set({
              user: null,
              access_token: null,
              refresh_token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            throw error;
          }
        },

        refreshToken: async () => {
          try {
            const response = await authService.refreshToken();
            
            set({
              access_token: response.access_token,
              refresh_token: response.refresh_token,
            });
          } catch (error) {
            // 토큰 갱신 실패 시 로그아웃 처리
            get().logout();
            throw error;
          }
        },

        getCurrentUser: async () => {
          try {
            set({ isLoading: true });
            
            const user = await authService.getCurrentUser();
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            throw error;
          }
        },

        validateAuth: async () => {
          try {
            const isValid = await authService.validateAndRefreshToken();
            
            if (isValid) {
              // 토큰이 유효하면 사용자 정보 갱신
              await get().getCurrentUser();
              return true;
            } else {
              // 토큰이 유효하지 않으면 로그아웃 처리
              get().clearUser();
              return false;
            }
          } catch (error) {
            get().clearUser();
            return false;
          }
        },

        // 사용자 액션
        setUser: (user: User) => {
          set({ 
            user, 
            isAuthenticated: true 
          });
        },

        clearUser: () => {
          tokenManager.clearTokens();
          set({
            user: null,
            access_token: null,
            refresh_token: null,
            isAuthenticated: false,
          });
        },

        updateUser: (userData: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, ...userData }
            });
          }
        },

        // UI 액션
        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        toggleTheme: () => {
          set((state) => ({ 
            theme: state.theme === 'light' ? 'dark' : 'light' 
          }));
        },

        // 토큰 액션
        setTokens: (accessToken: string, refreshToken: string) => {
          tokenManager.setTokens(accessToken, refreshToken);
          set({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        },

        clearTokens: () => {
          tokenManager.clearTokens();
          set({
            access_token: null,
            refresh_token: null,
          });
        },

        // 관리자 액션
        setPendingExpertsCount: (count: number) => {
          set({ pendingExpertsCount: count });
        },

        decrementPendingExpertsCount: () => {
          set((state) => ({ 
            pendingExpertsCount: Math.max(0, state.pendingExpertsCount - 1) 
          }));
        },
      }),
      {
        name: 'expertlink-auth-store',
        // 민감한 토큰 정보는 localStorage에 저장하지 않음
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'expertlink-store'
    }
  )
);