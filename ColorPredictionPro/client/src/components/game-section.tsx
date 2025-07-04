import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Circle, Dice5 } from "lucide-react";
import { useGame } from "@/hooks/use-game";

type Color = "red" | "green" | "blue";

export default function GameSection() {
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [betAmount, setBetAmount] = useState("50");
  const [countdown, setCountdown] = useState(45);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentRound, recentRounds, userStats } = useGame();

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 45; // Reset for next round
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const placeBetMutation = useMutation({
    mutationFn: (betData: { userId: number; prediction: Color; amount: string }) =>
      apiRequest("POST", "/api/game/place-bet", betData),
    onSuccess: (response) => {
      const data = response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game/recent-rounds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/bet-history"] });
      
      // Show result
      data.then((result) => {
        const won = result.bet.won;
        toast({
          title: won ? "Congratulations! 🎉" : "Better luck next time!",
          description: won 
            ? `You won $${result.bet.payout}! Result was ${result.round.result}.`
            : `You lost $${result.bet.amount}. Result was ${result.round.result}.`,
          variant: won ? "default" : "destructive",
        });
      });

      // Reset selections
      setSelectedColor(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
  };

  const handlePlaceBet = () => {
    if (!selectedColor) {
      toast({
        title: "No Color Selected",
        description: "Please select a color first!",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(betAmount);
    if (amount < 10) {
      toast({
        title: "Invalid Bet Amount",
        description: "Minimum bet amount is $10",
        variant: "destructive",
      });
      return;
    }

    placeBetMutation.mutate({
      userId: 1, // Demo user ID
      prediction: selectedColor,
      amount: betAmount,
    });
  };

  const adjustBetAmount = (increment: number) => {
    const current = parseFloat(betAmount) || 0;
    const newAmount = Math.max(10, current + increment);
    setBetAmount(newAmount.toString());
  };

  const colors: { id: Color; name: string; multiplier: string }[] = [
    { id: "red", name: "Red", multiplier: "2.5x" },
    { id: "green", name: "Green", multiplier: "2.5x" },
    { id: "blue", name: "Blue", multiplier: "2.5x" },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Game Area */}
      <div className="lg:col-span-2">
        <div className="gradient-dark rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Color Prediction</h2>
            <p className="text-gray-300">Choose a color and predict the outcome!</p>
          </div>

          {/* Game Status */}
          <div className="bg-black bg-opacity-30 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300">
                Round #{currentRound?.roundNumber || "Loading..."}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Live</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold">{formatTime(countdown)}</div>
              <div className="text-gray-400 text-sm">Time remaining</div>
            </div>
          </div>

          {/* Color Selection */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {colors.map(({ id, name, multiplier }) => (
              <Button
                key={id}
                onClick={() => handleColorSelect(id)}
                className={`
                  game-color-${id} hover:game-color-${id} rounded-xl p-6 h-auto text-center transition-all transform hover:scale-105
                  ${selectedColor === id ? "ring-4 ring-white ring-opacity-50" : ""}
                `}
                variant="ghost"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Circle size={32} fill="currentColor" />
                  </div>
                  <div className="font-bold">{name}</div>
                  <div className="text-sm opacity-80">{multiplier}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Bet Amount */}
          <div className="bg-black bg-opacity-30 rounded-xl p-6">
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Bet Amount
            </label>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="10"
                max="1000"
                className="flex-1 bg-white bg-opacity-10 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary"
                placeholder="Enter amount"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={() => adjustBetAmount(10)}
                  variant="ghost"
                  size="sm"
                  className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
                >
                  +10
                </Button>
                <Button
                  onClick={() => adjustBetAmount(50)}
                  variant="ghost"
                  size="sm"
                  className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
                >
                  +50
                </Button>
                <Button
                  onClick={() => setBetAmount("1000")}
                  variant="ghost"
                  size="sm"
                  className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
                >
                  Max
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Place Bet Button */}
        <Button
          onClick={handlePlaceBet}
          disabled={placeBetMutation.isPending || !selectedColor}
          className="w-full mt-6 gradient-primary text-white py-4 text-lg font-bold hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          <Dice5 className="mr-2" size={20} />
          {placeBetMutation.isPending ? "Processing..." : "Place Bet"}
        </Button>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Recent Results */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Recent Results</h3>
            <div className="space-y-3">
              {recentRounds?.slice(0, 5).map((round) => (
                <div key={round.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 game-color-${round.result} rounded-full`}></div>
                    <span className="text-sm font-medium">#{round.roundNumber}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(round.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Games Played</span>
                <span className="font-semibold">{userStats?.gamesPlayed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Win Rate</span>
                <span className="font-semibold text-green-600">
                  {userStats?.winRate || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Winnings</span>
                <span className="font-semibold text-primary">
                  ${userStats?.totalWinnings || "0.00"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
