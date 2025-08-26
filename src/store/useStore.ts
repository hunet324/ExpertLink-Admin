import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Center, Permission } from '@/types/user';
import { AuthState, LoginDto, RegisterDto } from '@/types/auth';
import { authService } from '@/services/auth';
import { tokenManager } from '@/services/api';
import { generateUserPermissions, getUserType } from '@/utils/permissions';

interface AppState extends AuthState {
  // UI 상태
  theme: 'light' | 'dark';
  
  // 센터 및 권한 상태
  currentCenter: Center | null;
  managedCenters: Center[];
  userPermissions: Permission | null;
  selectedCenterId: number | null;
  
  // 관리자 상태
  pendingExpertsCount: number;
  
  // 인증 액션
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<any>;
  registerAndLogin: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  getCurrentUser: (forceRefresh?: boolean) => Promise<void>;
  validateAuth: () => Promise<boolean>;
  
  // 사용자 액션
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (userData: Partial<User>) => void;
  
  // UI 액션
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  
  // 센터 및 권한 액션
  setCurrentCenter: (center: Center | null) => void;
  setManagedCenters: (centers: Center[]) => void;
  updateUserPermissions: () => void;
  setSelectedCenterId: (centerId: number | null) => void;
  
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
      (set, get) => {
        // 앱 초기화 시 localStorage에서 토큰 복원
        const initializeTokens = () => {
          if (typeof window !== 'undefined') {
            const accessToken = tokenManager.getAccessToken();
            const refreshToken = tokenManager.getRefreshToken();
            
            if (accessToken && refreshToken) {
              console.log('초기화 시 토큰 복원됨');
              return {
                accessToken: accessToken,
                refreshToken: refreshToken,
                isAuthenticated: true,
              };
            }
          }
          
          return {
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          };
        };

        const initialTokenState = initializeTokens();
        
        return {
          // 초기 상태
          user: null,
          ...initialTokenState,
          isLoading: false,
          theme: 'light',
          
          // 센터 및 권한 초기 상태
          currentCenter: null,
          managedCenters: [],
          userPermissions: null,
          selectedCenterId: null,
          
          pendingExpertsCount: 0,

          // 인증 액션
          login: async (credentials: LoginDto) => {
            try {
              set({ isLoading: true });
              
              const response = await authService.login(credentials);
              
              // Zustand 스토어와 tokenManager 동기화
              tokenManager.setTokens(response.accessToken, response.refreshToken);
              
              console.log('스토어에서 받은 로그인 응답:', response);
              
              // 사용자 정보가 있으면 바로 설정, 없으면 별도로 가져오기
              if (response.user) {
                set({
                  user: response.user,
                  accessToken: response.accessToken,
                  refreshToken: response.refreshToken,
                  isAuthenticated: true,
                  isLoading: false,
                });
              } else {
                console.log('사용자 정보가 없음, 별도로 가져오는 중...');
                
                // 토큰 먼저 설정
                set({
                  accessToken: response.accessToken,
                  refreshToken: response.refreshToken,
                  isAuthenticated: true,
                });
                
                // 토큰이 완전히 설정될 때까지 잠시 대기
                await new Promise(resolve => setTimeout(resolve, 100));
                
                try {
                  // 사용자 정보 별도 조회
                  console.log('토큰 설정 완료, 사용자 정보 조회 시작');
                  const user = await authService.getCurrentUser();
                  set({
                    user,
                    isLoading: false,
                  });
                } catch (userError) {
                  console.error('사용자 정보 조회 실패:', userError);
                  set({
                    user: null,
                    isLoading: false,
                  });
                }
              }
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
              
              // Zustand 스토어와 tokenManager 동기화
              tokenManager.setTokens(response.accessToken, response.refreshToken);
              
              set({
                user: response.user,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
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
              console.log('전역 상태에서 로그아웃 시작');
              
              // 서버에 로그아웃 요청
              await authService.logout();
              console.log('서버 로그아웃 성공');
              
              // 로컬 상태 초기화
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                // 관리자 및 센터 관련 상태 초기화
                pendingExpertsCount: 0,
                currentCenter: null,
                managedCenters: [],
                userPermissions: null,
                selectedCenterId: null,
              });
              console.log('로컬 상태 초기화 완료');
            } catch (error) {
              console.warn('서버 로그아웃 실패, 로컬 상태만 초기화:', error);
              // 로그아웃은 에러가 발생해도 로컬 상태는 초기화
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                // 관리자 및 센터 관련 상태 초기화
                pendingExpertsCount: 0,
                currentCenter: null,
                managedCenters: [],
                userPermissions: null,
                selectedCenterId: null,
              });
              // 에러를 다시 던지지 않음 (로그아웃은 항상 성공으로 처리)
            }
          },

          refreshAuthToken: async (): Promise<void> => {
            // 토큰 갱신 기능 제거 (무한루프 방지)
            throw new Error('토큰 갱신 기능이 제거되었습니다. 다시 로그인해주세요.');
          },

          getCurrentUser: async (forceRefresh: boolean = false) => {
            try {
              set({ isLoading: true });
              console.log('사용자 정보 조회 시작', forceRefresh ? '(강제 새로고침)' : '');
              
              const user = await authService.getCurrentUser(forceRefresh);
              console.log('조회된 사용자 정보:', user);
              
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (error) {
              console.error('사용자 정보 조회 실패:', error);
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
              // 토큰 자동 갱신 제거, 단순 유효성만 검사
              const isValid = await authService.validateAndRefreshToken();
              
              if (isValid) {
                // 토큰이 유효하면 사용자 정보 갱신
                await get().getCurrentUser();
                return true;
              } else {
                // 토큰이 만료되었으면 로그아웃 처리
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
            const userType = getUserType(user);
            const centerId = user.centerId || user.centerId;
            const supervisorId = user.supervisorId || user.supervisorId;
            
            // 권한 정보 자동 생성
            const permissions = userType ? generateUserPermissions(userType, centerId, supervisorId) : null;
            
            set({ 
              user, 
              isAuthenticated: true,
              userPermissions: permissions,
              selectedCenterId: centerId || null
            });
          },

          clearUser: () => {
            tokenManager.clearTokens();
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              // 관리자 및 센터 관련 상태도 초기화
              currentCenter: null,
              managedCenters: [],
              userPermissions: null,
              selectedCenterId: null,
              pendingExpertsCount: 0,
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
              accessToken: accessToken,
              refreshToken: refreshToken,
              isAuthenticated: true,
            });
          },

          clearTokens: () => {
            tokenManager.clearTokens();
            set({
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
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

          // 센터 및 권한 액션
          setCurrentCenter: (center: Center | null) => {
            set({ currentCenter: center });
          },

          setManagedCenters: (centers: Center[]) => {
            set({ managedCenters: centers });
          },

          updateUserPermissions: () => {
            const state = get();
            const user = state.user;
            if (user) {
              const userType = getUserType(user);
              const centerId = user.centerId || user.centerId;
              const supervisorId = user.supervisorId || user.supervisorId;
              
              if (userType) {
                const permissions = generateUserPermissions(userType, centerId, supervisorId);
                set({ userPermissions: permissions });
              }
            }
          },

          setSelectedCenterId: (centerId: number | null) => {
            set({ selectedCenterId: centerId });
          },
        };
      },
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