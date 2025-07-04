import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import WelcomeScreen from "@/components/welcome-screen";
import LegalTermsModal from "@/components/legal-terms-modal";
import Header from "@/components/layout/header";
import Navigation from "@/components/layout/navigation";
import GameSection from "@/components/game-section";
import WalletSection from "@/components/wallet-section";
import HistorySection from "@/components/history-section";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"game" | "wallet" | "history">("game");

  const { data: user } = useQuery({ 
    queryKey: ["/api/user"],
    enabled: !showWelcome,
  });

  const handleShowTerms = () => {
    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    setShowTermsModal(false);
    setShowWelcome(false);
  };

  const handleDeclineTerms = () => {
    setShowTermsModal(false);
  };

  if (showWelcome) {
    return (
      <>
        <WelcomeScreen onShowTerms={handleShowTerms} />
        <LegalTermsModal
          isOpen={showTermsModal}
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
          onClose={handleDeclineTerms}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "game" && <GameSection />}
        {activeTab === "wallet" && <WalletSection />}
        {activeTab === "history" && <HistorySection />}
      </main>
    </div>
  );
}
