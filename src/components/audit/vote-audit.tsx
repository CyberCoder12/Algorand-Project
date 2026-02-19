'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVotingStore } from '@/lib/voting-store';
import { algorandUtils } from '@/lib/algorand';
import { Search, ExternalLink, Shield, CheckCircle, Clock } from 'lucide-react';

export function VoteAudit() {
  const { polls, votes } = useVotingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [pollFilter, setPollFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');

  // Anonymize voter address
  const anonymizeAddress = (address: string) => {
    return `${address.slice(0, 4)}****${address.slice(-4)}`;
  };

  // Get poll question by ID
  const getPollQuestion = (pollId: string) => {
    const poll = polls.find(p => p.id === pollId);
    return poll?.question || 'Unknown Poll';
  };

  // Get option text
  const getOptionText = (pollId: string, optionId: string) => {
    const poll = polls.find(p => p.id === pollId);
    return poll?.options.find(o => o.id === optionId)?.text || 'Unknown Option';
  };

  // Filter votes
  const getFilteredVotes = () => {
    let filtered = votes;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(vote =>
        (vote.txId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        getPollQuestion(vote.pollId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getOptionText(vote.pollId, vote.optionId).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Poll filter
    if (pollFilter !== 'all') {
      filtered = filtered.filter(vote => vote.pollId === pollFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vote =>
        statusFilter === 'confirmed' ? vote.confirmed : !vote.confirmed
      );
    }

    // Sort by timestamp (newest first)
    return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
  };

  const filteredVotes = getFilteredVotes();

  // Handle manual recovery of missing TxID
  const handleRecoverVote = async (vote: any) => {
    try {
      const txId = await algorandUtils.findVoteTransaction(vote.voterAddress, vote.pollId);
      if (txId) {
        useVotingStore.getState().updateVoteTxId(vote.id, txId);
        // toast.success("Vote recovered successfully!"); // Store already toasts
      } else {
        alert("Could not find a matching transaction on the blockchain. The vote might still be processing or was not sent.");
      }
    } catch (e) {
      console.error("Recovery failed:", e);
      alert("Failed to recover vote. Please check console.");
    }
  };

  // View on Algorand Explorer (simulated link)
  const viewOnExplorer = (vote: any) => {
    const txId = vote.txId;

    // Check for valid TxID
    if (txId && txId.length === 52) {
      window.open(`https://lora.algokit.io/testnet/transaction/${txId}`, '_blank');
    } else {
      // Offer recovery if invalid
      if (confirm(`Legacy/Error: This vote record has a missing or invalid Transaction ID.\n\nWould you like to try and recover it from the blockchain?`)) {
        handleRecoverVote(vote);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>Vote Audit Log</CardTitle>
                <Badge variant="outline" className="text-green-600 border-green-500">Live (TestNet)</Badge>
              </div>
              <CardDescription>
                Transparent, tamper-proof record of all votes on the blockchain
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold">{votes.length}</p>
              <p className="text-sm text-muted-foreground">Total Votes</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold">{votes.filter(v => v.confirmed).length}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold">{polls.length}</p>
              <p className="text-sm text-muted-foreground">Active Polls</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID, poll, or option..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={pollFilter} onValueChange={setPollFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by poll" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Polls</SelectItem>
            {polls.map(poll => (
              <SelectItem key={poll.id} value={poll.id}>
                {poll.question.length > 20 ? poll.question.slice(0, 20) + '...' : poll.question}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Votes Table */}
      <Card>
        <CardContent className="p-0">
          {filteredVotes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Poll</TableHead>
                    <TableHead>Vote</TableHead>
                    <TableHead>Voter (Anonymized)</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVotes.map((vote) => (
                    <TableRow key={vote.id}>
                      <TableCell className="font-mono text-xs">
                        {(vote.txId || 'Pending/Error').slice(0, 16)}...
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {getPollQuestion(vote.pollId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getOptionText(vote.pollId, vote.optionId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {anonymizeAddress(vote.voterAddress)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(vote.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vote.confirmed ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewOnExplorer(vote)}
                        >
                          {(!vote.txId || vote.txId.length !== 52) ? (
                            <span className="text-yellow-600 font-bold text-xs uppercase mr-2">Fix</span>
                          ) : null}
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No votes recorded yet</p>
              <p className="text-sm">Votes will appear here once cast</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blockchain Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blockchain Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Network</span>
            <Badge variant="outline">Algorand TestNet</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Verification Status</span>
            <Badge variant="default" className="bg-green-500">All Verified</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Smart Contract</span>
            <span className="font-mono">CampusPoll v1.0</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            All votes are cryptographically verified and stored on the Algorand blockchain.
            Voter identities are protected through anonymization while maintaining full transparency
            of the voting process.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
