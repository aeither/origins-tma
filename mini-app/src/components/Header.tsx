import { Link } from '@tanstack/react-router'
import { TonConnectButton } from "@tonconnect/ui-react"

export default function Header() {
  return (
    <header className="glass-card border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-[#20d9c5] to-[#60e8d8] bg-clip-text text-transparent">
            TelePay
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-white hover:text-[#20d9c5] transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              to="/counter" 
              className="text-white hover:text-[#20d9c5] transition-colors font-medium"
            >
              Freelancer
            </Link>
            <Link 
              to="/update-invoice" 
              className="text-white hover:text-[#20d9c5] transition-colors font-medium"
            >
              Client
            </Link>
          </div>
        </div>
        
        <div className="flex items-center">
          <TonConnectButton />
        </div>
      </nav>
    </header>
  )
}
