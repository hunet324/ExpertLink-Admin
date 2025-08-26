// 센터 선택 드롭다운 컴포넌트

import React, { useState, useEffect } from 'react';
import { UserType } from '@/types/user';
import { centerService, Center } from '@/services/center';

interface CenterSelectorProps {
  userType: UserType;
  currentCenterId?: number;
  onCenterChange: (centerId: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
  showAllOption?: boolean;
  className?: string;
}

const CenterSelector: React.FC<CenterSelectorProps> = ({
  userType,
  currentCenterId,
  onCenterChange,
  disabled = false,
  placeholder = '센터를 선택하세요',
  showAllOption = false,
  className = ''
}) => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(currentCenterId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 관리 가능한 센터 목록 조회
  useEffect(() => {
    const fetchCenters = async () => {
      // 직원은 센터 선택 불가 (자신의 센터만)
      if (userType === 'staff') {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const managedCenters = await centerService.getManagedCenters();
        setCenters(managedCenters);
        
        // 현재 센터가 설정되지 않았고, 센터가 하나만 있으며, showAllOption이 false인 경우에만 자동 선택
        if (!currentCenterId && managedCenters.length === 1 && !showAllOption) {
          const centerId = managedCenters[0].id;
          setSelectedCenterId(centerId);
          onCenterChange(centerId);
        }
      } catch (err) {
        console.error('센터 목록 조회 실패:', err);
        setError('센터 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [userType, currentCenterId, onCenterChange, showAllOption]);

  // 센터 변경 핸들러
  const handleCenterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const centerId = value === '' ? null : parseInt(value);
    setSelectedCenterId(centerId);
    onCenterChange(centerId);
  };

  // 직원은 센터 선택 불가
  if (userType === 'staff') {
    return null;
  }

  // 센터가 하나뿐이고 showAllOption이 false인 경우에만 드롭다운 숨김
  if (centers.length <= 1 && !showAllOption) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedCenterId || ''}
        onChange={handleCenterChange}
        disabled={disabled || loading}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${error ? 'border-red-300' : ''}
        `}
      >
        {!showAllOption && (
          <option value="">{loading ? '로딩 중...' : placeholder}</option>
        )}
        
        {showAllOption && (
          <option value="">전체 센터</option>
        )}
        
        {centers.map(center => (
          <option key={center.id} value={center.id}>
            {center.name}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {loading && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default CenterSelector;