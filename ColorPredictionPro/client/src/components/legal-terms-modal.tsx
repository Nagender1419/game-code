import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LegalTermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export default function LegalTermsModal({ isOpen, onAccept, onDecline, onClose }: LegalTermsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acceptTermsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/user/accept-terms"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Terms Accepted",
        description: "Welcome to FairPlay! You can now start playing.",
      });
      onAccept();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept terms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    acceptTermsMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Terms & Conditions
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4 text-gray-700 text-sm pr-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Legal Disclaimer</h3>
              <p>This is a demonstration application for educational purposes only. No real money transactions are processed.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Game Rules</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Color prediction results are randomly generated</li>
                <li>Minimum deposit requirement: $100</li>
                <li>Minimum withdrawal amount: $250</li>
                <li>All transactions are simulated for demo purposes</li>
                <li>Winning multiplier is 2.5x your bet amount</li>
                <li>Each round lasts approximately 60 seconds</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Responsible Gaming</h3>
              <p>Users must be 18+ years old. Play responsibly and within your means. This platform promotes responsible gaming practices. If you feel you have a gambling problem, please seek help from appropriate resources.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Privacy & Data</h3>
              <p>Your gaming data is stored temporarily for the duration of your session. No personal financial information is collected or stored in this demonstration application.</p>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleAccept}
            disabled={acceptTermsMutation.isPending}
            className="flex-1 gradient-primary text-white font-semibold hover:opacity-90"
          >
            {acceptTermsMutation.isPending ? "Accepting..." : "Accept & Continue"}
          </Button>
          <Button
            onClick={onDecline}
            variant="outline"
            className="px-6 font-semibold"
          >
            Decline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
