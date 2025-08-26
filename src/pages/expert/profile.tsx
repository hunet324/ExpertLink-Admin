import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { expertService, ExpertProfileResponse, UpdateExpertProfileRequest } from '@/services/expert';
import { useStore } from '@/store/useStore';

interface ExpertProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseType: string;
  specialization: string[];
  experience: number;
  hourlyRate: number;
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
  const { user } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'consultation' | 'security'>('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // 전문가 프로필 초기 데이터
  const [profile, setProfile] = useState<ExpertProfile>({
    id: 'expert_001',
    name: '김상담사',
    email: 'kim.counselor@expertlink.com',
    phone: '010-1234-5678',
    licenseNumber: '',
    licenseType: '',
    specialization: ['우울/불안', '대인관계', '학습상담', 'ADHD'],
    experience: 0,
    hourlyRate: 50000,
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

  // 프로필 데이터 로드
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response: ExpertProfileResponse = await expertService.getProfile();
      
      const profileData: ExpertProfile = {
        id: response.profile.id.toString(),
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        licenseNumber: response.profile.licenseNumber || '',
        licenseType: response.profile.licenseType || '',
        specialization: response.profile.specialization || [],
        experience: response.profile.yearsExperience || 0,
        hourlyRate: response.profile.hourlyRate || 50000,
        education: [],
        certifications: [],
        bio: response.profile.introduction || '',
        profileImage: undefined,
        availableHours: {
          'monday': [{ start: '09:00', end: '18:00' }],
          'tuesday': [{ start: '09:00', end: '18:00' }],
          'wednesday': [{ start: '09:00', end: '18:00' }],
          'thursday': [{ start: '09:00', end: '18:00' }],
          'friday': [{ start: '09:00', end: '18:00' }],
          'saturday': [],
          'sunday': []
        },
        consultation: {
          video: true,
          chat: true,
          voice: true
        },
        pricing: {
          video: response.profile.hourlyRate || 50000,
          chat: response.profile.hourlyRate || 50000,
          voice: response.profile.hourlyRate || 50000
        },
        isActive: true,
        joinDate: response.profile.createdAt
      };
      
      setProfile(profileData);
      setTempProfile(profileData);
      setError('');
    } catch (err: any) {
      console.error('프로필 조회 실패:', err);
      setError(err.message || '프로필을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

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
      let updateData: UpdateExpertProfileRequest | undefined;
      try {
        setSaving(true);
        
        updateData = {
          licenseNumber: tempProfile.licenseNumber,
          licenseType: tempProfile.licenseType,
          yearsExperience: tempProfile.experience,
          hourlyRate: tempProfile.hourlyRate,
          specialization: tempProfile.specialization,
          introduction: tempProfile.bio
        };
        
        console.group('🚀 Profile Update Process Started');
        console.log('Current profile:', profile);
        console.log('Temp profile changes:', tempProfile);
        console.log('Update data to be sent:', updateData);
        console.log('API Configuration:', {
          useProxy: process.env.NEXT_PUBLIC_USE_PROXY,
          apiUrl: process.env.NEXT_PUBLIC_API_URL
        });
        
        const response = await expertService.updateProfile(updateData);
        
        console.log('✅ Update successful, response:', response);
        console.groupEnd();
        
        setProfile({ ...tempProfile });
        setIsEditing(false);
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } catch (err: any) {
        console.group('❌ Profile Update Error');
        console.error('Error type:', err?.constructor?.name);
        console.error('Error message:', err?.message);
        console.error('Error object:', err);
        if (updateData) {
          console.error('Update data that failed:', updateData);
        }
        console.groupEnd();
        
        alert(err.message || '프로필 업데이트에 실패했습니다.');
      } finally {
        setSaving(false);
      }
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

  // 임시 API 테스트 함수 (디버깅용)
  const testApiConnection = async () => {
    console.group('🧪 Comprehensive API Connection Test');
    try {
      // 1. 기본 연결 테스트
      console.log('1. Testing basic connectivity...');
      const { networkDebugger } = await import('@/services/api');
      await networkDebugger.testConnectivity();
      
      // 2. 직접 API 테스트
      console.log('2. Testing direct API connection...');
      await networkDebugger.testWithDirectAPI();
      
      // 3. GET 요청으로 현재 프로필 조회 테스트
      console.log('3. Testing GET /experts/profile...');
      const getResponse = await expertService.getProfile();
      console.log('✅ GET request successful:', getResponse);

      // 4. 간단한 PUT 요청 테스트 (현재 데이터와 동일한 데이터로)
      console.log('4. Testing PUT /experts/profile...');
      const testData = {
        licenseNumber: profile.licenseNumber || '',
        licenseType: profile.licenseType || '',
        yearsExperience: profile.experience || 0,
        hourlyRate: profile.hourlyRate || 50000,
        specialization: profile.specialization || [],
        introduction: profile.bio || ''
      };
      console.log('Test data:', testData);
      
      const putResponse = await expertService.updateProfile(testData);
      console.log('✅ PUT request successful:', putResponse);
      
      alert('✅ API 종합 테스트 완료! 콘솔에서 상세 결과를 확인하세요.');
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      alert('❌ API 연결 테스트 실패. 콘솔에서 에러 상세를 확인하세요.');
    }
    console.groupEnd();
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
              <label className="text-caption text-secondary-400 block mb-1">자격증 종류</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfile.licenseType}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, licenseType: e.target.value }))}
                  className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                  placeholder="예: 임상심리사 1급"
                />
              ) : (
                <div className="text-body text-secondary-700">{profile.licenseType || '미설정'}</div>
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
                  placeholder="예: 제2024-001호"
                />
              ) : (
                <div className="text-body text-secondary-700">{profile.licenseNumber || '미설정'}</div>
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
      {/* 시간당 상담료 */}
      <div className="bg-white rounded-custom shadow-soft p-6 mb-6">
        <h3 className="text-h4 font-semibold text-secondary mb-4">시간당 상담료</h3>
        
        <div className="max-w-md">
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <input
                  type="number"
                  value={tempProfile.hourlyRate}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                  className="w-32 border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                  step="1000"
                />
                <span className="text-body text-secondary-700">원/시간</span>
              </>
            ) : (
              <div className="text-h3 font-bold text-primary">{formatPrice(profile.hourlyRate)}/시간</div>
            )}
          </div>
          <p className="text-caption text-secondary-500 mt-2">
            모든 상담 방식에 동일하게 적용됩니다.
          </p>
        </div>
      </div>

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

  if (loading) {
    return (
      <div className="flex h-screen bg-background-50">
        <Sidebar userType="expert"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-secondary-600">프로필을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar userType="expert"
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
              {/* 임시 디버그 버튼 */}
              <button
                onClick={testApiConnection}
                className="bg-yellow-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-yellow-600 transition-colors"
                title="API 연결 테스트 (디버깅용)"
              >
                🧪 API 테스트
              </button>
              
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
                    disabled={saving}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving && (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    )}
                    {saving ? '저장 중...' : '저장'}
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
                  <span className="text-white text-sm font-bold">{profile.name.charAt(0)}</span>
                </div>
                <span className="text-body text-secondary-600">{profile.name}님</span>
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