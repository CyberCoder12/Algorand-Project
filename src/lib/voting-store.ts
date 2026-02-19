import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { algorandUtils } from './algorand'; // Removed to avoid dependency on mock utils for now

// Types
export interface Poll {
  id: string;
  appId: number;
  question: string;
  description: string;
  options: PollOption[];
  creator: string;
  createdAt: number;
  startTime: number;
  endTime: number;
  minTokenBalance: number;
  status: 'draft' | 'active' | 'ended';
  totalVotes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Vote {
  id: string;
  txId: string;
  pollId: string;
  voterAddress: string;
  optionId: string;
  timestamp: number;
  confirmed: boolean;
}

// WalletState removed - using @txnlab/use-wallet-react

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

interface VotingState {
  // Wallet state handled by context

  // Polls
  polls: Poll[];
  activePollId: string | null;

  // Votes
  votes: Vote[];

  // Notifications
  notifications: Notification[];

  // UI state
  activeTab: 'create' | 'polls' | 'results' | 'audit';
  isLoading: boolean;

  // Actions
  // Actions (wallet actions removed)
  createPoll: (poll: Omit<Poll, 'id' | 'appId' | 'createdAt' | 'status' | 'totalVotes'>) => void;
  updatePoll: (pollId: string, updates: Partial<Poll>) => void;
  deletePoll: (pollId: string) => void;
  submitVote: (pollId: string, optionId: string, voterAddress: string, txId: string) => Promise<boolean>;
  setActiveTab: (tab: 'create' | 'polls' | 'results' | 'audit') => void;
  setActivePollId: (pollId: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  hasVoted: (pollId: string, voterAddress: string) => boolean;
  getPollById: (pollId: string) => Poll | undefined;
  getVotesByPollId: (pollId: string) => Vote[];
  updateVoteTxId: (voteId: string, txId: string) => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Simulated wallet addresses removed

export const useVotingStore = create<VotingState>()(
  persist(
    (set, get) => ({
      // Initial state
      // Initial state
      polls: [],
      activePollId: null,
      votes: [],
      notifications: [],
      activeTab: 'polls',
      isLoading: false,

      // Wallet actions removed

      createPoll: (pollData) => {
        const poll: Poll = {
          ...pollData,
          id: generateId(),
          // Placeholder App ID until we integrate real contract deployment
          appId: Math.floor(Math.random() * 900000000) + 100000000,
          createdAt: Date.now(),
          status: 'active',
          totalVotes: 0,
        };

        set(state => ({
          polls: [...state.polls, poll],
        }));

        get().addNotification({
          type: 'success',
          message: `Poll "${poll.question}" created successfully! App ID: ${poll.appId}`,
        });
      },

      // Update poll
      updatePoll: (pollId, updates) => {
        set(state => ({
          polls: state.polls.map(poll =>
            poll.id === pollId ? { ...poll, ...updates } : poll
          ),
        }));
      },

      // Delete poll
      deletePoll: (pollId) => {
        set(state => ({
          polls: state.polls.filter(poll => poll.id !== pollId),
        }));
      },

      // Submit vote
      submitVote: async (pollId, optionId, voterAddress, txId) => {
        const state = get();

        // Wallet connection check handled by UI component
        if (!voterAddress) {
          get().addNotification({
            type: 'error',
            message: 'Wallet not connected',
          });
          return false;
        }

        if (state.hasVoted(pollId, voterAddress)) {
          get().addNotification({
            type: 'error',
            message: 'You have already voted on this poll',
          });
          return false;
        }

        set({ isLoading: true });

        const vote: Vote = {
          id: generateId(),
          txId: txId,
          pollId,
          voterAddress: voterAddress,
          optionId,
          timestamp: Date.now(),
          confirmed: true,
        };

        // Update vote count in poll
        set(state => ({
          votes: [...state.votes, vote],
          polls: state.polls.map(poll => {
            if (poll.id === pollId) {
              return {
                ...poll,
                totalVotes: poll.totalVotes + 1,
                options: poll.options.map(opt =>
                  opt.id === optionId
                    ? { ...opt, votes: opt.votes + 1 }
                    : opt
                ),
              };
            }
            return poll;
          }),
          isLoading: false,
        }));

        get().addNotification({
          type: 'success',
          message: `Vote submitted! Transaction ID: ${txId.slice(0, 16)}...`,
        });

        return true;
      },

      // Set active tab
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Set active poll
      setActivePollId: (pollId) => set({ activePollId: pollId }),

      // Add notification
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          timestamp: Date.now(),
        };

        set(state => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, 5000);
      },

      // Remove notification
      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      // Set loading
      setLoading: (loading) => set({ isLoading: loading }),

      // Check if user has voted
      hasVoted: (pollId, voterAddress) => {
        const state = get();
        if (!voterAddress) return false;
        return state.votes.some(
          vote => vote.pollId === pollId && vote.voterAddress === voterAddress
        );
      },

      // Get poll by ID
      getPollById: (pollId) => {
        return get().polls.find(poll => poll.id === pollId);
      },

      // Get votes by poll ID
      getVotesByPollId: (pollId) => {
        return get().votes.filter(vote => vote.pollId === pollId);
      },

      // Update Vote TxID (Recovery)
      updateVoteTxId: (voteId, txId) => {
        set(state => ({
          votes: state.votes.map(vote =>
            vote.id === voteId ? { ...vote, txId: txId, confirmed: true } : vote
          )
        }));
        get().addNotification({
          type: 'success',
          message: 'Vote record recovered successfully',
        });
      },
    }),
    {
      name: 'campus-poll-storage',
      partialize: (state) => ({
        polls: state.polls,
        votes: state.votes,
      }),
    }
  )
);
