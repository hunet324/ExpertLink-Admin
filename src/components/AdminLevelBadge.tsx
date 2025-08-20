// 관리자 등급 표시 배지 컴포넌트

import React from 'react';
import { UserType } from '@/types/user';
import { getAdminLevelText, getPermissionLevelColor } from '@/utils/permissions';

interface AdminLevelBadgeProps {
  userType: UserType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const AdminLevelBadge: React.FC<AdminLevelBadgeProps> = ({
  userType,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const levelText = getAdminLevelText(userType);
  const colorClass = getPermissionLevelColor(userType);
  
  // 아이콘 매핑
  const getIcon = (userType: UserType) => {
    const icons = {
      'super_admin': '👑',
      'regional_manager': '🏢',
      'center_manager': '🏪',
      'staff': '👤',
      'expert': '👨‍⚕️',
      'general': '👥'
    };
    return icons[userType] || '👤';
  };

  // 크기별 스타일
  const sizeClasses = {
    'sm': 'px-2 py-1 text-xs',
    'md': 'px-3 py-1 text-sm',
    'lg': 'px-4 py-2 text-base'
  };

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-medium
      ${colorClass} 
      ${sizeClasses[size]} 
      ${className}
    `}>
      {showIcon && (
        <span className="text-sm" role="img" aria-label={levelText}>
          {getIcon(userType)}
        </span>
      )}
      <span>{levelText}</span>
    </span>
  );
};

export default AdminLevelBadge;