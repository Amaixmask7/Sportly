import { useState, useMemo } from 'react';
import { useInvitations } from './useInvitations';

export const useInvitationFilters = () => {
  const { data: allInvitations = [], isLoading, error } = useInvitations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  const filteredInvitations = useMemo(() => {
    let filtered = allInvitations;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invitation => 
        invitation.venue.toLowerCase().includes(query) ||
        invitation.Sports?.Sport_name.toLowerCase().includes(query) ||
        invitation.note?.toLowerCase().includes(query)
      );
    }

    // Sport filter
    if (selectedSport !== 'all') {
      filtered = filtered.filter(invitation => invitation.sport_id === selectedSport);
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(invitation => {
        const invitationDate = new Date(invitation.start_at);
        
        switch (selectedDateRange) {
          case 'today':
            return invitationDate >= today && invitationDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case 'tomorrow':
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            return invitationDate >= tomorrow && invitationDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
          case 'this-week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
            return invitationDate >= startOfWeek && invitationDate < endOfWeek;
          case 'next-week':
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
            const nextWeekEnd = new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            return invitationDate >= nextWeekStart && invitationDate < nextWeekEnd;
          case 'this-month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            return invitationDate >= startOfMonth && invitationDate < endOfMonth;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allInvitations, searchQuery, selectedSport, selectedDateRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSport('all');
    setSelectedDateRange('all');
  };

  return {
    invitations: filteredInvitations,
    isLoading,
    error,
    searchQuery,
    selectedSport,
    selectedDateRange,
    setSearchQuery,
    setSelectedSport,
    setSelectedDateRange,
    clearFilters,
    hasActiveFilters: searchQuery || selectedSport !== 'all' || selectedDateRange !== 'all'
  };
};
