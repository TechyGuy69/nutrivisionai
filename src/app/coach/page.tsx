"use client";

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Leaf, User, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "coach";
  content: string;
};

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      content: "Hello! I'm your NutriVision AI Coach. How can I help you with your nutrition goals today? Ask me about healthy meal ideas, understanding food labels, or managing your diet!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/meal-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { role: "coach", content: data.reply }]);
      } else {
        throw new Error(data.reply || "AI coach is temporarily unavailable");
      }
    } catch (error: any) {
      console.error("Coach chat error", error);
      setMessages(prev => [...prev, { 
        role: "coach", 
        content: error.message || "AI coach is temporarily unavailable. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-6 overflow-hidden">
        <header className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-primary/10">
          <div className="bg-primary/10 p-2 rounded-full">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline">AI Healthy Meal Coach</h1>
            <p className="text-xs text-muted-foreground">Always active • Powered by NutriVision AI</p>
          </div>
        </header>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col mb-4 overflow-hidden shadow-lg border-none">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className={`h-10 w-10 border-2 ${msg.role === "coach" ? "border-primary/20" : "border-secondary/20"}`}>
                  <AvatarImage src={msg.role === "coach" ? "https://picsum.photos/seed/coach/100" : ""} />
                  <AvatarFallback className={msg.role === "coach" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}>
                    {msg.role === "coach" ? <Leaf className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none border"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3 text-sm text-muted-foreground rounded-tl-none border italic">
                  NutriVision is thinking...
                </div>
              </div>
            )}
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t bg-muted/5">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your nutrition..."
                className="flex-1 h-12 bg-white rounded-full px-6 focus-visible:ring-primary shadow-inner"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="h-12 w-12 rounded-full shadow-lg" disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="text-[10px] text-center text-muted-foreground mt-2 uppercase tracking-widest font-medium">
              Nutritional advice should be used alongside professional medical guidance
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
