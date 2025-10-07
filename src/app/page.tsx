'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, BookOpen, LogIn } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  useEffect(() => {
    // Hide hint after 10 seconds
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      {/* Header - Newspaper Style */}
      <header className="border-b-4 border-black py-4 md:py-6 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Navigation Bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/machine-learning')}
                className="text-xs md:text-sm font-serif text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <BookOpen size={14} />
                Machine Learning
              </button>
              <button
                onClick={() => router.push('/llm')}
                className="text-xs md:text-sm font-serif text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <BookOpen size={14} />
                LLM
              </button>
            </div>
            {!loading && user && (
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-serif text-xs md:text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              >
                <Lock size={14} />
                Dashboard
              </button>
            )}
          </div>

          <div className="text-center">
            <div
              onClick={handleLogoClick}
              className="cursor-default select-none relative hover:opacity-80 transition-opacity"
            >
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-1">
                Plain Theory
              </h1>
              <p className="text-xs tracking-[0.2em] md:tracking-[0.3em] font-serif text-gray-600">
                EST. 2025 • DIGITAL EDITION
              </p>
              {clickCount > 0 && clickCount < 5 && (
                <div className="absolute -top-2 right-1/2 transform translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-mono font-bold animate-bounce shadow-lg">
                  {clickCount}/5
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-8 mt-4 md:mt-6 text-xs font-serif border-t border-b border-black py-2">
              <span className="font-bold">VOL. 1, NO. 1</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[10px] sm:text-xs">TUESDAY, OCTOBER 7, 2025</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[10px] sm:text-xs">TECHNOLOGY & INNOVATION</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">

        {/* Breaking News Banner */}
        <div className="bg-black text-white px-4 md:px-6 py-3 mb-6 md:mb-8 border-2 md:border-4 border-black">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4 text-center">
            <span className="font-serif font-bold text-sm md:text-lg uppercase tracking-wider">Breaking</span>
            <span className="font-serif text-xs md:text-base">AI Systems Surpass Human Performance in Complex Reasoning Tasks</span>
          </div>
        </div>

        {/* Hero Article */}
        <article className="border-b-2 md:border-b-4 border-black pb-6 md:pb-10 mb-6 md:mb-10">
          <div className="grid md:grid-cols-5 gap-6 md:gap-8">
            <div className="md:col-span-3">
              <div className="mb-3 md:mb-4">
                <span className="inline-block bg-black text-white px-2 md:px-3 py-1 text-[10px] md:text-xs font-serif font-bold tracking-wide">FEATURED STORY</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-[1.1] mb-4 md:mb-6 text-gray-900">
                The Dawn of Artificial Intelligence: A New Era of Human-Machine Collaboration
              </h2>
              <p className="text-xs md:text-sm uppercase tracking-wide mb-3 md:mb-4 text-gray-500 font-serif">
                Technology • By Dr. Sarah Mitchell • 5 min read
              </p>
              <div className="border-l-2 md:border-l-4 border-black pl-3 md:pl-4 mb-4 md:mb-6">
                <p className="font-serif text-base md:text-lg lg:text-xl italic leading-relaxed text-gray-700">
                  "We are not replacing humans with machines; we are augmenting human potential in ways previously unimaginable. This is the fundamental shift that defines our era."
                </p>
              </div>
              <p className="font-serif text-sm md:text-base lg:text-lg leading-relaxed mb-3 md:mb-4">
                In the rapidly evolving landscape of modern technology, artificial intelligence stands as perhaps the most transformative force of our generation. What once existed only in the realm of science fiction has become an integral part of our daily lives, reshaping industries, redefining work, and reimagining what's possible.
              </p>
              <p className="font-serif text-sm md:text-base lg:text-lg leading-relaxed mb-3 md:mb-4">
                From the algorithms that curate our social media feeds to the systems that power autonomous vehicles, AI has woven itself into the fabric of contemporary society. Yet, as we stand at this technological crossroads, the question remains: are we witnessing the birth of a tool that will elevate human potential, or the beginning of a fundamental shift in the relationship between humanity and technology?
              </p>
              <p className="font-serif text-sm md:text-base lg:text-lg leading-relaxed mb-3 md:mb-4 hidden sm:block">
                Recent developments in large language models, computer vision, and reinforcement learning have demonstrated capabilities that seemed impossible just a decade ago. These systems can now write poetry, diagnose diseases, compose music, and even engage in philosophical discussions with a nuance that challenges our understanding of intelligence itself.
              </p>
              <p className="font-serif text-sm md:text-base lg:text-lg leading-relaxed hidden sm:block">
                But with great power comes great responsibility. Industry leaders, ethicists, and policymakers are grappling with questions of governance, fairness, and the societal implications of AI deployment at scale. The decisions we make today will echo through generations to come.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="relative h-48 md:h-72 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center border-2 md:border-4 border-black overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?q=80&w=1296&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="AI Technology Visualization"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Related Statistics */}
              <div className="bg-gray-100 border-2 border-black p-4 md:p-6">
                <h4 className="font-serif font-bold text-lg md:text-xl mb-3 md:mb-4 border-b-2 border-black pb-2">By The Numbers</h4>
                <div className="space-y-2 md:space-y-3">
                  <div>
                    <p className="text-3xl md:text-4xl font-bold font-serif">85%</p>
                    <p className="text-xs md:text-sm font-serif text-gray-700">of enterprises now use AI in some capacity</p>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-bold font-serif">$500B</p>
                    <p className="text-xs md:text-sm font-serif text-gray-700">projected AI market value by 2028</p>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-bold font-serif">97M</p>
                    <p className="text-xs md:text-sm font-serif text-gray-700">new jobs created by AI globally</p>
                  </div>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-white border-2 border-black p-4">
                <h4 className="font-serif font-bold text-xs md:text-sm uppercase tracking-wide mb-3">Inside This Issue</h4>
                <ul className="space-y-2 text-xs md:text-sm font-serif">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Machine Learning fundamentals explained</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>The ethics debate: Who controls AI?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>AI in healthcare: Saving lives today</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Global impact: Climate & sustainability</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>

        {/* Secondary Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-6 md:mb-10">

          {/* Article 2 - Machine Learning Deep Dive */}
          <article className="border-b-2 border-gray-400 pb-6 md:pb-8">
            <div className="relative h-48 md:h-64 flex items-center justify-center mb-4 md:mb-6 border-2 md:border-4 border-black overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1674027444636-ce7379d51252?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D"
                alt="Machine Learning Visualization"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="mb-3">
              <span className="inline-block bg-green-600 text-white px-2 py-1 text-xs font-serif font-bold">DEEP DIVE</span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">
              Machine Learning: The Engine Behind the Revolution
            </h3>
            <p className="text-xs md:text-sm uppercase tracking-wide mb-3 md:mb-4 text-gray-500 font-serif">
              By Prof. James Chen • 8 min read
            </p>
            <p className="font-serif text-sm md:text-base leading-relaxed mb-3 md:mb-4">
              At the heart of AI's capabilities lies machine learning, a sophisticated approach that allows computers to learn from data without explicit programming. Unlike traditional software, which follows predetermined rules, machine learning systems identify patterns, make predictions, and continuously improve their performance through experience.
            </p>
            <p className="font-serif text-sm md:text-base leading-relaxed mb-3 md:mb-4 hidden sm:block">
              The breakthrough came with deep neural networks—layered systems inspired by the human brain's structure. These networks process information through interconnected nodes, each learning to recognize increasingly complex features. The first layer might detect edges in an image, the next recognizes shapes, and deeper layers identify complete objects.
            </p>
            <p className="font-serif text-sm md:text-base leading-relaxed hidden sm:block">
              Today's models contain billions of parameters, trained on vast datasets that encompass human knowledge. They've mastered tasks from natural language understanding to protein folding prediction, opening doors to innovations that seemed impossible just years ago. The question is no longer what machines can learn, but what they will learn next.
            </p>
          </article>

          {/* Article 3 - Ethics */}
          <article className="border-b-2 border-gray-400 pb-6 md:pb-8">
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 flex items-center justify-center mb-4 md:mb-6 border-2 md:border-4 border-black overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1640158615573-cd28feb1bf4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGF0YSUyMGdvdmVybmFuY2V8ZW58MHx8MHx8fDA%3D"
                alt="Ethics Visualization"
                fill
                className="object-cover"
              />
            </div>
            <div className="mb-3">
              <span className="inline-block bg-red-600 text-white px-2 py-1 text-xs font-serif font-bold">OPINION</span>
            </div>
            <h3 className="font-serif text-4xl font-bold mb-4 leading-tight">
              Navigating the Ethical Landscape of AI: Who Decides the Rules?
            </h3>
            <p className="text-sm uppercase tracking-wide mb-4 text-gray-500 font-serif">
              By Dr. Maya Patel • 6 min read
            </p>
            <p className="font-serif text-base leading-relaxed mb-4">
              As AI systems become more powerful and pervasive, questions of ethics, bias, and accountability have moved from academic discussions to urgent public concerns. How do we ensure that these systems are fair, transparent, and aligned with human values? The answers will shape our technological future.
            </p>
            <p className="font-serif text-base leading-relaxed mb-4">
              Consider facial recognition systems that show bias against certain ethnic groups, or hiring algorithms that discriminate based on gender. These aren't hypothetical concerns—they're documented failures that have real consequences for real people. The data we train on reflects historical biases, and without careful intervention, our AI systems perpetuate and amplify them.
            </p>
            <p className="font-serif text-base leading-relaxed">
              We need robust frameworks for AI governance: transparent development processes, diverse teams building these systems, and regulatory oversight that keeps pace with innovation. The technology is advancing faster than our ability to manage it, making this moment critical for establishing guardrails that protect humanity while enabling progress.
            </p>
          </article>
        </div>

        {/* Three Column Features */}
        <div className="border-t-4 border-black pt-8 mb-8">
          <h3 className="font-serif text-3xl font-bold mb-6 text-center uppercase tracking-wide">More From This Issue</h3>
          <div className="grid md:grid-cols-3 gap-8">

            {/* Workplace */}
            <article className="border-2 border-black p-6 bg-white">
              <div className="relative h-40 bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center mb-4 border-2 border-black">
                <div className="text-white text-center p-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <span className="inline-block bg-indigo-600 text-white px-2 py-1 text-xs font-serif font-bold mb-3">BUSINESS</span>
              <h4 className="font-serif text-2xl font-bold mb-3 leading-tight">AI in the Workplace: Friend or Foe?</h4>
              <p className="text-sm font-serif leading-relaxed mb-3 text-gray-700">
                Automation and augmentation are transforming how we work, creating new opportunities while challenging traditional employment models. Recent studies show that workers who embrace AI tools see productivity increases of up to 40%.
              </p>
              <p className="text-sm font-serif leading-relaxed text-gray-700">
                But the transition isn't without pain. Manufacturing jobs are declining, while demand for AI specialists skyrockets. The future belongs to those who can adapt, learn, and work alongside intelligent systems.
              </p>
            </article>

            {/* Healthcare */}
            <article className="border-2 border-black p-6 bg-white">
              <div className="relative h-40 bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center mb-4 border-2 border-black">
                <div className="text-white text-center p-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
              <span className="inline-block bg-pink-600 text-white px-2 py-1 text-xs font-serif font-bold mb-3">HEALTH</span>
              <h4 className="font-serif text-2xl font-bold mb-3 leading-tight">Healthcare Revolution: AI Saves Lives</h4>
              <p className="text-sm font-serif leading-relaxed mb-3 text-gray-700">
                AI-powered diagnostics and personalized medicine are ushering in a new age of healthcare, promising better outcomes and earlier interventions. Systems can now detect cancer from scans with greater accuracy than human radiologists.
              </p>
              <p className="text-sm font-serif leading-relaxed text-gray-700">
                Drug discovery, once a decade-long process, is accelerating dramatically. AI models predict molecular interactions, identifying promising compounds in weeks rather than years. The next breakthrough medication might be designed by an algorithm.
              </p>
            </article>

            {/* Global Impact */}
            <article className="border-2 border-black p-6 bg-white">
              <div className="relative h-40 bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mb-4 border-2 border-black">
                <div className="text-white text-center p-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <span className="inline-block bg-amber-600 text-white px-2 py-1 text-xs font-serif font-bold mb-3">ENVIRONMENT</span>
              <h4 className="font-serif text-2xl font-bold mb-3 leading-tight">The Global Impact: Fighting Climate Change</h4>
              <p className="text-sm font-serif leading-relaxed mb-3 text-gray-700">
                From climate modeling to resource optimization, AI is becoming an essential tool in addressing humanity's greatest challenges. Machine learning algorithms optimize energy grids, reducing waste and carbon emissions.
              </p>
              <p className="text-sm font-serif leading-relaxed text-gray-700">
                Satellite imagery analyzed by AI tracks deforestation in real-time, while predictive models help farmers adapt to changing weather patterns. Technology alone won't solve climate change, but it's giving us the tools to fight back.
              </p>
            </article>
          </div>
        </div>

        {/* Editor's Note */}
        <div className="bg-gray-100 border-4 border-black p-8 my-10">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-serif text-2xl font-bold mb-4 uppercase tracking-wide text-center border-b-2 border-black pb-3">Editor's Note</h3>
            <p className="font-serif text-lg leading-relaxed text-center italic">
              "Plain Theory exists to cut through the noise and deliver thoughtful analysis of the technologies shaping our world. In this inaugural digital edition, we explore artificial intelligence not as science fiction, but as the reality that surrounds us. Understanding these systems—their potential and their limitations—is no longer optional. It's essential. Thank you for reading."
            </p>
            <p className="font-serif text-sm text-center mt-4 font-bold">— The Editorial Board</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black py-8 bg-black text-[#f5f5dc]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="font-serif text-3xl font-bold mb-2">Plain Theory</h2>
            <p className="font-serif text-sm opacity-75">Thoughtful analysis for the digital age</p>
          </div>
          <div className="border-t border-[#f5f5dc] opacity-30 mb-6"></div>
          <div className="text-center">
            <p className="font-serif text-sm">&copy; 2025 Plain Theory Digital Publishing. All rights reserved.</p>
            <p className="font-serif text-xs mt-3 opacity-60">
              A publication dedicated to clarity, insight, and discourse in technology and innovation.
            </p>
            {/* Hidden secret hint */}
            <p className="font-serif text-[8px] mt-6 opacity-20 hover:opacity-100 transition-opacity cursor-default select-none">
              Secret: Click the masthead 5 times
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
