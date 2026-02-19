'use client';

import { useMemo } from 'react';
import { useVotingStore } from '@/lib/voting-store';
import { PollCard } from './poll-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface PollListProps {
  onVote: (pollId: string) => void;
  onViewResults: (pollId: string) => void;
}

export function PollList({ onVote, onViewResults }: PollListProps) {
  const { polls } = useVotingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended' | 'upcoming'>('all');

  const filteredPolls = useMemo(() => {
    let filtered = polls;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(poll =>
        poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poll.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = Date.now();
      filtered = filtered.filter(poll => {
        if (statusFilter === 'active') {
          return now >= poll.startTime && now <= poll.endTime;
        }
        if (statusFilter === 'ended') {
          return now > poll.endTime;
        }
        if (statusFilter === 'upcoming') {
          return now < poll.startTime;
        }
        return true;
      });
    }

    // Sort by creation date (newest first)
    return [...filtered].sort((a, b) => b.createdAt - a.createdAt);
  }, [polls, searchQuery, statusFilter]);

  const activeCount = polls.filter(p => Date.now() >= p.startTime && Date.now() <= p.endTime).length;

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Polls</SelectItem>
            <SelectItem value="active">Active ({activeCount})</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Polls Grid */}
      {filteredPolls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPolls.map(poll => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={onVote}
              onViewResults={onViewResults}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">No polls found</div>
          <p className="text-sm text-muted-foreground mt-1">
            {polls.length === 0 
              ? 'Create your first poll to get started'
              : 'Try adjusting your search or filter'}
          </p>
        </div>
      )}
    </div>
  );
}
