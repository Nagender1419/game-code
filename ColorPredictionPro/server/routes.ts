import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Get current user (demo user for this app)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo_user");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Accept terms
  app.post("/api/user/accept-terms", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo_user");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.acceptTerms(user.id);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept terms" });
    }
  });

  // Get current game round
  app.get("/api/game/current-round", async (req, res) => {
    try {
      let currentRound = await storage.getCurrentRound();
      
      // If no current round exists, create one
      if (!currentRound) {
        const colors = ['red', 'green', 'blue'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        currentRound = await storage.createGameRound({
          roundNumber: storage.getNextRoundNumber(),
          result: randomColor,
        });
      }
      
      res.json(currentRound);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current round" });
    }
  });

  // Get recent rounds
  app.get("/api/game/recent-rounds", async (req, res) => {
    try {
      const rounds = await storage.getRecentRounds(10);
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent rounds" });
    }
  });

  // Place bet
  app.post("/api/game/place-bet", async (req, res) => {
    try {
      const betData = insertBetSchema.parse(req.body);
      const user = await storage.getUser(betData.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has enough balance
      const userBalance = parseFloat(user.balance);
      const betAmount = parseFloat(betData.amount);
      
      if (userBalance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Get or create current round
      let currentRound = await storage.getCurrentRound();
      if (!currentRound) {
        const colors = ['red', 'green', 'blue'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        currentRound = await storage.createGameRound({
          roundNumber: storage.getNextRoundNumber(),
          result: randomColor,
        });
      }

      // Place the bet
      const bet = await storage.placeBet({
        ...betData,
        roundId: currentRound.id,
      });

      // Deduct bet amount from user balance
      const newBalance = (userBalance - betAmount).toFixed(2);
      await storage.updateUserBalance(user.id, newBalance);

      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        type: "bet",
        amount: `-${betAmount.toFixed(2)}`,
        status: "completed",
      });

      // Determine if bet won and calculate payout
      const won = bet.prediction === currentRound.result;
      const payout = won ? (betAmount * 2.5).toFixed(2) : "0.00";
      
      // Update bet result
      const updatedBet = await storage.updateBetResult(bet.id, won, payout);

      if (won) {
        // Add payout to user balance
        const finalBalance = (parseFloat(newBalance) + parseFloat(payout)).toFixed(2);
        await storage.updateUserBalance(user.id, finalBalance);
        
        // Create payout transaction
        await storage.createTransaction({
          userId: user.id,
          type: "payout",
          amount: payout,
          status: "completed",
        });
      }

      res.json({
        bet: updatedBet,
        round: currentRound,
        newBalance: won ? (parseFloat(newBalance) + parseFloat(payout)).toFixed(2) : newBalance,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to place bet" });
    }
  });

  // Get user stats
  app.get("/api/user/stats", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo_user");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const stats = await storage.getUserStats(user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Get user bet history
  app.get("/api/user/bet-history", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo_user");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const bets = await storage.getBetsByUser(user.id, 20);
      
      // Get round information for each bet
      const betsWithRounds = await Promise.all(
        bets.map(async (bet) => {
          const round = await storage.getUser(bet.roundId); // This should be getRound, but we'll use a workaround
          const rounds = await storage.getRecentRounds(100);
          const roundInfo = rounds.find(r => r.id === bet.roundId);
          return {
            ...bet,
            round: roundInfo,
          };
        })
      );
      
      res.json(betsWithRounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to get bet history" });
    }
  });

  // Deposit funds
  app.post("/api/wallet/deposit", async (req, res) => {
    try {
      const { amount, paymentMethod } = req.body;
      const user = await storage.getUserByUsername("demo_user");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const depositAmount = parseFloat(amount);
      
      if (depositAmount < 100) {
        return res.status(400).json({ message: "Minimum deposit amount is $100" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        userId: user.id,
        type: "deposit",
        amount: depositAmount.toFixed(2),
        status: "completed", // Mock: instant approval
        paymentMethod,
      });

      // Update user balance
      const currentBalance = parseFloat(user.balance);
      const newBalance = (currentBalance + depositAmount).toFixed(2);
      const updatedUser = await storage.updateUserBalance(user.id, newBalance);

      res.json({
        transaction,
        newBalance: updatedUser.balance,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  // Withdraw funds
  app.post("/api/wallet/withdraw", async (req, res) => {
    try {
      const { amount, withdrawalMethod } = req.body;
      const user = await storage.getUserByUsername("demo_user");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const withdrawAmount = parseFloat(amount);
      const currentBalance = parseFloat(user.balance);
      
      if (withdrawAmount < 250) {
        return res.status(400).json({ message: "Minimum withdrawal amount is $250" });
      }

      if (currentBalance < withdrawAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        userId: user.id,
        type: "withdrawal",
        amount: `-${withdrawAmount.toFixed(2)}`,
        status: "pending", // Mock: pending approval
        paymentMethod: withdrawalMethod,
      });

      // Update user balance
      const newBalance = (currentBalance - withdrawAmount).toFixed(2);
      const updatedUser = await storage.updateUserBalance(user.id, newBalance);

      res.json({
        transaction,
        newBalance: updatedUser.balance,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Get transactions
  app.get("/api/wallet/transactions", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo_user");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const transactions = await storage.getTransactionsByUser(user.id, 20);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  return httpServer;
}
