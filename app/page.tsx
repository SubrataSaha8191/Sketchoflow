"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Wand2, ImagePlus } from "lucide-react";
import LaserFlow from "@/components/LaserFlow";
import LightRays from "@/components/LightRays";
import GenerateButton from "@/components/GenerateButton";
import JoinToday from "@/components/JoinToday";
import AuthButtons from "@/components/AuthButtons";
import ShinyText from "@/components/ShinyText";
import TextType from "@/components/TextType";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { GridBeam } from "@/components/background-grid-beam";
import { CosmicParallaxBg } from "@/components/parallax-cosmic-background";
import { useTheme, ColorTheme } from "@/context/ThemeContext";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'generate' | 'sketch' | 'upload'>('generate');
  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Section refs for intersection observer
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const workspaceSectionRef = useRef<HTMLDivElement>(null);
  const developmentSectionRef = useRef<HTMLDivElement>(null);
  const studioSectionRef = useRef<HTMLDivElement>(null);
  
  const { setButtonTheme } = useTheme();

  // Setup intersection observers for section-based theme switching
  useEffect(() => {
    const sectionThemes: { ref: React.RefObject<HTMLDivElement | null>; theme: ColorTheme }[] = [
      { ref: heroSectionRef, theme: 'purple' },
      { ref: workspaceSectionRef, theme: 'blue' },
      { ref: developmentSectionRef, theme: 'green' },
      { ref: studioSectionRef, theme: 'pink' },
    ];

    // Track which sections are currently intersecting and their ratios
    const intersectingRatios = new Map<ColorTheme, number>();

    const updateTheme = () => {
      let maxRatio = 0;
      let activeTheme: ColorTheme = 'purple';
      
      intersectingRatios.forEach((ratio, theme) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          activeTheme = theme;
        }
      });
      
      if (maxRatio > 0.1) {
        setButtonTheme(activeTheme);
      }
    };

    const observers: IntersectionObserver[] = [];

    sectionThemes.forEach(({ ref, theme }) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              intersectingRatios.set(theme, entry.intersectionRatio);
            } else {
              intersectingRatios.delete(theme);
            }
            updateTheme();
          });
        },
        { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
      );

      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [setButtonTheme]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResult({ message: "Image generated successfully!" });
      setLoading(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen text-white overflow-x-hidden bg-zinc-900">
      {/* ========== FIXED NAVBAR - Outside all sections ========== */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-100 w-[90%] max-w-4xl">
        <div className="relative backdrop-blur-2xl bg-linear-to-r from-white/8 to-white/4 border border-white/8 rounded-full px-8 py-3 flex items-center justify-between shadow-lg shadow-black/20">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 rounded-full bg-linear-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
          
          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-zinc-700 to-zinc-800 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">SketchoFlow</span>
          </div>
          
          {/* Auth Buttons */}
          <AuthButtons />
        </div>
      </nav>

      {/* ========== SECTION 1: HERO WITH LASERFLOW ========== */}
      <section ref={heroSectionRef} className="relative min-h-[200vh] pb-32 bg-zinc-900">
        {/* LaserFlow Background - Extends through container */}
        <div className="absolute inset-x-0 top-0 h-[160vh] z-0">
          <LaserFlow
            color="#a855f7"
            flowSpeed={0.35}
            wispDensity={1.2}
            wispSpeed={15.0}
            wispIntensity={5.0}
            fogIntensity={0.5}
            fogScale={0.3}
            horizontalBeamOffset={0.0}
            verticalBeamOffset={-0.26}
            verticalSizing={3.0}
            horizontalSizing={0.8}
            flowStrength={0.5}
            decay={1.0}
            falloffStart={1.5}
          />
        </div>
        
        {/* No fade - let it blend naturally with LightRays */}
        
        {/* Lottie Animation - Right Side */}
        <div className="absolute inset-0 z-2 pointer-events-none overflow-hidden">
          {/* Right side - Graphic Design Lottie */}
          <div className="absolute right-[-12%] top-[6%] w-[600px] md:w-[850px] lg:w-[1100px] opacity-95">
            <DotLottieReact
              src="/Photo slide animation.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10">
          {/* Top Section - Hero Text Left Aligned */}
          <div className="px-6 md:px-12 lg:px-20 pt-32 md:pt-40 pb-8 md:pb-12">
            <div className="max-w-xl text-left">
              {/* Main Heading with TypeText effect on full heading */}
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 md:mb-10 min-h-[2.4em]" style={{ fontFamily: 'var(--font-heading)' }}>
                <TextType
                  text={[
                    "Unleash Creativity",
                    "Design with AI",
                    "Transform Your Ideas",
                    "Create Beautiful Art",
                    "Build the Future"
                  ]}
                  typingSpeed={60}
                  deletingSpeed={35}
                  pauseDuration={2500}
                  loop={true}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorClassName="text-purple-400 ml-1"
                  className="inline"
                  splitFirstWord={true}
                  firstWordClassName="text-white"
                  restWordsClassName="bg-linear-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent"
                />
              </div>
              
              {/* Subtext with ShinyText */}
              <div className="text-base sm:text-lg md:text-xl mb-6 font-medium tracking-wide">
                <ShinyText 
                  text="Generate, sketch, or transform with the power of AI — all from one seamless workspace."
                  speed={4}
                />
              </div>
              
              {/* Additional descriptive text */}
              <p className="text-sm sm:text-base text-gray-400 mb-4 leading-relaxed font-normal tracking-wide">
                Whether you're a designer, developer, or creator — SketchoFlow brings your imagination to life with cutting-edge AI tools.
              </p>
              <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed font-normal tracking-wide">
                From wireframes to polished designs, from rough sketches to production-ready assets. No limits, just creativity.
              </p>
              
              {/* JoinToday Button */}
              <div className="relative z-30">
                <JoinToday />
              </div>
            </div>
          </div>

          {/* Image with Container Scroll Animation */}
          <div className="-mt-16 md:-mt-44 relative z-10">
            <ContainerScroll
              titleComponent={<></>}
            >
              <img 
                src="/SketchoFlow Landing.png" 
                alt="SketchoFlow AI Workspace" 
                className="w-full h-full object-cover object-top rounded-2xl"
              />
            </ContainerScroll>
          </div>
          
          {/* ========== WORKSPACE SECTION with LightRays ========== */}
          <div ref={workspaceSectionRef} className="relative -mt-32">
            {/* LightRays background - positioned behind content, extends up to blend sections */}
            <div className="absolute inset-x-0 -top-80 h-[800px] z-0 pointer-events-none">
              <LightRays
                raysOrigin="top-center"
                raysColor="#e4e4e7"
                raysSpeed={1.3}
                lightSpread={2.0}
                rayLength={1.8}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0.1}
                distortion={0.02}
                className="custom-rays"
              />
            </div>
            
            {/* Content above LightRays */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-32">
              <div className="text-center mb-16 space-y-6">
                <h2 className="text-5xl md:text-6xl font-extrabold" style={{ fontFamily: 'var(--font-heading)' }}>
                  Your Professional{" "}
                  <span className="bg-linear-to-r from-zinc-500 via-zinc-400 to-zinc-300 bg-clip-text text-transparent">
                    AI Workspace
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto font-normal tracking-wide">
                  Generate, sketch, or transform — all in one seamless interface designed for creators.
                </p>

                {/* Professional Workspace Tool Card - Transparent to blend with LightRays */}
              <div className="relative group ">
                {/* Main card with transparent design */}
                <div className="relative bg-zinc-900/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10">
                  {/* Toolbar Header */}
                  <div className="relative flex items-center justify-between px-6 py-4 bg-zinc-800 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <span className="text-sm font-semibold text-gray-300">AI Workspace</span>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex gap-1 bg-zinc-800/50 backdrop-blur-sm rounded-lg p-1 border border-white/5">
                  {(['generate', 'sketch', 'upload'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setActiveMode(mode)}
                      className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium text-sm transition-all ${
                        activeMode === mode
                          ? 'bg-linear-to-r from-blue-600 to-blue-400 text-white shadow-md shadow-zinc-500/25'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {mode === 'generate' && <Sparkles className="w-4 h-4" />}
                      {mode === 'sketch' && <Wand2 className="w-4 h-4" />}
                      {mode === 'upload' && <ImagePlus className="w-4 h-4" />}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex">
                {/* Sidebar - Tool Properties */}
                <div className="w-80 bg-zinc-900/50 backdrop-blur-sm border-r border-white/5 p-6 space-y-6">
                  {activeMode === 'generate' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                          Prompt
                        </label>
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe your vision in detail..."
                          className="w-full h-32 px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none font-mono transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Style</label>
                        <div className="relative">
                          <select className="w-full px-4 py-3 pr-10 bg-zinc-800 border border-purple-500/30 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer hover:border-purple-500/50">
                            <option className="bg-zinc-800 text-white py-2">Photorealistic</option>
                            <option className="bg-zinc-800 text-white py-2">Anime</option>
                            <option className="bg-zinc-800 text-white py-2">Oil Painting</option>
                            <option className="bg-zinc-800 text-white py-2">Digital Art</option>
                            <option className="bg-zinc-800 text-white py-2">3D Render</option>
                            <option className="bg-zinc-800 text-white py-2">Watercolor</option>
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Aspect Ratio</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['16:9', '1:1', '9:16', '4:3'].map((ratio) => (
                          <button
                            key={ratio}
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-gray-300 hover:border-blue-500 hover:text-white transition-all"
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quality</label>
                      <input type="range" min="1" max="100" defaultValue="80" className="w-full accent-blue-600" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Draft</span>
                        <span>High Quality</span>
                      </div>
                    </div>

                    <div 
                      onClick={!loading && prompt ? handleGenerate : undefined} 
                      className={`${!prompt || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <GenerateButton />
                    </div>
                  </>
                )}

                {activeMode === 'sketch' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Canvas Settings
                      </label>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">Brush Size</label>
                          <input type="range" min="1" max="50" defaultValue="5" className="w-full accent-purple-600" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">Opacity</label>
                          <input type="range" min="0" max="100" defaultValue="100" className="w-full accent-purple-600" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Enhancement Prompt
                      </label>
                      <textarea
                        placeholder="Describe how to enhance your sketch..."
                        className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>

                    <Button
                      disabled
                      className="w-full py-3 text-sm font-semibold bg-purple-600/50 rounded-lg cursor-not-allowed"
                    >
                      <Wand2 className="w-4 h-4" />
                      Render Sketch
                    </Button>
                  </>
                )}

                {activeMode === 'upload' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Transformation
                      </label>
                      <textarea
                        placeholder="Describe the transformation..."
                        className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Strength</label>
                      <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-pink-600" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Subtle</span>
                        <span>Strong</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Mode</label>
                      <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                        <option>Enhance</option>
                        <option>Style Transfer</option>
                        <option>Upscale</option>
                        <option>Remove Background</option>
                      </select>
                    </div>

                    <Button
                      disabled={!preview}
                      className="w-full py-3 text-sm font-semibold bg-pink-600 hover:bg-pink-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ImagePlus className="w-4 h-4" />
                      Transform
                    </Button>
                  </>
                )}
              </div>

              {/* Main Canvas Area */}
              <div className="flex-1 p-8 min-h-[600px] bg-zinc-950/30">
                {activeMode === 'generate' && (
                  <div className="h-full flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-white/5 relative overflow-hidden">
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    
                    {loading ? (
                      <div className="relative text-center text-gray-400">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-lg font-medium">Generating your image...</p>
                        <p className="text-sm mt-2 text-gray-500">This may take a few moments</p>
                      </div>
                    ) : result ? (
                      <div className="relative w-full h-full flex items-center justify-center p-8">
                        <div className="max-w-full max-h-full bg-linear-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm">
                          <p className="text-lg font-medium text-green-400 text-center">{result.message}</p>
                          <p className="text-sm text-gray-400 text-center mt-2">Image preview would display here</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative text-center text-gray-500">
                        <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Preview will appear here</p>
                        <p className="text-sm mt-2">Enter a prompt and click Generate</p>
                      </div>
                    )}
                  </div>
                )}

                {activeMode === 'sketch' && (
                  <div className="h-full bg-white/95 rounded-2xl border border-white/10 relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Wand2 className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-medium">Drawing Canvas</p>
                        <p className="text-sm mt-2">Canvas functionality coming soon</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeMode === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-full flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/10 cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group"
                  >
                    {preview ? (
                      <img src={preview} alt="preview" className="max-w-full max-h-full object-contain rounded-xl" />
                    ) : (
                      <div className="text-center text-gray-500 group-hover:text-pink-400 transition-colors">
                        <Upload className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-medium">Drop image here or click to browse</p>
                        <p className="text-sm mt-2">PNG, JPG, WebP up to 10MB</p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Right Sidebar - Layers/History */}
              <div className="w-64 bg-zinc-900/50 backdrop-blur-sm border-l border-white/5 p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Layers</h3>
                  <div className="space-y-2">
                    <div className="px-3 py-2.5 bg-zinc-800/50 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer">
                      <p className="text-sm text-gray-300">Generated Image</p>
                      <p className="text-xs text-gray-500 mt-1">100%</p>
                    </div>
                    <div className="px-3 py-2.5 bg-zinc-800/30 rounded-xl border border-white/5">
                      <p className="text-sm text-gray-400">Background</p>
                      <p className="text-xs text-gray-600 mt-1">Locked</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">History</h3>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all">Generated image</div>
                    <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all">Adjusted prompt</div>
                    <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all">Initial state</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-6 py-2.5 bg-zinc-900/50 border-t border-white/5 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Ready</span>
              </div>
              <span>AI Model: Vision</span>
              <span>100% • 1920x1080</span>
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

      {/* ========== SECTION 3: AI ANIMATION FEATURES ========== */}
      <section ref={developmentSectionRef} className="relative bg-zinc-900 -mt-32">
        {/* GridBeam Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <GridBeam className="opacity-60">
            <div></div>
          </GridBeam>
        </div>

        {/* Gradient overlay for blending with section 2 */}
        <div className="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-zinc-900 via-zinc-900/80 to-transparent z-1 pointer-events-none" />

        {/* Content - z-index lower than navbar (z-50) */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 pt-48 pb-32">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-5xl md:text-6xl font-extrabold" style={{ fontFamily: 'var(--font-heading)' }}>
              AI-Powered{" "}
              <span className="bg-linear-to-r from-green-500 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Animation
              </span>
              {" "}Studio
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-normal tracking-wide">
              From text-to-video to SVG animations — discover the complete toolkit for creating stunning motion graphics with AI.
            </p>
          </div>

          {/* Features Grid - 4 columns on large screens */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: AI Video Animations */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/40 transition-all duration-300">
                <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Text → Video</h3>
                  <p className="text-sm text-gray-400 mb-4">Generate full animations from text prompts. Create explainer scenes, logo reveals, and character sequences.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Runway', 'Pika', 'PixVerse'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-purple-500/10 text-purple-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: GIF Animations */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-pink-500/40 transition-all duration-300">
                <div className="absolute -inset-0.5 bg-linear-to-r from-pink-500/20 to-rose-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">GIF Animations</h3>
                  <p className="text-sm text-gray-400 mb-4">Perfect for websites and apps. Loop-friendly, transparency support, simple to embed anywhere.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Canva AI', 'Runway', 'Pika'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-pink-500/10 text-pink-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: SVG Animations */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-green-500/40 transition-all duration-300">
                <div className="absolute -inset-0.5 bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">SVG Animations</h3>
                  <p className="text-sm text-gray-400 mb-4">Vector-based, lightweight code. Perfect for UI micro-interactions and web animations.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['SVGator', 'Haikei', 'Figma'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Motion Graphics */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-500/40 transition-all duration-300">
                <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2m0 2v2m0-2h10M7 8v12a2 2 0 002 2h6a2 2 0 002-2V8M7 8H5a2 2 0 00-2 2v2a2 2 0 002 2h2m10-6h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Motion Graphics</h3>
                  <p className="text-sm text-gray-400 mb-4">AI-assisted motion design. Create UI transitions, icon animations, and marketing visuals.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Jitter', 'Runway', 'AE Plugins'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5: Image → Animation */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/40 transition-all duration-300">
                <div className="absolute -inset-0.5 bg-linear-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Image → Animation</h3>
                  <p className="text-sm text-gray-400 mb-4">Animate any image. Create talking avatars, character motion, and logo morphing effects.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['D-ID', 'Viggle', 'Kyber'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-orange-500/10 text-orange-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 6: 3D AI Animation */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-violet-500/40 transition-all duration-300">
                <div className="absolute -inset-0.5 bg-linear-to-r from-violet-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">3D Animation</h3>
                  <p className="text-sm text-gray-400 mb-4">Cinematic 3D shots and camera movements. Perfect for AR/VR, portfolios, and showcases.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Wonder', 'Move.ai', 'Luma'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-violet-500/10 text-violet-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 7: Sprite Sheets */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-yellow-500/40 transition-all duration-300">
                <div className="absolute -inset-0.5 bg-linear-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Sprite Sheets</h3>
                  <p className="text-sm text-gray-400 mb-4">2D game-style animations. Lightweight sprites perfect for web apps and game development.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Leonardo', 'Aseprite', 'AI Plugins'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-yellow-500/10 text-yellow-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 8: CSS Animations */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-teal-500/40 transition-all duration-300">
                <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">CSS Animations</h3>
                  <p className="text-sm text-gray-400 mb-4">Text to CSS code. Super lightweight animations for buttons, loaders, and transitions.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['AnimateUI', 'MagicMotion', 'AI CSS'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-teal-500/10 text-teal-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Two Column Lottie Showcase */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {/* Web Animations Lottie Card */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/40 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-green-500/30 transition-all duration-500">
                <div className="absolute -inset-1 bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-full aspect-4/3 mb-6 flex items-center justify-center">
                    <DotLottieReact
                      src="/Web Development.lottie"
                      loop
                      autoplay
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    Web Animations
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Generate lightweight SVG, CSS, and Lottie animations for websites. Perfect for micro-interactions, loaders, and UI transitions.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['Lottie', 'SVG', 'CSS', 'GSAP'].map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Video & Motion Graphics Lottie Card */}
            <div className="group relative">
              <div className="relative h-full bg-zinc-800/40 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-500">
                <div className="absolute -inset-1 bg-linear-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-full aspect-4/3 mb-6 flex items-center justify-center">
                    <DotLottieReact
                      src="/New app development on desktop.lottie"
                      loop
                      autoplay
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    Video & Motion
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Create stunning video animations, motion graphics, and 3D renders from text prompts. Export to any format you need.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['MP4', 'GIF', '3D', 'After Effects'].map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16 relative z-40 pb-32">
            <p className="text-gray-500 mb-6">Ready to create stunning animations with AI?</p>
            <button className="px-8 py-4 bg-linear-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
              Try Animation Studio
            </button>
          </div>
        </div>

        {/* Gradient fade matching cosmic background color */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: '50vh', background: 'linear-gradient(to bottom, transparent 0%, rgba(15, 26, 40, 0.1) 10%, rgba(15, 26, 40, 0.2) 20%, rgba(15, 26, 40, 0.35) 35%, rgba(15, 26, 40, 0.5) 50%, rgba(15, 26, 40, 0.7) 70%, rgba(15, 26, 40, 0.9) 90%, rgba(15, 26, 40, 1) 100%)', zIndex: 10, pointerEvents: 'none' }} />
      </section>

      {/* ========== SECTION 4: ANIMATION STUDIO WORKSPACE ========== */}
      <section ref={studioSectionRef} className="relative min-h-screen overflow-hidden">
        {/* Cosmic Parallax Background - Full height with stars */}
        <div className="absolute inset-0 z-0">
          <CosmicParallaxBg 
            head=""
            text=""
            loop={true}
            showText={false}
          />
        </div>
        
        {/* Gradient fade matching cosmic background color */}
        <div className="absolute inset-x-0 top-0" style={{ height: '50vh', background: 'linear-gradient(to bottom, rgba(15, 26, 40, 1) 0%, rgba(15, 26, 40, 0.9) 10%, rgba(15, 26, 40, 0.7) 30%, rgba(15, 26, 40, 0.5) 50%, rgba(15, 26, 40, 0.35) 65%, rgba(15, 26, 40, 0.2) 80%, rgba(15, 26, 40, 0.1) 90%, transparent 100%)', zIndex: 10, pointerEvents: 'none' }} />
        
        {/* Push content down to position below curve */}
        <div className="relative z-20 pt-[62vh] pb-32">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-sm font-medium text-pink-400">Now Available</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-extrabold" style={{ fontFamily: 'var(--font-heading)' }}>
                Your{" "}
                <span className="bg-linear-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                  Animation
                </span>
                {" "}Workspace
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto font-normal tracking-wide">
                A unified creative environment for all your animation needs. Generate, edit, and export — all in one powerful interface.
              </p>
            </div>

            {/* Animation Studio Workspace */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Top Toolbar */}
              <div className="bg-zinc-950/90 border-b border-white/5 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">Untitled Animation</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Undo">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                  <button className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Redo">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                    </svg>
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-2"></div>
                  <button className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-700 text-white rounded transition-colors">
                    Export
                  </button>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="flex h-[600px]">
                {/* Left Sidebar - Tools */}
                <div className="w-16 bg-zinc-950/50 border-r border-white/5 flex flex-col items-center py-4 gap-2">
                  {[
                    { icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', title: 'Select' },
                    { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Image' },
                    { icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', title: 'Draw' },
                    { icon: 'M4 6h16M4 12h16M4 18h16', title: 'Text' },
                    { icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', title: 'Effects' },
                  ].map((tool, idx) => (
                    <button
                      key={idx}
                      className={`p-2 rounded transition-colors ${idx === 0 ? 'bg-pink-600/20 text-pink-400' : 'text-gray-400 hover:bg-white/5'}`}
                      title={tool.title}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Center - Canvas Area */}
                <div className="flex-1 bg-zinc-900/50 relative">
                  {/* Canvas Grid Background */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}>
                    {/* Canvas Content Area */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[500px] h-[400px] bg-white/5 border-2 border-dashed border-pink-500/30 rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                          </svg>
                          <div className="text-gray-500 text-sm">
                            <p className="font-medium">Drop files or generate animation</p>
                            <p className="text-xs text-gray-600 mt-1">Supports MP4, GIF, WebM, Lottie</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Canvas Controls - Bottom Left */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                    <button className="p-1 hover:bg-white/5 rounded transition-colors">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-400 font-mono">100%</span>
                    <button className="p-1 hover:bg-white/5 rounded transition-colors">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right Sidebar - Properties */}
                <div className="w-72 bg-zinc-950/50 border-l border-white/5 overflow-y-auto">
                  <div className="p-4 space-y-6">
                    {/* Animation Type */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">Animation Type</label>
                      <select className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-pink-500">
                        <option>Fade In/Out</option>
                        <option>Slide</option>
                        <option>Scale</option>
                        <option>Rotate</option>
                        <option>Custom</option>
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">Duration (seconds)</label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="10" 
                        step="0.5" 
                        defaultValue="2"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.5s</span>
                        <span>10s</span>
                      </div>
                    </div>

                    {/* Easing */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">Easing Function</label>
                      <select className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-pink-500">
                        <option>ease-in-out</option>
                        <option>linear</option>
                        <option>ease-in</option>
                        <option>ease-out</option>
                        <option>cubic-bezier</option>
                      </select>
                    </div>

                    {/* Style Presets */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">Style Preset</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Cinematic', 'Minimal', 'Neon', 'Retro'].map((style) => (
                          <button
                            key={style}
                            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-xs text-gray-300 transition-colors"
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Export Format */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">Export Format</label>
                      <div className="flex gap-2">
                        {['MP4', 'GIF', 'WebM', 'JSON'].map((format) => (
                          <button
                            key={format}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                              format === 'MP4' 
                                ? 'bg-pink-600 text-white' 
                                : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
                            }`}
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button className="w-full bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Animation
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Timeline */}
              <div className="bg-zinc-950/90 border-t border-white/5 px-4 py-3">
                <div className="flex items-center gap-4">
                  {/* Playback Controls */}
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="p-1.5 bg-pink-600 hover:bg-pink-700 rounded transition-colors">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Timeline Ruler */}
                  <div className="flex-1 bg-zinc-900 rounded overflow-hidden h-12 relative">
                    <div className="absolute inset-0 flex items-center">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex-1 border-l border-white/5 h-full relative">
                          {i % 5 === 0 && (
                            <span className="absolute top-1 left-1 text-[10px] text-gray-600">{i / 2}s</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Playhead */}
                    <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-pink-500">
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-500 rounded-sm"></div>
                    </div>
                  </div>

                  {/* Timeline Controls */}
                  <div className="text-xs text-gray-500 font-mono">0:02.5 / 0:10.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
