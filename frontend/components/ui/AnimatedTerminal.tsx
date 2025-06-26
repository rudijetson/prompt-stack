'use client';

import { useState, useEffect } from 'react';
import { Terminal, CheckCircle } from 'lucide-react';

interface Command {
  text: string;
  output?: string;
  delay?: number;
}

const commands: Command[] = [
  { 
    text: '$ git clone https://github.com/rudijetson/prompt-stack',
    output: 'Cloning into \'prompt-stack\'...',
    delay: 1000
  },
  { 
    text: '$ cd prompt-stack && ./setup.sh',
    output: '✓ Environment files created\n✓ Dependencies installed\n✓ Database configured',
    delay: 1500
  },
  { 
    text: '$ make dev',
    output: 'Starting development servers...\n✓ Frontend running at localhost:3000\n✓ Backend running at localhost:8000',
    delay: 2000
  }
];

export function AnimatedTerminal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStep >= commands.length) {
      setTimeout(() => setIsComplete(true), 500);
      return;
    }

    const command = commands[currentStep];
    setIsTyping(true);
    setTypedText('');
    setShowOutput(false);

    // Type out the command
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < command.text.length) {
        setTypedText(command.text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        
        // Show output after a brief pause
        if (command.output) {
          setTimeout(() => {
            setShowOutput(true);
            // Move to next command after delay
            setTimeout(() => {
              setCurrentStep(currentStep + 1);
            }, command.delay || 1000);
          }, 300);
        } else {
          // Move to next command if no output
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
          }, command.delay || 1000);
        }
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentStep]);

  // Reset animation after completion
  useEffect(() => {
    if (isComplete) {
      const resetTimer = setTimeout(() => {
        setCurrentStep(0);
        setIsComplete(false);
        setTypedText('');
        setShowOutput(false);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }
  }, [isComplete]);

  return (
    <div className="bg-gray-900 dark:bg-gray-950 rounded-lg shadow-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Terminal Header */}
      <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-mono">Terminal</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-6 font-mono text-sm">
        {/* Show previous commands */}
        {commands.slice(0, currentStep).map((cmd, index) => (
          <div key={index} className="mb-4">
            <div className="text-gray-300">{cmd.text}</div>
            {cmd.output && (
              <div className="text-green-400 mt-1 whitespace-pre-line">{cmd.output}</div>
            )}
          </div>
        ))}

        {/* Current command being typed */}
        {currentStep < commands.length && (
          <div className="mb-4">
            <div className="text-gray-300">
              {typedText}
              {isTyping && <span className="animate-pulse">▊</span>}
            </div>
            {showOutput && commands[currentStep].output && (
              <div className="text-green-400 mt-1 whitespace-pre-line animate-fadeIn">
                {commands[currentStep].output}
              </div>
            )}
          </div>
        )}

        {/* Completion message */}
        {isComplete && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">Your app is running!</span>
            </div>
            <div className="text-gray-400">
              Visit <span className="text-blue-400">http://localhost:3000</span> to see your app
            </div>
          </div>
        )}
      </div>
    </div>
  );
}