
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { AgentStatus } from '../../types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatContext } from '../../context/chatContext';


const UserAvatar = () => {

    const { userFormData } = useChatContext();

    // Get initials for avatar fallback
    const getInitials = () => {
        const name = userFormData?.name;
        if (!name || name.trim() === '') return '';

        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Get fallback background color based on name
    const getFallbackColor = () => {
        const name = userFormData?.name;
        const colorOptions = [
            'bg-blue-100 text-blue-600',
            'bg-green-100 text-green-600',
            'bg-purple-100 text-purple-600',
            'bg-amber-100 text-amber-600',
            'bg-pink-100 text-pink-600',
            'bg-indigo-100 text-indigo-600',
            'bg-rose-100 text-rose-600'
        ];

        if (!name || name.trim() === '') {
            return 'bg-gray-100 text-gray-500';
        }

        // Deterministic color selection based on name
        const charSum = name
            .split('')
            .reduce((sum, char) => sum + char.charCodeAt(0), 0);

        return colorOptions[charSum % colorOptions.length];
    };

    // Check if we should show initials fallback
    const showInitials = getInitials().length > 0;

    return (
        <div className={`relative flex-shrink-0`}>
            <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage
                    src={userFormData?.avatar}
                    alt={userFormData?.name || "User"}
                    onError={(e) => {
                        setImageError(true);
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </Avatar>
        </div>
    );
};

export default UserAvatar;
