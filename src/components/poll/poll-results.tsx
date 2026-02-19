'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useVotingStore, Poll } from '@/lib/voting-store';
import { ArrowLeft, Users, Calendar, Coins, Trophy } from 'lucide-react';

interface PollResultsProps {
  pollId: string;
  onBack: () => void;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF6B6B', '#6B66FF', '#00C4CC'
];

export function PollResults({ pollId, onBack }: PollResultsProps) {
  const { polls, votes } = useVotingStore();
  const poll = polls.find(p => p.id === pollId);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const chartData = useMemo(() => {
    if (!poll) return [];
    return poll.options.map((option, index) => ({
      name: option.text.length > 15 ? option.text.slice(0, 15) + '...' : option.text,
      fullName: option.text,
      value: option.votes,
      percentage: poll.totalVotes > 0 ? ((option.votes / poll.totalVotes) * 100).toFixed(1) : '0',
      color: COLORS[index % COLORS.length],
    }));
  }, [poll]);

  const pollVotes = useMemo(() => {
    return votes.filter(v => v.pollId === pollId);
  }, [votes, pollId]);

  const isActive = poll ? Date.now() >= poll.startTime && Date.now() <= poll.endTime : false;
  const isEnded = poll ? Date.now() > poll.endTime : false;

  const winningOption = useMemo(() => {
    if (!poll || poll.totalVotes === 0) return null;
    return poll.options.reduce((prev, current) => 
      current.votes > prev.votes ? current : prev
    );
  }, [poll]);

  if (!poll) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Poll not found</p>
          <Button variant="outline" className="mt-4" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Polls
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getTimeRemaining = () => {
    if (isEnded) return 'Poll ended';
    if (!isActive) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{poll.question}</h2>
          {poll.description && (
            <p className="text-muted-foreground mt-1">{poll.description}</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{poll.totalVotes}</p>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold">{getTimeRemaining()}</p>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{poll.minTokenBalance}</p>
                <p className="text-sm text-muted-foreground">Min. Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-bold truncate">
                  {winningOption ? winningOption.text : 'No votes yet'}
                </p>
                <p className="text-sm text-muted-foreground">Leading</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Results Distribution</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                Pie
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                Bar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {poll.totalVotes > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} votes`, name]} />
                    <Legend />
                  </PieChart>
                ) : (
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(value) => [`${value} votes`]} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No votes have been cast yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>Vote breakdown by option</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {poll.options.map((option, index) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{option.text}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{option.votes}</span>
                  <span className="text-muted-foreground ml-2">
                    ({poll.totalVotes > 0 ? ((option.votes / poll.totalVotes) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0}
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Poll Info */}
      <Card>
        <CardHeader>
          <CardTitle>Poll Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">App ID</span>
            <span className="font-mono">{poll.appId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(poll.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start Time</span>
            <span>{new Date(poll.startTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End Time</span>
            <span>{new Date(poll.endTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={isActive ? 'default' : isEnded ? 'destructive' : 'secondary'}>
              {isActive ? 'Active' : isEnded ? 'Ended' : 'Upcoming'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
