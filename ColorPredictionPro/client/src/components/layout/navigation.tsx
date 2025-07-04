import { Button } from "@/components/ui/button";
import { Gamepad2, Wallet, History } from "lucide-react";

interface NavigationProps {
  activeTab: "game" | "wallet" | "history";
  onTabChange: (tab: "game" | "wallet" | "history") => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "game" as const, label: "Game", icon: Gamepad2 },
    { id: "wallet" as const, label: "Wallet", icon: Wallet },
    { id: "history" as const, label: "History", icon: History },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              onClick={() => onTabChange(id)}
              className={`
                border-b-2 rounded-none py-4 px-1 font-medium transition-colors
                ${activeTab === id
                  ? "border-primary text-primary bg-transparent hover:bg-transparent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-transparent"
                }
              `}
            >
              <Icon size={18} className="mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
