'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Vote, Calendar, Users, Coins, CheckCircle, Clock } from 'lucide-react';
import { useVotingStore, Poll } from '@/lib/voting-store';
import { useWallet } from '@txnlab/use-wallet-react';

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string) => void;
  onViewResults: (pollId: string) => void;
}

export function PollCard({ poll, onVote, onViewResults }: PollCardProps) {
  const { hasVoted } = useVotingStore();
  const { activeAccount } = useWallet();
  const userHasVoted = activeAccount ? hasVoted(poll.id, activeAccount.address) : false;
  const isActive = Date.now() >= poll.startTime && Date.now() <= poll.endTime;
  const isEnded = Date.now() > poll.endTime;
  const isUpcoming = Date.now() < poll.startTime;

  const canVote = !!activeAccount &&
    isActive &&
    !userHasVoted;
  // TODO: Add real balance check
  // && wallet.tokenBalance >= poll.minTokenBalance;

  const getStatusBadge = () => {
    if (isEnded) return <Badge variant="destructive">Ended</Badge>;
    if (isUpcoming) return <Badge variant="secondary">Upcoming</Badge>;
    if (isActive) return <Badge variant="default" className="bg-green-500">Active</Badge>;
    return null;
  };

  const getTimeRemaining = () => {
    if (isEnded) return 'Poll ended';
    if (isUpcoming) {
      const diff = poll.startTime - Date.now();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `Starts in ${days}d ${hours}h`;
    }

    const diff = poll.endTime - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const leadingOption = poll.options.reduce((prev, current) =>
    current.votes > prev.votes ? current : prev
  );

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{poll.question}</CardTitle>
            {poll.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {poll.description}
              </CardDescription>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{poll.totalVotes} votes</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="truncate">{getTimeRemaining()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>{poll.minTokenBalance} CAMPUS</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Vote className="h-4 w-4" />
            <span>{poll.options.length} options</span>
          </div>
        </div>

        {/* Leading Option (if has votes) */}
        {poll.totalVotes > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Leading:</span>
              <span className="font-medium">{leadingOption.text}</span>
            </div>
            <Progress
              value={(leadingOption.votes / poll.totalVotes) * 100}
              className="h-2"
            />
          </div>
        )}

        {/* Voting Status */}
        {userHasVoted && (
          <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>You have voted on this poll</span>
          </div>
        )}

        {/* Eligibility Warning */}
        {/* {activeAccount && isActive && !userHasVoted && wallet.tokenBalance < poll.minTokenBalance && (
          <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
            <Coins className="h-4 w-4" />
            <span>Insufficient token balance to vote</span>
          </div>
        )} */}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {canVote && (
            <Button
              className="flex-1"
              onClick={() => onVote(poll.id)}
            >
              <Vote className="h-4 w-4 mr-2" />
              Vote Now
            </Button>
          )}
          <Button
            variant="outline"
            className={canVote ? "" : "flex-1"}
            onClick={() => onViewResults(poll.id)}
          >
            View Results
          </Button>
        </div>

        {/* App ID */}
        <div className="text-xs text-muted-foreground pt-1">
          App ID: {poll.appId}
        </div>
      </CardContent>
    </Card>
  );
}
