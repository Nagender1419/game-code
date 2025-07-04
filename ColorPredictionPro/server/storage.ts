import { users, gameRounds, bets, transactions, type User, type InsertUser, type GameRound, type InsertGameRound, type Bet, type InsertBet, type Transaction, type InsertTransaction } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, balance: string): Promise<User>;
  acceptTerms(userId: number): Promise<User>;

  // Game operations
  getCurrentRound(): Promise<GameRound | undefined>;
  createGameRound(round: InsertGameRound): Promise<GameRound>;
  getRecentRounds(limit: number): Promise<GameRound[]>;

  // Bet operations
  placeBet(bet: InsertBet): Promise<Bet>;
  getBetsByUser(userId: number, limit?: number): Promise<Bet[]>;
  getBetsByRound(roundId: number): Promise<Bet[]>;
  updateBetResult(betId: number, won: boolean, payout: string): Promise<Bet>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUser(userId: number, limit?: number): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: number, status: string): Promise<Transaction>;

  // Statistics
  getUserStats(userId: number): Promise<{
    gamesPlayed: number;
    winRate: number;
    totalWinnings: string;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameRounds: Map<number, GameRound>;
  private bets: Map<number, Bet>;
  private transactions: Map<number, Transaction>;
  private currentId: { users: number; gameRounds: number; bets: number; transactions: number };
  private currentRoundNumber: number;

  constructor() {
    this.users = new Map();
    this.gameRounds = new Map();
    this.bets = new Map();
    this.transactions = new Map();
    this.currentId = { users: 1, gameRounds: 1, bets: 1, transactions: 1 };
    this.currentRoundNumber = 1000;

    // Create a default user for demo
    this.createUser({
      username: "demo_user",
      balance: "1250.00",
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = {
      id,
      username: insertUser.username,
      balance: insertUser.balance || "0.00",
      termsAccepted: insertUser.termsAccepted || false,
      termsAcceptedAt: insertUser.termsAcceptedAt || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, balance: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, balance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async acceptTerms(userId: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, termsAccepted: true, termsAcceptedAt: new Date() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getCurrentRound(): Promise<GameRound | undefined> {
    return Array.from(this.gameRounds.values())
      .sort((a, b) => b.roundNumber - a.roundNumber)[0];
  }

  async createGameRound(insertRound: InsertGameRound): Promise<GameRound> {
    const id = this.currentId.gameRounds++;
    const round: GameRound = {
      ...insertRound,
      id,
      createdAt: new Date(),
    };
    this.gameRounds.set(id, round);
    return round;
  }

  async getRecentRounds(limit: number): Promise<GameRound[]> {
    return Array.from(this.gameRounds.values())
      .sort((a, b) => b.roundNumber - a.roundNumber)
      .slice(0, limit);
  }

  async placeBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.currentId.bets++;
    const bet: Bet = {
      ...insertBet,
      id,
      payout: "0.00",
      won: false,
      createdAt: new Date(),
    };
    this.bets.set(id, bet);
    return bet;
  }

  async getBetsByUser(userId: number, limit = 50): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getBetsByRound(roundId: number): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(bet => bet.roundId === roundId);
  }

  async updateBetResult(betId: number, won: boolean, payout: string): Promise<Bet> {
    const bet = this.bets.get(betId);
    if (!bet) throw new Error("Bet not found");
    
    const updatedBet = { ...bet, won, payout };
    this.bets.set(betId, updatedBet);
    return updatedBet;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId.transactions++;
    const transaction: Transaction = {
      id,
      userId: insertTransaction.userId,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      status: insertTransaction.status || "pending",
      paymentMethod: insertTransaction.paymentMethod || null,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionsByUser(userId: number, limit = 50): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateTransactionStatus(transactionId: number, status: string): Promise<Transaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) throw new Error("Transaction not found");
    
    const updatedTransaction = { ...transaction, status };
    this.transactions.set(transactionId, updatedTransaction);
    return updatedTransaction;
  }

  async getUserStats(userId: number): Promise<{
    gamesPlayed: number;
    winRate: number;
    totalWinnings: string;
  }> {
    const userBets = Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    const gamesPlayed = userBets.length;
    const wins = userBets.filter(bet => bet.won).length;
    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
    const totalWinnings = userBets
      .filter(bet => bet.won)
      .reduce((sum, bet) => sum + parseFloat(bet.payout || "0"), 0)
      .toFixed(2);

    return { gamesPlayed, winRate, totalWinnings };
  }

  // Helper method to get next round number
  getNextRoundNumber(): number {
    return ++this.currentRoundNumber;
  }
}

export const storage = new MemStorage();
