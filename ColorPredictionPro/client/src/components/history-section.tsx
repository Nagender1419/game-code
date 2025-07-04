import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Circle } from "lucide-react";

export default function HistorySection() {
  const { data: betHistory, isLoading } = useQuery({
    queryKey: ["/api/user/bet-history"],
  });

  const formatColor = (color: string) => {
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-4 h-4 game-color-${color} rounded-full`}></div>
        <span className="text-sm capitalize">{color}</span>
      </div>
    );
  };

  const formatPayout = (payout: string, won: boolean) => {
    const amount = parseFloat(payout);
    if (won && amount > 0) {
      return <span className="text-green-600 font-semibold">+${amount.toFixed(2)}</span>;
    } else {
      return <span className="text-red-600 font-semibold">-${amount.toFixed(2)}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Game History</h2>
          <p className="text-gray-600">Your recent game results and statistics</p>
        </div>
        
        <div className="p-6">
          {!betHistory || betHistory.length === 0 ? (
            <div className="text-center py-12">
              <Circle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No game history yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start playing to see your game history here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Round</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Prediction</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Result</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Bet</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {betHistory.map((bet: any) => (
                    <tr key={bet.id}>
                      <td className="py-4 px-4 text-sm font-mono">
                        #{bet.round?.roundNumber || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {new Date(bet.createdAt).toLocaleDateString()} {" "}
                        {new Date(bet.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-4">
                        {formatColor(bet.prediction)}
                      </td>
                      <td className="py-4 px-4">
                        {bet.round ? formatColor(bet.round.result) : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-sm font-mono">
                        ${parseFloat(bet.amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        {bet.won 
                          ? formatPayout(bet.payout, true)
                          : formatPayout(bet.amount, false)
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
