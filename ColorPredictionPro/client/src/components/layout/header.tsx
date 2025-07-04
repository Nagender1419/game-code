import { Dice1, UserCircle } from "lucide-react";
import type { User } from "@shared/schema";

interface HeaderProps {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Dice1 className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">FairPlay</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Wallet Balance */}
            <div className="gradient-gaming text-white px-4 py-2 rounded-lg">
              <div className="text-xs opacity-90">Balance</div>
              <div className="font-mono font-bold">
                ${user?.balance ? parseFloat(user.balance).toFixed(2) : "0.00"}
              </div>
            </div>
            
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <UserCircle size={32} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
