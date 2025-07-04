import { useQuery } from "@tanstack/react-query";

export function useWallet() {
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/wallet/transactions"],
  });

  return {
    transactions,
    transactionsLoading,
  };
}
