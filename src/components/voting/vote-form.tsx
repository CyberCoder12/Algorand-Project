'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Vote, ArrowLeft, CheckCircle, Clock, Coins } from 'lucide-react';
import { useVotingStore, Poll } from '@/lib/voting-store';
import { useWallet } from '@txnlab/use-wallet-react';
import { algorandUtils } from '@/lib/algorand';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VoteFormProps {
  poll: Poll;
  onBack: () => void;
  onSuccess: () => void;
}

export function VoteForm({ poll, onBack, onSuccess }: VoteFormProps) {
  const { submitVote, isLoading, hasVoted, setLoading, addNotification } = useVotingStore();
  const { activeAccount, signTransactions } = useWallet();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const userHasVoted = activeAccount ? hasVoted(poll.id, activeAccount.address) : false;
  const isActive = Date.now() >= poll.startTime && Date.now() <= poll.endTime;
  const canVote = !!activeAccount &&
    isActive &&
    !userHasVoted;
  // TODO: Add real token balance check
  // && wallet.tokenBalance >= poll.minTokenBalance;

  const handleSubmit = () => {
    if (!selectedOption) return;
    setShowConfirm(true);
  };

  const confirmVote = async () => {
    if (!activeAccount) return;

    try {
      setLoading(true);

      // 1. Create transaction
      const txn = await algorandUtils.createVoteTransactionAsync(
        activeAccount.address,
        poll.id,
        selectedOption
      );

      // 2. Sign transaction
      const encodedTxn = txn.toByte();
      const signedTxns = await signTransactions([encodedTxn]);

      if (!signedTxns || !signedTxns[0]) {
        throw new Error('Transaction signing failed or was cancelled');
      }

      // 3. Send transaction
      const txId = await algorandUtils.sendTransaction(signedTxns[0]);
      console.log('Transaction sent, ID:', txId);

      if (!txId) {
        throw new Error('Failed to retrieve Transaction ID from network');
      }

      // 4. Update local state
      const success = await submitVote(poll.id, selectedOption, activeAccount.address, txId);

      if (success) {
        setShowConfirm(false);
        setVoteSubmitted(true);
      }
    } catch (error) {
      console.error('Voting failed:', error);
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to sign or submit vote',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedOptionText = poll.options.find(o => o.id === selectedOption)?.text;

  // Already voted
  if (userHasVoted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            Already Voted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You have already cast your vote on this poll. Thank you for participating!
          </p>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Polls
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Vote submitted successfully
  if (voteSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            Vote Submitted!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your vote has been recorded on the Algorand blockchain. You can view the results now.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Polls
            </Button>
            <Button onClick={onSuccess}>
              View Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <CardTitle>{poll.question}</CardTitle>
              {poll.description && (
                <CardDescription className="mt-2">{poll.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Poll Info */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isActive ? 'Active' : 'Not Active'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {poll.minTokenBalance} CAMPUS required
            </Badge>
          </div>

          {/* Error Messages */}
          {!activeAccount && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Please connect your wallet to vote</span>
            </div>
          )}

          {/* TODO: Add real balance checks */}
          {/* {wallet.connected && !wallet.eligible && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">You are not eligible to vote (insufficient token balance)</span>
            </div>
          )}

          {wallet.connected && wallet.tokenBalance < poll.minTokenBalance && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
              <Coins className="h-4 w-4" />
              <span className="text-sm">
                You need at least {poll.minTokenBalance} CAMPUS tokens to vote (you have {wallet.tokenBalance})
              </span>
            </div>
          )} */}

          {/* Voting Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select your choice:</Label>
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              disabled={!canVote}
            >
              {poll.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${selectedOption === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    } ${!canVote ? 'opacity-50' : 'cursor-pointer'}`}
                  onClick={() => canVote && setSelectedOption(option.id)}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Current Standings */}
          {poll.totalVotes > 0 && (
            <div className="text-sm text-muted-foreground">
              Current total votes: {poll.totalVotes}
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={!canVote || !selectedOption || isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting Vote...
              </>
            ) : (
              <>
                <Vote className="h-4 w-4 mr-2" />
                Submit Vote
              </>
            )}
          </Button>

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground">
            Your vote will be recorded on the Algorand blockchain and cannot be changed
          </p>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              Please confirm your selection. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">You are voting for:</p>
              <p className="font-semibold text-lg">{selectedOptionText}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Your vote will be recorded on the Algorand blockchain with a unique transaction ID.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={confirmVote} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                'Confirm Vote'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
