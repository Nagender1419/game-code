import { Button } from "@/components/ui/button";
import { Dice1, Check } from "lucide-react";

interface WelcomeScreenProps {
  onShowTerms: () => void;
}

export default function WelcomeScreen({ onShowTerms }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dice1 className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to FairPlay</h1>
          <p className="text-gray-300">The ultimate color prediction gaming experience</p>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
          <div className="space-y-6">
            <div className="text-white">
              <h3 className="font-semibold text-lg mb-3">Before you start:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center space-x-2">
                  <Check className="text-green-400" size={16} />
                  <span>Must be 18+ years old</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="text-green-400" size={16} />
                  <span>Demo application - no real money</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="text-green-400" size={16} />
                  <span>Minimum deposit: $100</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="text-green-400" size={16} />
                  <span>Minimum withdrawal: $250</span>
                </li>
              </ul>
            </div>
            
            <Button 
              onClick={onShowTerms}
              className="w-full gradient-primary text-white py-4 text-lg font-bold hover:opacity-90 transition-all transform hover:scale-105"
              size="lg"
            >
              Read Terms & Start Playing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
