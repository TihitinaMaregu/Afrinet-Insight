import React from 'react';
import { Globe, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Afrinet Insight</h1>
              <p className="text-sm text-muted-foreground">
                Internet Performance Across Africa
              </p>
            </div>
          </div>
          <a
            href="https://github.com/TihitinaMaregu/Afrinet-Insight"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="hidden sm:inline">View on GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
