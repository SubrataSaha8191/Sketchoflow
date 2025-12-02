"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Wand2, ImagePlus, Loader2, Pencil, Bot, Zap, Play, Palette, Image, Video, RefreshCw } from "lucide-react";
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
import { SplineScene } from "@/components/ui/splite";
import RotatingText from "@/components/RotatingText";
import SocialButtons from "@/components/SocialButtons";
import StartFree from "@/components/StartFree";
import Explore from "@/components/Explore";

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
  
  // Animation Studio State
  const [studioTab, setStudioTab] = useState<'css' | 'svg' | 'gif' | 'video'>('css');
  const [studioPrompt, setStudioPrompt] = useState("");
  const [studioDuration, setStudioDuration] = useState("1.5");
  const [studioEasing, setStudioEasing] = useState("ease-in-out");
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioCode, setStudioCode] = useState<{ css?: string; html?: string; react?: string; svg?: string } | null>(null);
  const [studioCodeTab, setStudioCodeTab] = useState<'css' | 'html' | 'react' | 'svg'>('css');
  const [studioBackground, setStudioBackground] = useState<'Dark' | 'Light' | 'Grid' | 'None'>('Grid');
  const [studioMediaUrl, setStudioMediaUrl] = useState<string | null>(null);
  const [studioError, setStudioError] = useState<string | null>(null);
  const [studioAspectRatio, setStudioAspectRatio] = useState("16:9");
  
  // Section refs for intersection observer
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const workspaceSectionRef = useRef<HTMLDivElement>(null);
  const developmentSectionRef = useRef<HTMLDivElement>(null);
  const studioSectionRef = useRef<HTMLDivElement>(null);
  const conclusionSectionRef = useRef<HTMLDivElement>(null);
  
  const { setButtonTheme } = useTheme();

  // Animation Studio API call function
  const generateAnimation = async () => {
    if (!studioPrompt.trim()) return;
    
    setStudioLoading(true);
    setStudioError(null);
    setStudioCode(null);
    setStudioMediaUrl(null);
    
    try {
      if (studioTab === 'css' || studioTab === 'svg') {
        // Use Groq API for CSS/SVG generation
        const response = await fetch('/api/animation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: studioTab,
            prompt: studioPrompt,
            duration: `${studioDuration}s`,
            easing: studioEasing
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setStudioCode(data.code);
          if (studioTab === 'svg') {
            setStudioCodeTab('svg');
          } else {
            setStudioCodeTab('css');
          }
        } else {
          setStudioError(data.error || 'Failed to generate animation');
        }
      } else {
        // Use fal.ai/Runway for GIF/Video generation
        const response = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: studioTab,
            prompt: studioPrompt,
            duration: parseInt(studioDuration),
            aspectRatio: studioAspectRatio
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setStudioMediaUrl(data.url);
        } else {
          setStudioError(data.error || 'Failed to generate media');
        }
      }
    } catch (error: any) {
      setStudioError(error.message || 'Failed to connect to AI service');
    } finally {
      setStudioLoading(false);
    }
  };

  // Copy code to clipboard
  const copyStudioCode = () => {
    if (!studioCode) return;
    const codeToCopy = studioCodeTab === 'svg' ? studioCode.svg || '' : studioCode[studioCodeTab] || '';
    navigator.clipboard.writeText(codeToCopy);
  };

  // Quick prompts for animation studio
  const applyQuickPrompt = (quickPrompt: string) => {
    setStudioPrompt(prev => prev ? `${prev} with ${quickPrompt.toLowerCase()} effect` : `Create a ${quickPrompt.toLowerCase()} animation`);
  };

  // Get preview background style
  const getPreviewBgStyle = () => {
    switch (studioBackground) {
      case 'Light': return { backgroundColor: '#ffffff' };
      case 'Dark': return { backgroundColor: '#0a0a0a' };
      case 'Grid': return {
        backgroundColor: '#0a0a0a',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      };
      case 'None': return { backgroundColor: 'transparent' };
      default: return {};
    }
  };

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
      { ref: conclusionSectionRef, theme: 'gold' },
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
                Your <span className="bg-linear-to-r from-violet-500 via-purple-400 to-violet-500 bg-clip-text text-transparent">Animation</span> Workspace
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
                    <button 
                      onClick={() => { setStudioTab('css'); setStudioCode(null); setStudioMediaUrl(null); setStudioError(null); }}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${studioTab === 'css' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      CSS
                    </button>
                    <button 
                      onClick={() => { setStudioTab('svg'); setStudioCode(null); setStudioMediaUrl(null); setStudioError(null); }}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${studioTab === 'svg' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      SVG
                    </button>
                    <button 
                      onClick={() => { setStudioTab('gif'); setStudioCode(null); setStudioMediaUrl(null); setStudioError(null); }}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${studioTab === 'gif' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      GIF
                    </button>
                    <button 
                      onClick={() => { setStudioTab('video'); setStudioCode(null); setStudioMediaUrl(null); setStudioError(null); }}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${studioTab === 'video' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      Video
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (studioMediaUrl) {
                        const link = document.createElement('a');
                        link.href = studioMediaUrl;
                        link.download = `animation.${studioTab === 'gif' ? 'gif' : 'mp4'}`;
                        link.click();
                      } else if (studioCode) {
                        const blob = new Blob([studioCode.css || studioCode.svg || ''], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `animation.${studioTab}`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    disabled={!studioCode && !studioMediaUrl}
                    className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                  >
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
                      value={studioPrompt}
                      onChange={(e) => setStudioPrompt(e.target.value)}
                      className="w-full h-32 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                      placeholder={
                        studioTab === 'css' ? "Make a bouncing glowing button animation with a pulsing cyan shadow..." :
                        studioTab === 'svg' ? "Create an animated loading spinner with rotating circles..." :
                        studioTab === 'gif' ? "A cute cat playing with a ball of yarn, playful movement..." :
                        "A serene ocean sunset with waves gently rolling onto the beach..."
                      }
                    />
                  </div>

                  {/* Quick Prompts */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-400 mb-2 block">Quick Prompts</label>
                    <div className="flex flex-wrap gap-2">
                      {(studioTab === 'css' || studioTab === 'svg' 
                        ? ['Bounce', 'Pulse', 'Shake', 'Fade', 'Slide', 'Glow', 'Spin', 'Wave']
                        : ['Cinematic', 'Slow-mo', 'Loop', 'Zoom', 'Pan', 'Dreamy']
                      ).map((quickPrompt) => (
                        <button
                          key={quickPrompt}
                          onClick={() => applyQuickPrompt(quickPrompt)}
                          className="px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-full border border-white/5 transition-colors"
                        >
                          {quickPrompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration & Easing / Aspect Ratio */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">
                        Duration: {studioDuration}{studioTab === 'css' || studioTab === 'svg' ? 's' : ' seconds'}
                      </label>
                      <input 
                        type="range" 
                        min={studioTab === 'gif' || studioTab === 'video' ? "2" : "0.1"}
                        max={studioTab === 'gif' || studioTab === 'video' ? "10" : "5"}
                        step={studioTab === 'gif' || studioTab === 'video' ? "1" : "0.1"}
                        value={studioDuration}
                        onChange={(e) => setStudioDuration(e.target.value)}
                        className={`w-full ${studioTab === 'css' ? 'accent-cyan-500' : studioTab === 'svg' ? 'accent-green-500' : studioTab === 'gif' ? 'accent-pink-500' : 'accent-purple-500'}`}
                      />
                    </div>
                    {(studioTab === 'css' || studioTab === 'svg') ? (
                      <div>
                        <label className="text-xs font-medium text-gray-400 mb-2 block">Easing</label>
                        <select 
                          value={studioEasing}
                          onChange={(e) => setStudioEasing(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option>ease-in-out</option>
                          <option>linear</option>
                          <option>ease-in</option>
                          <option>ease-out</option>
                          <option>cubic-bezier(0.68, -0.55, 0.265, 1.55)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-medium text-gray-400 mb-2 block">Aspect Ratio</label>
                        <select 
                          value={studioAspectRatio}
                          onChange={(e) => setStudioAspectRatio(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-pink-500"
                        >
                          <option value="16:9">16:9 (Landscape)</option>
                          <option value="9:16">9:16 (Portrait)</option>
                          <option value="1:1">1:1 (Square)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Generate Button */}
                  <div className="mt-auto">
                    <GenerateButton
                      text={studioTab === 'css' ? 'Generate CSS' : studioTab === 'svg' ? 'Generate SVG' : studioTab === 'gif' ? 'Generate GIF' : 'Generate Video'}
                      loadingText="Generating"
                      onClick={generateAnimation}
                      disabled={!studioPrompt.trim()}
                      loading={studioLoading}
                    />
                  </div>
                </div>

                {/* Center - Live Preview */}
                <div className="flex-1 bg-zinc-900/50 relative flex flex-col">
                  {/* Preview Header */}
                  <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">Live Preview</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setStudioCode(null); setStudioMediaUrl(null); setStudioError(null); }}
                        className="p-1.5 hover:bg-white/5 rounded transition-colors" 
                        title="Reset"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Preview Canvas */}
                  <div className="flex-1 flex items-center justify-center p-8 relative" style={getPreviewBgStyle()}>
                    {/* Loading State */}
                    {studioLoading && (
                      <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <div className="relative w-64 h-40">
                          <Loader />
                        </div>
                        <p className="text-lg font-medium text-gray-300 mt-8">
                          {studioTab === 'css' ? 'Generating CSS Animation...' :
                           studioTab === 'svg' ? 'Creating SVG Animation...' :
                           studioTab === 'gif' ? 'Generating GIF...' :
                           'Creating Video...'}
                        </p>
                        <p className="text-sm mt-2 text-gray-500">
                          {studioTab === 'gif' || studioTab === 'video' ? 'This may take a few moments' : 'AI is crafting your animation'}
                        </p>
                      </div>
                    )}

                    {/* Error State */}
                    {studioError && (
                      <div className="text-center">
                        <div className="text-red-400 mb-2">⚠️</div>
                        <p className="text-sm text-red-400">{studioError}</p>
                        <button 
                          onClick={generateAnimation}
                          className="mt-4 px-4 py-2 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {/* CSS/SVG Preview */}
                    {!studioLoading && !studioError && (studioTab === 'css' || studioTab === 'svg') && (
                      <div className="relative">
                        {studioCode?.svg ? (
                          <div 
                            className="max-w-xs max-h-64"
                            dangerouslySetInnerHTML={{ __html: studioCode.svg }} 
                          />
                        ) : studioCode?.css ? (
                          <>
                            <div 
                              className="animated-preview"
                              dangerouslySetInnerHTML={{ __html: studioCode.html || '<button class="animated-element">Animated Element</button>' }}
                            />
                            <style>{studioCode.css}</style>
                          </>
                        ) : (
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-4">{studioTab === 'css' ? '⚡' : '🎨'}</div>
                            <p className="text-sm">Enter a prompt and click Generate</p>
                            <p className="text-xs mt-2 text-gray-600">Your animation will appear here</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* GIF/Video Preview */}
                    {!studioLoading && !studioError && (studioTab === 'gif' || studioTab === 'video') && (
                      <div className="relative max-w-full max-h-full">
                        {studioMediaUrl ? (
                          studioTab === 'gif' ? (
                            <img src={studioMediaUrl} alt="Generated GIF" className="max-w-full max-h-80 rounded-lg shadow-2xl" />
                          ) : (
                            <video 
                              src={studioMediaUrl} 
                              controls 
                              autoPlay 
                              loop 
                              className="max-w-full max-h-80 rounded-lg shadow-2xl"
                            />
                          )
                        ) : (
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-4">{studioTab === 'gif' ? '🖼️' : '🎬'}</div>
                            <p className="text-sm">Enter a prompt and click Generate</p>
                            <p className="text-xs mt-2 text-gray-600">Your {studioTab === 'gif' ? 'GIF' : 'video'} will appear here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Background Options */}
                  <div className="px-4 py-2 border-t border-white/5 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Background:</span>
                    {(['Dark', 'Light', 'Grid', 'None'] as const).map((bg) => (
                      <button
                        key={bg}
                        onClick={() => setStudioBackground(bg)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${studioBackground === bg ? `${studioTab === 'css' ? 'bg-cyan-600/20 text-cyan-400' : studioTab === 'svg' ? 'bg-green-600/20 text-green-400' : studioTab === 'gif' ? 'bg-pink-600/20 text-pink-400' : 'bg-purple-600/20 text-purple-400'}` : 'text-gray-400 hover:text-white'}`}
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
                    {studioTab === 'svg' ? (
                      <>
                        <button 
                          onClick={() => setStudioCodeTab('svg')}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${studioCodeTab === 'svg' ? 'bg-green-600/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
                        >
                          SVG
                        </button>
                        <button 
                          onClick={() => setStudioCodeTab('react')}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${studioCodeTab === 'react' ? 'bg-green-600/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
                        >
                          React
                        </button>
                      </>
                    ) : studioTab === 'css' ? (
                      <>
                        <button 
                          onClick={() => setStudioCodeTab('css')}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${studioCodeTab === 'css' ? 'bg-cyan-600/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                        >
                          CSS
                        </button>
                        <button 
                          onClick={() => setStudioCodeTab('html')}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${studioCodeTab === 'html' ? 'bg-cyan-600/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                        >
                          HTML
                        </button>
                        <button 
                          onClick={() => setStudioCodeTab('react')}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${studioCodeTab === 'react' ? 'bg-cyan-600/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                        >
                          React
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 px-2">
                        {studioTab === 'gif' ? 'GIF output will be displayed in preview' : 'Video output will be displayed in preview'}
                      </span>
                    )}
                  </div>

                  {/* Code Display */}
                  <div className="flex-1 overflow-auto p-4">
                    {(studioTab === 'css' || studioTab === 'svg') ? (
                      <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                        <code>
                          {studioCode ? (
                            studioCodeTab === 'svg' ? studioCode.svg :
                            studioCodeTab === 'css' ? studioCode.css :
                            studioCodeTab === 'html' ? studioCode.html :
                            studioCode.react
                          ) || '// No code generated yet' : `/* Enter a prompt to generate ${studioTab.toUpperCase()} code */

/* Example output:
${studioTab === 'css' ? `.animated-element {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}` : `<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="40" fill="#06b6d4">
    <animate attributeName="r" 
      values="40;50;40" dur="1s" 
      repeatCount="indefinite"/>
  </circle>
</svg>`}
*/`}
                        </code>
                      </pre>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-3xl mb-4">{studioTab === 'gif' ? '🖼️' : '🎬'}</div>
                        <p className="text-xs">
                          {studioTab === 'gif' ? 'GIF files are visual outputs' : 'Video files are visual outputs'}
                        </p>
                        <p className="text-xs mt-2 text-gray-600">
                          Use the Export button to download
                        </p>
                        {studioMediaUrl && (
                          <p className="text-xs mt-4 text-green-400">✓ Ready to export</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Copy Button */}
                  <div className="px-4 py-3 border-t border-white/5">
                    <button 
                      onClick={copyStudioCode}
                      disabled={!studioCode || (studioTab !== 'css' && studioTab !== 'svg')}
                      className="w-full py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-gray-600 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
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
                  <span className="text-xs text-gray-500">
                    {studioTab === 'css' ? 'CSS Animation' : studioTab === 'svg' ? 'SVG Animation' : studioTab === 'gif' ? 'GIF Generation' : 'Video Generation'}
                  </span>
                  <span className={`text-xs flex items-center gap-1 ${studioLoading ? 'text-yellow-400' : studioError ? 'text-red-400' : 'text-green-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${studioLoading ? 'bg-yellow-400 animate-pulse' : studioError ? 'bg-red-400' : 'bg-green-400'}`}></span>
                    {studioLoading ? 'Generating...' : studioError ? 'Error' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    {studioCode ? `Output: ${((studioCode.css || studioCode.svg || '').length / 1024).toFixed(1)} KB` : studioMediaUrl ? 'Media ready' : 'No output'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {studioTab === 'css' || studioTab === 'svg' ? 'Powered by Groq' : 'Powered by Runway'}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Highlights with Lucide Icons */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[
                { Icon: Zap, title: 'CSS Animation', desc: 'Zero GPU, instant results', color: 'text-cyan-400', hoverClass: 'hover:border-cyan-500/30' },
                { Icon: Palette, title: 'SVG Animation', desc: 'Vector-based quality', color: 'text-green-400', hoverClass: 'hover:border-green-500/30' },
                { Icon: Image, title: 'GIF Generator', desc: 'Easy to share anywhere', color: 'text-pink-400', hoverClass: 'hover:border-pink-500/30' },
                { Icon: Video, title: 'Video (MP4)', desc: 'Professional AI studio', color: 'text-purple-400', hoverClass: 'hover:border-purple-500/30' },
              ].map((feature, idx) => (
                <div key={idx} className={`bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/5 ${feature.hoverClass} transition-colors text-center`}>
                  <div className="flex justify-center mb-2">
                    <feature.Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 5: CONCLUSION ========== */}
      <section ref={conclusionSectionRef} className="relative min-h-screen bg-black pt-24 pb-0 overflow-hidden">
        {/* Top Gradient Transition - pure black blend */}
        <div className="absolute inset-x-0 top-0 h-40 bg-black pointer-events-none z-10" />

        {/* 3D Robot - with CSS mask for seamless bottom fade, pointer-events-auto for cursor tracking */}
        <div 
          className="absolute right-0 top-[8%] w-[60%] h-full z-5 pointer-events-auto"
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 75%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 75%)',
          }}
        >
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full scale-[0.75] origin-top-right"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex items-center pointer-events-none">
          {/* Left Side - Text Content */}
          <div className="w-full lg:w-[45%] px-8 md:px-16 lg:px-20 py-20 pointer-events-auto">
            {/* Main Headline with Rotating Text - Gray Gradient Style */}
            <div className="text-2xl md:text-3xl lg:text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <div>Empower Creativity</div>
              <div className="flex items-center gap-3 mt-2">
                <span>to</span>
                <RotatingText
                  texts={['Sketch','Generate','Animate', 'Export', 'Share', 'Love']}
                  mainClassName="inline-flex px-3 py-1 bg-gradient-to-r from-zinc-800 via-yellow-200 to-zinc-800 text-zinc-900 rounded-lg overflow-hidden"
                />
              </div>
            </div>

            {/* Subtitle with ShinyText */}
            <div className="text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              <ShinyText 
                text="Sketchoflow transforms your rough sketches into polished animations. Generate CSS, SVG, GIF, and video animations with AI — no design experience needed. Your imagination is the only limit."
                speed={3}
                className="text-gray-600!"
              />
            </div>

            {/* Feature Points with Lucide Icons */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { icon: Pencil, text: 'Sketch to Animation', color: 'text-violet-400' },
                { icon: Bot, text: 'AI-Powered Generation', color: 'text-cyan-400' },
                { icon: Zap, text: 'Instant Export', color: 'text-amber-400' },
                { icon: RefreshCw, text: 'Image to Transform', color: 'text-pink-400' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm font-medium text-gray-200">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <StartFree text="Start Creating Free" />
              <Explore 
                text="Explore Features" 
                onClick={() => workspaceSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

            {/* Trust Badge */}
            <p className="mt-10 text-sm text-gray-500">
              Join <span className="text-white font-medium">10,000+</span> creators already using Sketchoflow
            </p>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black to-transparent pointer-events-none z-20" />
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative bg-black pt-20 pb-10">
        {/* Top border glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-20">
          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SketchoFlow</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Transform your creative ideas into stunning animations with the power of AI.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Templates', 'Integrations'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-3">
                {['Documentation', 'Tutorials', 'Blog', 'Community'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                {['About', 'Careers', 'Contact', 'Privacy'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
            <p className="text-sm text-gray-600">
              © 2025 SketchoFlow. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <SocialButtons />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
