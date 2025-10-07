'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";

export default function LLMPage() {
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
              Large Language Models
            </h1>
            <p className="text-sm md:text-base font-serif text-gray-600">
              The Transformers Revolution in AI
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <article className="bg-white border-2 border-black p-6 md:p-10 shadow-lg">
          {/* Featured Image */}
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mb-8 border-4 border-black">
            <div className="text-white text-center p-4">
              <Sparkles className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4" />
              <p className="text-lg md:text-xl font-serif font-bold">GPT, BERT & Beyond</p>
            </div>
          </div>

          {/* Article Meta */}
          <div className="mb-6 flex items-center gap-4 text-sm text-gray-600 font-serif border-b-2 border-gray-200 pb-4">
            <span className="inline-block bg-purple-600 text-white px-3 py-1 text-xs font-bold">FEATURED</span>
            <span>By Dr. Sarah Mitchell</span>
            <span>•</span>
            <span>12 min read</span>
          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Understanding Large Language Models
            </h2>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              Large Language Models (LLMs) represent one of the most significant breakthroughs in artificial intelligence. These massive neural networks, trained on vast amounts of text data, have demonstrated remarkable abilities to understand, generate, and manipulate human language in ways that were previously thought impossible.
            </p>

            <blockquote className="border-l-4 border-purple-600 pl-6 py-2 mb-6 bg-purple-50">
              <p className="font-serif text-xl italic text-gray-700">
                "LLMs don't just process language—they understand context, nuance, and meaning in ways that blur the line between human and artificial intelligence."
              </p>
            </blockquote>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              The Transformer Architecture
            </h3>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              At the core of modern LLMs lies the transformer architecture, introduced in the groundbreaking 2017 paper "Attention Is All You Need." This revolutionary approach uses self-attention mechanisms to process input sequences in parallel, rather than sequentially, enabling unprecedented scale and performance.
            </p>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              The transformer's ability to capture long-range dependencies and contextual relationships has made it the foundation for models like GPT (Generative Pre-trained Transformer), BERT (Bidirectional Encoder Representations from Transformers), and their countless variants.
            </p>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              How LLMs Work
            </h3>

            <div className="bg-blue-50 border-2 border-blue-300 p-6 mb-6 rounded-lg">
              <h4 className="font-serif text-xl font-bold mb-3 text-gray-900">Training Process</h4>
              <ol className="font-serif text-base leading-relaxed text-gray-700 space-y-3 list-decimal pl-6">
                <li><strong>Pre-training:</strong> The model learns from billions of words across the internet, books, and documents</li>
                <li><strong>Fine-tuning:</strong> Specialized training on specific tasks or domains</li>
                <li><strong>Alignment:</strong> Teaching the model to be helpful, harmless, and honest</li>
                <li><strong>Deployment:</strong> Real-world application with continuous monitoring</li>
              </ol>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              Capabilities of Modern LLMs
            </h3>

            <p className="font-serif text-lg leading-relaxed mb-4 text-gray-800">
              Today's large language models demonstrate impressive versatility:
            </p>

            <ul className="font-serif text-lg leading-relaxed mb-6 text-gray-800 space-y-3 list-disc pl-6">
              <li><strong>Text Generation:</strong> Creating coherent, contextually appropriate content</li>
              <li><strong>Translation:</strong> Converting between languages with near-human accuracy</li>
              <li><strong>Summarization:</strong> Distilling complex documents into concise summaries</li>
              <li><strong>Question Answering:</strong> Understanding and responding to queries</li>
              <li><strong>Code Generation:</strong> Writing functional software from natural language descriptions</li>
              <li><strong>Creative Writing:</strong> Composing stories, poetry, and scripts</li>
              <li><strong>Analysis:</strong> Extracting insights and patterns from text data</li>
            </ul>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              Notable Models
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 border-2 border-gray-300 p-5">
                <h4 className="font-serif text-lg font-bold mb-2 text-purple-700">GPT Series</h4>
                <p className="font-serif text-sm text-gray-700">OpenAI's flagship models, known for exceptional generation capabilities and versatility across tasks.</p>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 p-5">
                <h4 className="font-serif text-lg font-bold mb-2 text-blue-700">Claude</h4>
                <p className="font-serif text-sm text-gray-700">Anthropic's assistant focused on safety, harmlessness, and helpful long-form interactions.</p>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 p-5">
                <h4 className="font-serif text-lg font-bold mb-2 text-green-700">Gemini</h4>
                <p className="font-serif text-sm text-gray-700">Google's multimodal model integrating text, images, and other data types seamlessly.</p>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 p-5">
                <h4 className="font-serif text-lg font-bold mb-2 text-orange-700">Llama</h4>
                <p className="font-serif text-sm text-gray-700">Meta's open-source models democratizing access to powerful language AI.</p>
              </div>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              Challenges and Limitations
            </h3>

            <p className="font-serif text-lg leading-relaxed mb-4 text-gray-800">
              Despite their impressive capabilities, LLMs face several challenges:
            </p>

            <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-6">
              <ul className="font-serif text-base leading-relaxed text-gray-700 space-y-2 list-disc pl-4">
                <li><strong>Hallucinations:</strong> Generating plausible but incorrect information</li>
                <li><strong>Bias:</strong> Reflecting and amplifying biases present in training data</li>
                <li><strong>Cost:</strong> Training and running these models requires enormous computational resources</li>
                <li><strong>Environmental Impact:</strong> Significant energy consumption</li>
                <li><strong>Interpretability:</strong> Understanding why models make specific decisions</li>
              </ul>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 mt-10 text-gray-900">
              The Future of LLMs
            </h3>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              As research continues, we're seeing trends toward:
            </p>

            <ul className="font-serif text-lg leading-relaxed mb-6 text-gray-800 space-y-3 list-disc pl-6">
              <li>More efficient models that maintain performance with fewer parameters</li>
              <li>Better alignment with human values and intentions</li>
              <li>Multimodal capabilities combining text, images, audio, and video</li>
              <li>Improved reasoning and problem-solving abilities</li>
              <li>Domain-specific models optimized for specialized tasks</li>
            </ul>

            <p className="font-serif text-lg leading-relaxed mb-6 text-gray-800">
              The impact of large language models extends far beyond technology—they're reshaping how we work, learn, create, and communicate. As these systems continue to evolve, they promise to become even more integral to our daily lives, serving as collaborators, teachers, and tools for augmenting human intelligence.
            </p>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 p-6 rounded-lg mt-8">
              <p className="font-serif text-base italic text-gray-800 text-center">
                "The question isn't whether LLMs will transform society—it's how we'll shape that transformation to benefit humanity."
              </p>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <h3 className="font-serif text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid gap-4">
              <button
                onClick={() => router.push('/machine-learning')}
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-400 transition-colors text-left"
              >
                <BookOpen size={24} />
                <div>
                  <p className="font-serif font-bold text-lg">Machine Learning Fundamentals</p>
                  <p className="font-serif text-sm text-gray-600">Understanding the foundations of AI</p>
                </div>
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-400 transition-colors text-left"
              >
                <BookOpen size={24} />
                <div>
                  <p className="font-serif font-bold text-lg">Back to All Articles</p>
                  <p className="font-serif text-sm text-gray-600">Explore more technology insights</p>
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
