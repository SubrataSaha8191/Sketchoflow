"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Wand2, ImagePlus, Loader2 } from "lucide-react";
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
import { ParticleCard } from "@/components/MagicBento";
import { useTheme, ColorTheme } from "@/context/ThemeContext";
import TryAnimationStudio from "@/components/TryAnimationStudio";
import SketchCanvas, { SketchCanvasRef } from "@/components/SketchCanvas";
import AuthPopup from "@/components/AuthPopup";
import Loader from "@/components/Loader";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'generate' | 'sketch' | 'upload'>('generate');
  const [prompt, setPrompt] = useState("");
  const [sketchPrompt, setSketchPrompt] = useState("");
  const [transformPrompt, setTransformPrompt] = useState("");
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [renderedSketchImage, setRenderedSketchImage] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isSignupPopupOpen, setIsSignupPopupOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sketchCanvasRef = useRef<SketchCanvasRef>(null);
  
  // Section refs for intersection observer
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const workspaceSectionRef = useRef<HTMLDivElement>(null);
  const developmentSectionRef = useRef<HTMLDivElement>(null);
  const studioSectionRef = useRef<HTMLDivElement>(null);
  
  const { setButtonTheme } = useTheme();

  // Gemini API call function
  const callGeminiAPI = async (mode: 'generate' | 'sketch' | 'transform', imageData?: string | File) => {
    setLoading(true);
    setAiResponse(null);
    
    try {
      const formData = new FormData();
      formData.append("mode", mode);
      
      if (mode === "generate") {
        formData.append("prompt", prompt);
      } else if (mode === "sketch") {
        formData.append("prompt", sketchPrompt);
        if (imageData && typeof imageData === "string") {
          // Convert base64 to blob
          const response = await fetch(imageData);
          const blob = await response.blob();
          formData.append("image", blob, "sketch.png");
        }
      } else if (mode === "transform") {
        formData.append("prompt", transformPrompt);
        if (imageData instanceof File) {
          formData.append("image", imageData);
        }
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        setResult(data);
        setAiResponse(data.result || data.description || data.message);
      } else {
        setAiResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      setAiResponse("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  };

  // Handle Generate (text-to-image)
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await callGeminiAPI("generate");
  };

  // Handle Render Sketch
  const handleRenderSketch = async () => {
    const canvasData = sketchCanvasRef.current?.getCanvasDataUrl();
    if (!canvasData) {
      setAiResponse("Please draw something on the canvas first");
      return;
    }
    // Save the sketch as rendered image for the sidebar
    setRenderedSketchImage(canvasData);
    await callGeminiAPI("sketch", canvasData);
  };

  // Handle Transform Image
  const handleTransformImage = async () => {
    if (!preview) {
      setAiResponse("Please upload an image first");
      return;
    }
    // Get the file from the file input
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      await callGeminiAPI("transform", file);
    }
  };

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

  // Handle ESC key to close zoomed image
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageZoomed) {
        setIsImageZoomed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageZoomed]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
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
                <JoinToday onJoinNowClick={() => setIsSignupPopupOpen(true)} />
              </div>

              {/* Signup Popup */}
              <AuthPopup
                isOpen={isSignupPopupOpen}
                onClose={() => setIsSignupPopupOpen(false)}
                mode="signup"
                onToggleMode={() => {}}
              />

              {/* Zoomed Image Modal */}
              {isImageZoomed && renderedSketchImage && (
                <div 
                  className="fixed inset-0 z-100 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
                  onClick={() => setIsImageZoomed(false)}
                >
                  <div className="relative max-w-4xl max-h-[90vh] w-full">
                    <button
                      onClick={() => setIsImageZoomed(false)}
                      className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors text-sm flex items-center gap-2"
                    >
                      <span>Press ESC or click anywhere to close</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <img 
                      src={renderedSketchImage} 
                      alt="Rendered sketch - zoomed"
                      className="w-full h-full object-contain rounded-lg shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
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
                          <label className="block text-xs text-gray-500 mb-2">Brush Size: {brushSize}px</label>
                          <input 
                            type="range" 
                            min="1" 
                            max="50" 
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-full accent-purple-600" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">Opacity: {opacity}%</label>
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            value={opacity}
                            onChange={(e) => setOpacity(Number(e.target.value))}
                            className="w-full accent-purple-600" 
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Enhancement Prompt
                      </label>
                      <textarea
                        value={sketchPrompt}
                        onChange={(e) => setSketchPrompt(e.target.value)}
                        placeholder="Describe how to enhance your sketch..."
                        className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>

                    <GenerateButton
                      text="Render Sketch"
                      loadingText="Processing"
                      onClick={handleRenderSketch}
                      disabled={loading}
                      loading={loading}
                    />
                  </>
                )}

                {activeMode === 'upload' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Transformation
                      </label>
                      <textarea
                        value={transformPrompt}
                        onChange={(e) => setTransformPrompt(e.target.value)}
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

                    <GenerateButton
                      text="Transform"
                      loadingText="Transforming"
                      onClick={handleTransformImage}
                      disabled={!preview || loading}
                      loading={loading}
                    />
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
                      <div className="relative text-center text-gray-400 w-full h-full flex flex-col items-center justify-center">
                        <div className="relative w-64 h-40">
                          <Loader />
                        </div>
                        <p className="text-lg font-medium mt-8">Generating your image...</p>
                        <p className="text-sm mt-2 text-gray-500">This may take a few moments</p>
                      </div>
                    ) : result ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
                        <div className="max-w-full max-h-full bg-linear-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm">
                          <p className="text-lg font-medium text-green-400 text-center">{result.message || "Generation complete!"}</p>
                          {aiResponse && (
                            <div className="mt-4 max-h-48 overflow-y-auto">
                              <p className="text-xs font-semibold text-purple-400 mb-2">AI Response:</p>
                              <p className="text-sm text-gray-300">{aiResponse}</p>
                            </div>
                          )}
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
                  <div className="h-full rounded-2xl border border-white/10 relative overflow-hidden shadow-inner">
                    <SketchCanvas 
                      ref={sketchCanvasRef}
                      brushSize={brushSize}
                      opacity={opacity}
                      onBrushSizeChange={setBrushSize}
                      onOpacityChange={setOpacity}
                    />
                    {/* Loading overlay for sketch rendering */}
                    {loading && activeMode === 'sketch' && (
                      <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                        <div className="relative w-64 h-40">
                          <Loader />
                        </div>
                        <p className="text-lg font-medium text-gray-300 mt-8">Rendering your sketch...</p>
                        <p className="text-sm mt-2 text-gray-500">AI is enhancing your artwork</p>
                      </div>
                    )}
                    {/* AI Response overlay */}
                    {aiResponse && activeMode === 'sketch' && !loading && (
                      <div className="absolute bottom-20 left-4 right-4 bg-zinc-900/95 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 max-h-32 overflow-y-auto">
                        <p className="text-xs font-semibold text-purple-400 mb-2">AI Response:</p>
                        <p className="text-sm text-gray-300">{aiResponse}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeMode === 'upload' && (
                  <div className="h-full flex flex-col bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/10 relative overflow-hidden">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group"
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
                    {/* Loading overlay for image transform */}
                    {loading && activeMode === 'upload' && (
                      <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                        <div className="relative w-64 h-40">
                          <Loader />
                        </div>
                        <p className="text-lg font-medium text-gray-300 mt-8">Transforming your image...</p>
                        <p className="text-sm mt-2 text-gray-500">AI is analyzing and enhancing</p>
                      </div>
                    )}
                    {/* AI Response overlay */}
                    {aiResponse && activeMode === 'upload' && !loading && (
                      <div className="absolute bottom-4 left-4 right-4 bg-zinc-900/95 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30 max-h-32 overflow-y-auto">
                        <p className="text-xs font-semibold text-pink-400 mb-2">AI Response:</p>
                        <p className="text-sm text-gray-300">{aiResponse}</p>
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

              {/* Right Sidebar - Rendered Image/Export */}
              <div className="w-64 bg-zinc-900/50 backdrop-blur-sm border-l border-white/5 p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {activeMode === 'sketch' ? 'Rendered Result' : 'Generated Image'}
                  </h3>
                  <div className="space-y-2">
                    {renderedSketchImage && activeMode === 'sketch' ? (
                      <div 
                        onClick={() => setIsImageZoomed(true)}
                        className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all"
                      >
                        <img 
                          src={renderedSketchImage} 
                          alt="Rendered sketch"
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Click to zoom</span>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-8 bg-zinc-800/30 rounded-xl border border-dashed border-white/10 text-center">
                        <p className="text-xs text-gray-500">
                          {activeMode === 'sketch' ? 'Render a sketch to see the result here' : 'No image generated yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Export As</h3>
                  <div className="space-y-1.5">
                    <button 
                      onClick={() => {
                        if (activeMode === 'sketch' && sketchCanvasRef.current) {
                          const dataUrl = sketchCanvasRef.current.getCanvasDataUrl();
                          if (dataUrl) {
                            const link = document.createElement('a');
                            link.download = 'sketch.png';
                            link.href = dataUrl;
                            link.click();
                          }
                        } else if (aiResponse) {
                          const link = document.createElement('a');
                          link.download = 'generated.png';
                          link.href = aiResponse;
                          link.click();
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-purple-600/20 hover:text-purple-300 rounded-lg cursor-pointer transition-all flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      PNG
                    </button>
                    <button 
                      onClick={() => {
                        if (activeMode === 'sketch' && sketchCanvasRef.current) {
                          const canvas = document.querySelector('canvas');
                          if (canvas) {
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                            const link = document.createElement('a');
                            link.download = 'sketch.jpg';
                            link.href = dataUrl;
                            link.click();
                          }
                        } else if (aiResponse) {
                          const link = document.createElement('a');
                          link.download = 'generated.jpg';
                          link.href = aiResponse.replace('image/png', 'image/jpeg');
                          link.click();
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 rounded-lg cursor-pointer transition-all flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      JPEG
                    </button>
                    <button 
                      onClick={() => {
                        if (activeMode === 'sketch' && sketchCanvasRef.current) {
                          const canvas = document.querySelector('canvas');
                          if (canvas) {
                            const dataUrl = canvas.toDataURL('image/webp', 0.9);
                            const link = document.createElement('a');
                            link.download = 'sketch.webp';
                            link.href = dataUrl;
                            link.click();
                          }
                        } else if (aiResponse) {
                          const link = document.createElement('a');
                          link.download = 'generated.webp';
                          link.href = aiResponse;
                          link.click();
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-green-600/20 hover:text-green-300 rounded-lg cursor-pointer transition-all flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      WebP
                    </button>
                    <button 
                      onClick={() => {
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                          canvas.toBlob((blob) => {
                            if (blob) {
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.download = 'image.bmp';
                              link.href = url;
                              link.click();
                              URL.revokeObjectURL(url);
                            }
                          }, 'image/bmp');
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-orange-600/20 hover:text-orange-300 rounded-lg cursor-pointer transition-all flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      BMP
                    </button>
                    <button 
                      onClick={async () => {
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                          try {
                            const dataUrl = canvas.toDataURL('image/png');
                            const response = await fetch(dataUrl);
                            const blob = await response.blob();
                            const item = new ClipboardItem({ 'image/png': blob });
                            await navigator.clipboard.write([item]);
                            alert('Image copied to clipboard!');
                          } catch (err) {
                            console.error('Failed to copy:', err);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-pink-600/20 hover:text-pink-300 rounded-lg cursor-pointer transition-all flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                      Copy to Clipboard
                    </button>
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
              Four powerful tools — from instant CSS animations to stunning AI-generated videos. Everything you need to create motion magic.
            </p>
          </div>

          {/* Features Grid - 2x2 Quad Layout */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Feature 1: CSS Animation - Instant & Lightweight */}
            <ParticleCard
              className="bg-zinc-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-cyan-500/40 transition-all duration-300"
              glowColor="6, 182, 212"
              enableTilt={true}
              clickEffect={true}
            >
              <div className="relative">
                {/* Lottie Animation */}
                <div className="w-full aspect-4/3 mb-6 flex items-center justify-center rounded-2xl bg-zinc-900/30 overflow-hidden">
                  <DotLottieReact
                    src="/Data Scanning.lottie"
                    loop
                    autoplay
                    className="w-full h-full object-contain scale-110"
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Text → CSS Animation</h3>
                  <span className="px-3 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                    Zero GPU
                  </span>
                </div>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Instant, lightweight animations that run 100% client-side. Create bouncing buttons, glowing effects, and smooth transitions.
                </p>
                <div className="bg-zinc-900/50 rounded-xl p-4 mb-4 border border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Example prompt:</p>
                  <p className="text-sm text-cyan-300 font-mono">&quot;Make a bouncing glowing button animation&quot;</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['CSS Code', 'HTML Snippet', 'Live Preview'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium bg-cyan-500/10 text-cyan-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ParticleCard>

            {/* Feature 2: SVG Animation - Vector-Based */}
            <ParticleCard
              className="bg-zinc-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-green-500/40 transition-all duration-300"
              glowColor="34, 197, 94"
              enableTilt={true}
              clickEffect={true}
            >
              <div className="relative">
                {/* Lottie Animation */}
                <div className="w-full aspect-4/3 mb-6 flex items-center justify-center rounded-2xl bg-zinc-900/30 overflow-hidden">
                  <DotLottieReact
                    src="/Seo isometric composition with human characters.lottie"
                    loop
                    autoplay
                    className="w-full h-full object-contain scale-110"
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Text → SVG Animation</h3>
                  <span className="px-3 py-1 text-xs font-semibold bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                    Vector Quality
                  </span>
                </div>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Generate scalable vector animations with perfect quality at any size. Create rotating shapes, morphing icons, and path animations.
                </p>
                <div className="bg-zinc-900/50 rounded-xl p-4 mb-4 border border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Example prompt:</p>
                  <p className="text-sm text-green-300 font-mono">&quot;Create a rotating 3D-like cube animation&quot;</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['<svg> Code', '<animate>', 'Canvas Preview'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ParticleCard>

            {/* Feature 3: GIF Animation - Easy to Embed */}
            <ParticleCard
              className="bg-zinc-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-pink-500/40 transition-all duration-300"
              glowColor="236, 72, 153"
              enableTilt={true}
              clickEffect={true}
            >
              <div className="relative">
                {/* Lottie Animation */}
                <div className="w-full aspect-4/3 mb-6 flex items-center justify-center rounded-2xl bg-zinc-900/30 overflow-hidden">
                  <DotLottieReact
                    src="/New app development on desktop.lottie"
                    loop
                    autoplay
                    className="w-full h-full object-contain scale-110"
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Text → GIF Animation</h3>
                  <span className="px-3 py-1 text-xs font-semibold bg-pink-500/10 text-pink-400 rounded-full border border-pink-500/20">
                    Instant Share
                  </span>
                </div>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Generate eye-catching GIF animations from text. Perfect for social media, websites, and apps — loop-friendly and easy to embed.
                </p>
                <div className="bg-zinc-900/50 rounded-xl p-4 mb-4 border border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Example prompt:</p>
                  <p className="text-sm text-pink-300 font-mono">&quot;A glowing neon sign flickering on and off&quot;</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Runway API', 'Pika', 'PixVerse'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium bg-pink-500/10 text-pink-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ParticleCard>

            {/* Feature 4: Video Animation - Premium MP4 */}
            <ParticleCard
              className="bg-zinc-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/40 transition-all duration-300"
              glowColor="147, 51, 234"
              enableTilt={true}
              clickEffect={true}
            >
              <div className="relative">
                {/* Lottie Animation */}
                <div className="w-full aspect-4/3 mb-6 flex items-center justify-center rounded-2xl bg-zinc-900/30 overflow-hidden">
                  <DotLottieReact
                    src="/Web Development.lottie"
                    loop
                    autoplay
                    className="w-full h-full object-contain scale-110"
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Text → Video (MP4)</h3>
                  <span className="px-3 py-1 text-xs font-semibold bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
                    AI Studio
                  </span>
                </div>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Create professional video animations with AI. Generate explainer scenes, logo reveals, and cinematic motion graphics.
                </p>
                <div className="bg-zinc-900/50 rounded-xl p-4 mb-4 border border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Example prompt:</p>
                  <p className="text-sm text-purple-300 font-mono">&quot;Logo reveal with particles and light rays&quot;</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Runway Gen-2', 'Pika', 'PixVerse'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium bg-purple-500/10 text-purple-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ParticleCard>

          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16 relative z-40 pb-32" suppressHydrationWarning>
            <p className="text-gray-500 mb-6">Ready to create stunning animations with AI?</p>
            <TryAnimationStudio />
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
              
              <h2 className="text-5xl md:text-6xl font-extrabold" style={{ fontFamily: 'var(--font-heading)' }}>
                Your <span className="bg-linear-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">Animation</span> Workspace
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto font-normal tracking-wide">
                Four powerful tools in one unified interface. Create CSS, SVG, GIF, and Video animations with AI.
              </p>
            </div>

            {/* Animation Studio Workspace */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden" suppressHydrationWarning>
              {/* Top Toolbar with 4 Tabs */}
              <div className="bg-zinc-950/90 border-b border-white/5 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  {/* 4 Feature Tabs */}
                  <div className="flex items-center gap-1 bg-zinc-900/50 rounded-lg p-1">
                    <button className="px-4 py-1.5 text-xs font-medium bg-cyan-600 text-white rounded-md transition-colors">
                      CSS
                    </button>
                    <button className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                      SVG
                    </button>
                    <button className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                      GIF
                    </button>
                    <button className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                      Video
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-700 text-white rounded transition-colors">
                    Export
                  </button>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="flex h-[550px]">
                {/* Left - Prompt Input Panel */}
                <div className="w-80 bg-zinc-950/50 border-r border-white/5 p-4 flex flex-col">
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-400 mb-2 block">Describe your animation</label>
                    <textarea 
                      className="w-full h-32 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                      placeholder="Make a bouncing glowing button animation with a pulsing cyan shadow..."
                    />
                  </div>

                  {/* Quick Prompts */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-400 mb-2 block">Quick Prompts</label>
                    <div className="flex flex-wrap gap-2">
                      {['Bounce', 'Pulse', 'Shake', 'Fade', 'Slide', 'Glow'].map((prompt) => (
                        <button
                          key={prompt}
                          className="px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-full border border-white/5 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration & Easing */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">Duration: 1.5s</label>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="5" 
                        step="0.1" 
                        defaultValue="1.5"
                        className="w-full accent-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">Easing</label>
                      <select className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-cyan-500">
                        <option>ease-in-out</option>
                        <option>linear</option>
                        <option>ease-in</option>
                        <option>ease-out</option>
                        <option>cubic-bezier</option>
                      </select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button className="mt-auto w-full bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Animation
                  </button>
                </div>

                {/* Center - Live Preview */}
                <div className="flex-1 bg-zinc-900/50 relative flex flex-col">
                  {/* Preview Header */}
                  <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">Live Preview</span>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Reset">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Fullscreen">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Preview Canvas */}
                  <div className="flex-1 flex items-center justify-center p-8" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}>
                    {/* Sample Animated Button Preview */}
                    <div className="relative">
                      <button 
                        className="px-8 py-4 bg-cyan-600 text-white font-semibold rounded-xl transition-all"
                        style={{
                          animation: 'bounce 1s ease-in-out infinite, glow 2s ease-in-out infinite alternate',
                          boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)'
                        }}
                      >
                        Animated Button
                      </button>
                      <style>{`
                        @keyframes bounce {
                          0%, 100% { transform: translateY(0); }
                          50% { transform: translateY(-10px); }
                        }
                        @keyframes glow {
                          0% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3); }
                          100% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.7), 0 0 60px rgba(6, 182, 212, 0.5); }
                        }
                      `}</style>
                    </div>
                  </div>

                  {/* Background Options */}
                  <div className="px-4 py-2 border-t border-white/5 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Background:</span>
                    {['Dark', 'Light', 'Grid', 'None'].map((bg) => (
                      <button
                        key={bg}
                        className={`px-2 py-1 text-xs rounded transition-colors ${bg === 'Grid' ? 'bg-cyan-600/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right - Code Output Panel */}
                <div className="w-80 bg-zinc-950/50 border-l border-white/5 flex flex-col">
                  {/* Code Tabs */}
                  <div className="px-4 py-2 border-b border-white/5 flex items-center gap-1">
                    <button className="px-3 py-1 text-xs font-medium bg-cyan-600/20 text-cyan-400 rounded transition-colors">
                      CSS
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white rounded transition-colors">
                      HTML
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white rounded transition-colors">
                      React
                    </button>
                  </div>

                  {/* Code Display */}
                  <div className="flex-1 overflow-auto p-4">
                    <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                      <code>{`.animated-button {
  padding: 1rem 2rem;
  background: #0891b2;
  color: white;
  font-weight: 600;
  border-radius: 0.75rem;
  animation: 
    bounce 1s ease-in-out infinite,
    glow 2s ease-in-out infinite alternate;
}

@keyframes bounce {
  0%, 100% { 
    transform: translateY(0); 
  }
  50% { 
    transform: translateY(-10px); 
  }
}

@keyframes glow {
  0% { 
    box-shadow: 
      0 0 20px rgba(6, 182, 212, 0.5),
      0 0 40px rgba(6, 182, 212, 0.3);
  }
  100% { 
    box-shadow: 
      0 0 30px rgba(6, 182, 212, 0.7),
      0 0 60px rgba(6, 182, 212, 0.5);
  }
}`}</code>
                    </pre>
                  </div>

                  {/* Copy Button */}
                  <div className="px-4 py-3 border-t border-white/5">
                    <button className="w-full py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Status Bar */}
              <div className="bg-zinc-950/90 border-t border-white/5 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">CSS Animation</span>
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Ready
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">Output: 0.8 KB</span>
                  <span className="text-xs text-gray-500">0ms render</span>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[
                { icon: '⚡', title: 'CSS Animation', desc: 'Zero GPU, instant results', color: 'cyan' },
                { icon: '🎨', title: 'SVG Animation', desc: 'Vector-based quality', color: 'green' },
                { icon: '🖼️', title: 'GIF Generator', desc: 'Easy to share anywhere', color: 'pink' },
                { icon: '🎬', title: 'Video (MP4)', desc: 'Professional AI studio', color: 'purple' },
              ].map((feature, idx) => (
                <div key={idx} className={`bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-${feature.color}-500/30 transition-colors text-center`}>
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
