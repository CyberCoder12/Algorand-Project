'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Calendar, Coins, AlertCircle } from 'lucide-react';
import { useVotingStore } from '@/lib/voting-store';
import { useWallet } from '@txnlab/use-wallet-react';

interface PollOption {
  id: string;
  text: string;
}

export function PollCreator() {
  const { createPoll, addNotification } = useVotingStore();
  const { activeAccount } = useWallet();

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: crypto.randomUUID(), text: '' },
    { id: crypto.randomUUID(), text: '' },
  ]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minTokenBalance, setMinTokenBalance] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: crypto.randomUUID(), text: '' }]);
    } else {
      addNotification({
        type: 'warning',
        message: 'Maximum 10 options allowed',
      });
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    } else {
      addNotification({
        type: 'warning',
        message: 'Minimum 2 options required',
      });
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(opt =>
      opt.id === id ? { ...opt, text } : opt
    ));
  };

  const handleSubmit = async () => {
    if (!activeAccount) {
      addNotification({
        type: 'error',
        message: 'Please connect your wallet first',
      });
      return;
    }

    if (!question.trim()) {
      addNotification({
        type: 'error',
        message: 'Please enter a poll question',
      });
      return;
    }

    const validOptions = options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      addNotification({
        type: 'error',
        message: 'Please provide at least 2 options',
      });
      return;
    }

    if (!endDate) {
      addNotification({
        type: 'error',
        message: 'Please select an end date',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    createPoll({
      question: question.trim(),
      description: description.trim(),
      options: validOptions.map(opt => ({
        id: opt.id,
        text: opt.text.trim(),
        votes: 0,
      })),
      creator: activeAccount.address,
      startTime: startDate ? new Date(startDate).getTime() : Date.now(),
      endTime: new Date(endDate).getTime(),
      minTokenBalance,
    });

    // Reset form
    setQuestion('');
    setDescription('');
    setOptions([
      { id: crypto.randomUUID(), text: '' },
      { id: crypto.randomUUID(), text: '' },
    ]);
    setStartDate('');
    setEndDate('');
    setMinTokenBalance(10);
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Poll
        </CardTitle>
        <CardDescription>
          Create a new campus poll with blockchain-verified voting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Warning */}
        {!activeAccount && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Connect your wallet to create a poll</span>
          </div>
        )}

        {/* Question */}
        <div className="space-y-2">
          <Label htmlFor="question">Poll Question *</Label>
          <Input
            id="question"
            placeholder="e.g., Who should be the next student council president?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!activeAccount}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add more details about this poll..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!activeAccount}
            rows={3}
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Options *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={!activeAccount || options.length >= 10}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={option.id} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    disabled={!activeAccount}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(option.id)}
                  disabled={!activeAccount || options.length <= 2}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Date (Optional)
            </Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!activeAccount}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              End Date *
            </Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!activeAccount}
              min={startDate || new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        {/* Token Requirement */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="minTokens" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Minimum Campus Token Balance Required
            </Label>
            <Badge variant="secondary">{minTokenBalance} CAMPUS</Badge>
          </div>
          <Input
            id="minTokens"
            type="number"
            min={0}
            max={1000}
            value={minTokenBalance}
            onChange={(e) => setMinTokenBalance(parseInt(e.target.value) || 0)}
            disabled={!activeAccount}
          />
          <p className="text-xs text-muted-foreground">
            Only voters with this minimum token balance can participate
          </p>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!activeAccount || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Creating Poll...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
