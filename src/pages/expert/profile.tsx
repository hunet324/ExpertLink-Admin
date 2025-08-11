import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface ExpertProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialization: string[];
  experience: number;
  education: string[];
  certifications: string[];
  bio: string;
  profileImage?: string;
  availableHours: {
    [key: string]: { start: string; end: string; }[];
  };
  consultation: {
    video: boolean;
    chat: boolean;
    voice: boolean;
  };
  pricing: {
    video: number;
    chat: number;
    voice: number;
  };
  isActive: boolean;
  joinDate: string;
}

const ExpertProfilePage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'consultation' | 'security'>('basic');

  // 전문가 프로필 샘플 데이터
  const [profile, setProfile] = useState<ExpertProfile>({
    id: 'expert_001',
    name: '김상담사',
    email: 'kim.counselor@expertlink.com',
    phone: '010-1234-5678',
    licenseNumber: '임상심리사 1급 제2024-001호',
    specialization: ['우울/불안', '대인관계', '학습상담', 'ADHD'],
    experience: 8,
    education: [
      '서울대학교 심리학과 학사',
      '연세대학교 임상심리학 석사',
      '고려대학교 임상심리학 박사'
    ],
    certifications: [
      '임상심리사 1급',
      '정신건강임상심리사',
      '학습치료사',
      'CBT 인증 치료사'
    ],
    bio: '안녕하세요. 8년간 임상 현장에서 다양한 내담자들과 함께 성장해온 김상담사입니다.\n\n주로 우울, 불안, 대인관계 문제를 전문으로 하며, 인지행동치료(CBT)와 수용전념치료(ACT) 접근법을 활용하여 내담자 개개인에게 맞는 맞춤형 상담을 제공합니다.\n\n따뜻하고 안전한 상담 환경에서 내담자의 이야기에 귀 기울이며, 함께 문제를 해결해나가는 것을 가장 중요하게 생각합니다.',
    availableHours: {
      'monday': [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '18:00' }
      ],
      'tuesday': [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '18:00' }
      ],
      'wednesday': [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' }
      ],
      'thursday': [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '18:00' }
      ],
      'friday': [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '16:00' }
      ],
      'saturday': [],
      'sunday': []
    },
    consultation: {
      video: true,
      chat: true,
      voice: true
    },
    pricing: {
      video: 80000,
      chat: 50000,
      voice: 60000
    },
    isActive: true,
    joinDate: '2023-03-15'
  });

  const [tempProfile, setTempProfile] = useState<ExpertProfile>({ ...profile });

  const dayNames = {
    'monday': '월요일',
    'tuesday': '화요일',
    'wednesday': '수요일',
    'thursday': '목요일',
    'friday': '금요일',
    'saturday': '토요일',
    'sunday': '일요일'
  };

  const handleSave = async () => {
    if (confirm('변경사항을 저장하시겠습니까?')) {
      setProfile({ ...tempProfile });
      setIsEditing(false);
      console.log('프로필 업데이트:', tempProfile);
      alert('프로필이 성공적으로 업데이트되었습니다.');
    }
  };

  const handleCancel = () => {
    if (confirm('변경사항을 취소하시겠습니까?')) {
      setTempProfile({ ...profile });
      setIsEditing(false);
    }
  };

  const handleImageUpload = () => {
    // 프로필 이미지 업로드 로직
    console.log('이미지 업로드');
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* 프로필 이미지 및 기본 정보 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">기본 정보</h3>
        
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {profile.name.charAt(0)}
            </div>
            {isEditing && (
              <button
                onClick={handleImageUpload}
                className="mt-2 w-full bg-background-200 text-secondary-600 px-3 py-2 rounded-lg text-caption hover:bg-background-300 transition-colors"
              >
                사진 변경
              </button>
            )}
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-caption text-secondary-400 block mb-1">이름</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                />
              ) : (
                <div className="text-body text-secondary-700">{profile.name}</div>
              )}
            </div>
            
            <div>
              <label className="text-caption text-secondary-400 block mb-1">이메일</label>
              {isEditing ? (
                <input
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                />
              ) : (
                <div className="text-body text-secondary-700">{profile.email}</div>
              )}
            </div>
            
            <div>
              <label className="text-caption text-secondary-400 block mb-1">전화번호</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                />
              ) : (
                <div className="text-body text-secondary-700">{profile.phone}</div>
              )}
            </div>
            
            <div>
              <label className="text-caption text-secondary-400 block mb-1">자격증 번호</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfile.licenseNumber}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                />
              ) : (
                <div className="text-body text-secondary-700">{profile.licenseNumber}</div>
              )}
            </div>
            
            <div>
              <label className="text-caption text-secondary-400 block mb-1">경력</label>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={tempProfile.experience}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
                    className="w-20 border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                  />
                  <span className="text-body text-secondary-700">년</span>
                </div>
              ) : (
                <div className="text-body text-secondary-700">{profile.experience}년</div>
              )}
            </div>
            
            <div>
              <label className="text-caption text-secondary-400 block mb-1">가입일</label>
              <div className="text-body text-secondary-700">
                {new Date(profile.joinDate).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전문분야 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">전문분야</h3>
        
        {isEditing ? (
          <div>
            <input
              type="text"
              placeholder="전문분야를 쉼표로 구분하여 입력하세요"
              value={tempProfile.specialization.join(', ')}
              onChange={(e) => setTempProfile(prev => ({ 
                ...prev, 
                specialization: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              }))}
              className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.specialization.map((spec, index) => (
              <span key={index} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-caption">
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 학력 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">학력</h3>
        
        {isEditing ? (
          <div className="space-y-2">
            {tempProfile.education.map((edu, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={edu}
                  onChange={(e) => {
                    const newEducation = [...tempProfile.education];
                    newEducation[index] = e.target.value;
                    setTempProfile(prev => ({ ...prev, education: newEducation }));
                  }}
                  className="flex-1 border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                />
                <button
                  onClick={() => {
                    const newEducation = tempProfile.education.filter((_, i) => i !== index);
                    setTempProfile(prev => ({ ...prev, education: newEducation }));
                  }}
                  className="text-error hover:text-error-600"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              onClick={() => setTempProfile(prev => ({ 
                ...prev, 
                education: [...prev.education, ''] 
              }))}
              className="text-primary hover:text-primary-600 text-caption"
            >
              + 학력 추가
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {profile.education.map((edu, index) => (
              <li key={index} className="text-body text-secondary-700 flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                {edu}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 자격증 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">자격증</h3>
        
        {isEditing ? (
          <div className="space-y-2">
            {tempProfile.certifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => {
                    const newCertifications = [...tempProfile.certifications];
                    newCertifications[index] = e.target.value;
                    setTempProfile(prev => ({ ...prev, certifications: newCertifications }));
                  }}
                  className="flex-1 border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                />
                <button
                  onClick={() => {
                    const newCertifications = tempProfile.certifications.filter((_, i) => i !== index);
                    setTempProfile(prev => ({ ...prev, certifications: newCertifications }));
                  }}
                  className="text-error hover:text-error-600"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              onClick={() => setTempProfile(prev => ({ 
                ...prev, 
                certifications: [...prev.certifications, ''] 
              }))}
              className="text-primary hover:text-primary-600 text-caption"
            >
              + 자격증 추가
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {profile.certifications.map((cert, index) => (
              <div key={index} className="bg-accent-50 border border-accent-200 rounded-lg p-3">
                <span className="text-accent-700 text-body">{cert}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 소개글 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">소개글</h3>
        
        {isEditing ? (
          <textarea
            value={tempProfile.bio}
            onChange={(e) => setTempProfile(prev => ({ ...prev, bio: e.target.value }))}
            rows={6}
            className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300 resize-none"
            placeholder="상담사 소개글을 작성해주세요..."
          />
        ) : (
          <div className="text-body text-secondary-700 whitespace-pre-wrap leading-relaxed">
            {profile.bio}
          </div>
        )}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="bg-white rounded-custom shadow-soft p-6">
      <h3 className="text-h4 font-semibold text-secondary mb-4">상담 가능 시간</h3>
      
      <div className="space-y-4">
        {Object.entries(dayNames).map(([day, dayName]) => (
          <div key={day} className="flex items-center space-x-4">
            <div className="w-20 text-body text-secondary-700">{dayName}</div>
            <div className="flex-1">
              {profile.availableHours[day].length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.availableHours[day].map((time, index) => (
                    <span key={index} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-caption">
                      {time.start} - {time.end}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-secondary-400 text-caption">휴무</span>
              )}
            </div>
            {isEditing && (
              <button className="bg-background-200 text-secondary-600 px-3 py-1 rounded text-xs hover:bg-background-300 transition-colors">
                편집
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderConsultation = () => (
    <div className="space-y-6">
      {/* 상담 방식 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">제공 상담 방식</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'video', icon: '🎥', name: '화상 상담', price: profile.pricing.video },
            { key: 'chat', icon: '💭', name: '채팅 상담', price: profile.pricing.chat },
            { key: 'voice', icon: '🎧', name: '음성 상담', price: profile.pricing.voice }
          ].map((method) => (
            <div key={method.key} className="border border-background-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{method.icon}</span>
                  <span className="text-body font-medium text-secondary-700">{method.name}</span>
                </div>
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={tempProfile.consultation[method.key as keyof typeof tempProfile.consultation]}
                    onChange={(e) => setTempProfile(prev => ({
                      ...prev,
                      consultation: {
                        ...prev.consultation,
                        [method.key]: e.target.checked
                      }
                    }))}
                    className="w-4 h-4"
                  />
                ) : (
                  <span className={`px-2 py-1 rounded text-xs ${
                    profile.consultation[method.key as keyof typeof profile.consultation]
                      ? 'bg-accent text-white'
                      : 'bg-background-300 text-secondary-500'
                  }`}>
                    {profile.consultation[method.key as keyof typeof profile.consultation] ? 'ON' : 'OFF'}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-caption text-secondary-400">상담료</div>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={tempProfile.pricing[method.key as keyof typeof tempProfile.pricing]}
                      onChange={(e) => setTempProfile(prev => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          [method.key]: parseInt(e.target.value)
                        }
                      }))}
                      className="flex-1 border border-background-300 rounded px-2 py-1 text-caption focus:outline-none focus:border-primary-300"
                    />
                    <span className="text-caption text-secondary-600">원</span>
                  </div>
                ) : (
                  <div className="text-h4 font-bold text-primary">{formatPrice(method.price)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 상담사 상태 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">상담사 상태</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-body text-secondary-700 mb-1">현재 상태</div>
            <div className="text-caption text-secondary-500">
              {profile.isActive ? '상담 가능 상태입니다.' : '현재 상담을 받지 않고 있습니다.'}
            </div>
          </div>
          
          {isEditing ? (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={tempProfile.isActive}
                onChange={(e) => setTempProfile(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-caption">상담 가능</span>
            </label>
          ) : (
            <span className={`px-4 py-2 rounded-lg text-caption font-medium ${
              profile.isActive
                ? 'bg-accent text-white'
                : 'bg-error text-white'
            }`}>
              {profile.isActive ? '상담 가능' : '상담 불가'}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* 비밀번호 변경 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">비밀번호 변경</h3>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-caption text-secondary-400 block mb-1">현재 비밀번호</label>
            <input
              type="password"
              className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
            />
          </div>
          
          <div>
            <label className="text-caption text-secondary-400 block mb-1">새 비밀번호</label>
            <input
              type="password"
              className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
            />
          </div>
          
          <div>
            <label className="text-caption text-secondary-400 block mb-1">새 비밀번호 확인</label>
            <input
              type="password"
              className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
            />
          </div>
          
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors">
            비밀번호 변경
          </button>
        </div>
      </div>

      {/* 계정 보안 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">계정 보안</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-body text-secondary-700">2단계 인증</div>
              <div className="text-caption text-secondary-400">추가 보안을 위해 2단계 인증을 활성화하세요</div>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors">
              설정
            </button>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-body text-secondary-700">로그인 알림</div>
              <div className="text-caption text-secondary-400">새로운 기기에서 로그인 시 알림을 받습니다</div>
            </div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-caption">활성화</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="expert" 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">⚙️</span>
                프로필 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                개인 정보와 상담 설정을 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                >
                  프로필 편집
                </button>
              )}

              {/* 알림 및 프로필 */}
              <button className="relative p-2 text-secondary-400 hover:text-secondary-600 hover:bg-background-100 rounded-lg transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">김</span>
                </div>
                <span className="text-body text-secondary-600">김상담사님</span>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* 탭 메뉴 */}
            <div className="bg-white rounded-custom shadow-soft mb-6">
              <div className="flex border-b border-background-200">
                {[
                  { key: 'basic', label: '기본 정보', icon: '👤' },
                  { key: 'schedule', label: '일정 관리', icon: '📅' },
                  { key: 'consultation', label: '상담 설정', icon: '💬' },
                  { key: 'security', label: '보안 설정', icon: '🔒' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 px-6 py-4 text-caption font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'text-primary border-b-2 border-primary bg-primary-25'
                        : 'text-secondary-600 hover:text-primary hover:bg-background-50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 탭 콘텐츠 */}
            <div>
              {activeTab === 'basic' && renderBasicInfo()}
              {activeTab === 'schedule' && renderSchedule()}
              {activeTab === 'consultation' && renderConsultation()}
              {activeTab === 'security' && renderSecurity()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExpertProfilePage;