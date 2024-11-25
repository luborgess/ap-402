import { Home, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 flex items-center justify-between">
            <nav className="flex items-center space-x-4">
              <Link href="/" className="nav-link active">
                <Home className="h-5 w-5" />
              </Link>
              <Link href="/calendario" className="nav-link">
                <Calendar className="h-5 w-5" />
              </Link>
              <Link href="/configuracoes" className="nav-link">
                <Settings className="h-5 w-5" />
              </Link>
            </nav>

            <div className="text-sm font-medium">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                AP 402
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
