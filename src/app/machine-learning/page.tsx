'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Brain } from "lucide-react";

export default function MachineLearningPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      {/* Header */}
      <header className="border-b-4 border-black py-4 md:py-6 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-serif text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
              Machine Learning
            </h1>
            <p className="text-sm md:text-base font-serif text-gray-600">
              Understanding the Engine of Modern AI
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <article className="bg-white border-2 border-black p-6 md:p-10 shadow-lg">
          {/* Featured Image */}
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center mb-8 border-4 border-black">
            <div className="text-white text-center p-4">
              <Brain className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4" />
              <p className="text-lg md:text-xl font-serif font-bold">Neural Networks & Deep Learning</p>
            </div>
          </div>

          {/* Article Meta */}
          <div className="mb-6 flex items-center gap-4 text-sm text-gray-600 font-serif border-b-2 border-gray-200 pb-4">
            <span className="inline-block bg-green-600 text-white px-3 py-1 text-xs font-bold">DEEP DIVE</span>
            <span>By Prof. James Chen</span>
            <span>•</span>
            <span>15 min read</span>
          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              What is Machine Learning?
            </h2>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              At the heart of AI's capabilities lies machine learning, a sophisticated approach that allows computers to learn from data without explicit programming. Unlike traditional software, which follows predetermined rules, machine learning systems identify patterns, make predictions, and continuously improve their performance through experience.
            </p>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              The Evolution of Learning Machines
            </h3>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              The breakthrough came with deep neural networks—layered systems inspired by the human brain's structure. These networks process information through interconnected nodes, each learning to recognize increasingly complex features. The first layer might detect edges in an image, the next recognizes shapes, and deeper layers identify complete objects.
            </p>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              Today's models contain billions of parameters, trained on vast datasets that encompass human knowledge. They've mastered tasks from natural language understanding to protein folding prediction, opening doors to innovations that seemed impossible just years ago. The question is no longer what machines can learn, but what they will learn next.
            </p>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              Types of Machine Learning
            </h3>

            <div className="bg-gray-50 border-l-4 border-green-600 p-6 mb-6">
              <h4 className="font-serif text-xl font-bold mb-3 text-gray-900">1. Supervised Learning</h4>
              <p className="font-serif text-base leading-relaxed text-gray-700">
                The algorithm learns from labeled training data, making predictions based on input-output pairs. Like a student learning from a teacher, the model receives feedback on its accuracy and adjusts accordingly.
              </p>
            </div>

            <div className="bg-gray-50 border-l-4 border-blue-600 p-6 mb-6">
              <h4 className="font-serif text-xl font-bold mb-3 text-gray-900">2. Unsupervised Learning</h4>
              <p className="font-serif text-base leading-relaxed text-gray-700">
                The system discovers hidden patterns in unlabeled data without explicit guidance. It's like exploring a new city without a map—the algorithm finds structure and relationships on its own.
              </p>
            </div>

            <div className="bg-gray-50 border-l-4 border-purple-600 p-6 mb-6">
              <h4 className="font-serif text-xl font-bold mb-3 text-gray-900">3. Reinforcement Learning</h4>
              <p className="font-serif text-base leading-relaxed text-gray-700">
                Agents learn by interacting with an environment, receiving rewards for beneficial actions and penalties for detrimental ones. This approach powers game-playing AIs and autonomous systems.
              </p>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              Real-World Applications
            </h3>

            <p className="font-serif text-lg leading-relaxed mb-4 text-gray-800">
              Machine learning has transformed countless industries:
            </p>

            <ul className="font-serif text-lg leading-relaxed mb-6 text-gray-800 space-y-3 list-disc pl-6">
              <li><strong>Healthcare:</strong> Diagnosing diseases from medical images with superhuman accuracy</li>
              <li><strong>Finance:</strong> Detecting fraudulent transactions in real-time</li>
              <li><strong>Transportation:</strong> Powering self-driving vehicles</li>
              <li><strong>Entertainment:</strong> Recommending content personalized to your tastes</li>
              <li><strong>Manufacturing:</strong> Predicting equipment failures before they occur</li>
            </ul>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              The Future of Machine Learning
            </h3>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              As computing power grows and datasets expand, machine learning systems continue to achieve breakthroughs once thought impossible. From climate modeling to drug discovery, from creative art generation to scientific research, these systems are becoming indispensable tools for human progress.
            </p>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              The challenge ahead isn't just building more powerful models—it's ensuring they're safe, ethical, and beneficial for humanity. As we stand at the frontier of artificial intelligence, machine learning remains the foundation upon which our technological future is being built.
            </p>
          </div>

          {/* Related Articles */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <h3 className="font-serif text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid gap-4">
              <button
                onClick={() => router.push('/llm')}
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-400 transition-colors text-left"
              >
                <BookOpen size={24} />
                <div>
                  <p className="font-serif font-bold text-lg">Large Language Models</p>
                  <p className="font-serif text-sm text-gray-600">Exploring the power of transformer architectures</p>
                </div>
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-400 transition-colors text-left"
              >
                <BookOpen size={24} />
                <div>
                  <p className="font-serif font-bold text-lg">Back to All Articles</p>
                  <p className="font-serif text-sm text-gray-600">Read more about AI and technology</p>
                </div>
              </button>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black py-6 bg-black text-[#f5f5dc] mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-serif text-sm">&copy; 2025 Plain Theory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
