'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVotingStore } from '@/lib/voting-store';
import { PollCreator } from '@/components/poll/poll-creator';
import { PollList } from '@/components/poll/poll-list';
import { PollResults } from '@/components/poll/poll-results';
import { WalletConnect } from '@/components/WalletConnect';
import { VoteForm } from '@/components/voting/vote-form';
import { VoteAudit } from '@/components/audit/vote-audit';
import { Toaster } from '@/components/ui/toaster';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import {
  Vote,
  PlusCircle,
  BarChart3,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';

type View = 'list' | 'vote' | 'results';

export default function Home() {
  const {
    polls,
    activeTab,
    setActiveTab,
    getPollById,
    notifications,
    removeNotification,
  } = useVotingStore();

  const { activeAccount } = useWallet();

  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedPoll = selectedPollId ? getPollById(selectedPollId) : null;

  const handleVote = (pollId: string) => {
    setSelectedPollId(pollId);
    setCurrentView('vote');
  };

  const handleViewResults = (pollId: string) => {
    setSelectedPollId(pollId);
    setCurrentView('results');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedPollId(null);
  };

  // Auto-remove notifications
  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  const renderContent = () => {
    // Show voting form
    if (currentView === 'vote' && selectedPoll) {
      return (
        <VoteForm
          poll={selectedPoll}
          onBack={handleBack}
          onSuccess={() => setCurrentView('results')}
        />
      );
    }

    // Show results
    if (currentView === 'results' && selectedPollId) {
      return (
        <PollResults
          pollId={selectedPollId}
          onBack={handleBack}
        />
      );
    }

    // Show main tabs
    return (
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="polls" className="flex items-center gap-2">
            <Vote className="h-4 w-4" />
            <span className="hidden sm:inline">Polls</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Results</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="polls" className="mt-0">
          <PollList
            onVote={handleVote}
            onViewResults={handleViewResults}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PollCreator />
            </div>
            <div className="lg:col-span-1">
              <WalletConnect />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          {selectedPollId ? (
            <PollResults pollId={selectedPollId} onBack={() => setSelectedPollId(null)} />
          ) : (
            <div className="space-y-6">
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Poll Results</h2>
                <p className="text-muted-foreground mb-6">
                  Select a poll to view detailed results
                </p>
              </div>
              <PollList
                onVote={handleVote}
                onViewResults={handleViewResults}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <VoteAudit />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/campus-poll-logo.svg"
                  alt="Campus Poll Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">Campus Poll</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Blockchain-Verified Voting
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline" className="gap-1">
                  <Vote className="h-3 w-3" />
                  {polls.length} Polls
                </Badge>
                <Badge variant="outline" className="gap-1">
                  Algorand TestNet
                </Badge>
              </div>

              {/* Wallet Status */}
              <WalletConnect />

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  {activeAccount ? (
                    <Badge variant="default" className="bg-green-500">
                      Wallet Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Wallet Not Connected</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{polls.length} Polls</Badge>
                  <Badge variant="outline">TestNet</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5">
                <Image
                  src="/campus-poll-logo.svg"
                  alt="Campus Poll"
                  fill
                  className="object-contain"
                />
              </div>
              <span>Campus Poll - Powered by Algorand</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Built with AlgoKit</span>
              <Badge variant="outline" className="text-xs">v1.0.0</Badge>
            </div>
          </div>
        </div>
      </footer>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right ${notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
                notification.type === 'warning' ? 'bg-yellow-500 text-white' :
                  'bg-background border'
              }`}
          >
            <p className="text-sm">{notification.message}</p>
          </div>
        ))}
      </div>

      <Toaster />
    </div>
  );
}
