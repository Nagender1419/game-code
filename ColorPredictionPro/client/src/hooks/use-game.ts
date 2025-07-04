import { useQuery } from "@tanstack/react-query";

export function useGame() {
  const { data: currentRound } = useQuery({
    queryKey: ["/api/game/current-round"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentRounds } = useQuery({
    queryKey: ["/api/game/recent-rounds"],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  return {
    currentRound,
    recentRounds,
    userStats,
  };
}
