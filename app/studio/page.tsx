"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Wand2, ImagePlus, Loader2 as Loader2Icon, Pencil, Bot, Zap, Play, Palette, Image, Video, RefreshCw, Minimize2, Shield } from "lucide-react";
import dynamic from 'next/dynamic';
import LaserFlow from "@/components/LaserFlow";
import LightRays from "@/components/LightRays";
const GenerateButton = dynamic(() => import('@/components/GenerateButton'), { ssr: false });
import JoinToday from "@/components/JoinToday";
const AuthButtons = dynamic(() => import('@/components/AuthButtons'), { ssr: false });
import ThemedLogo from "@/components/ThemedLogo";
import ShinyText from "@/components/ShinyText";
import TextType from "@/components/TextType";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { GridBeam } from "@/components/background-grid-beam";
import { CosmicParallaxBg } from "@/components/parallax-cosmic-background";
import { ParticleCard } from "@/components/MagicBento";
import { useTheme, ColorTheme } from "@/context/ThemeContext";
import { useAuthGate } from "@/context/AuthGateContext";
import { useAuth } from "@/context/AuthContext";
import TryAnimationStudio from "@/components/TryAnimationStudio";
import SketchCanvas, { SketchCanvasRef } from "@/components/SketchCanvas";
const AuthPopup = dynamic(() => import('@/components/AuthPopup'), { ssr: false });
import Loader from "@/components/Loader";
import Loader2 from "@/components/loader-2";
import { SplineScene } from "@/components/ui/splite";
import RotatingText from "@/components/RotatingText";
import SocialButtons from "@/components/SocialButtons";
const StartFree = dynamic(() => import('@/components/StartFree'), { ssr: false });
import SplitText from "@/components/SplitText";
import { useRouter } from 'next/navigation';
import ScrollReveal from "@/components/ScrollReveal";
import Explore from "@/components/Explore";
import ScrollProgress from "@/components/Scrollbar";
const BlurButton = dynamic(() => import('@/components/BlurButtons'), { ssr: false });
import PromptInput from "@/components/PromptInput";
import ActivityHistory, { HistoryButton, saveActivity } from "@/components/ActivityHistory";
import Gallery, { GalleryButton, saveToGallery } from "@/components/Gallery";
import ResultModal from "@/components/ResultModal";

export default function StudioPage() {
  const router = useRouter();
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
  // Separate image states for each tab
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [renderedSketchImage, setRenderedSketchImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isSignupPopupOpen, setIsSignupPopupOpen] = useState(false);
  // Fullscreen states for workspaces
  const [isWorkspaceFullscreen, setIsWorkspaceFullscreen] = useState(false);
  const [isStudioFullscreen, setIsStudioFullscreen] = useState(false);
  // Track if user has drawn on the sketch canvas
  const [hasSketchDrawing, setHasSketchDrawing] = useState(false);
  // Activity history popup state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // Gallery popup state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sketchCanvasRef = useRef<SketchCanvasRef>(null);
  
  // Disable body scroll when any workspace is in fullscreen mode or when result modal is open
  useEffect(() => {
    if (isWorkspaceFullscreen || isStudioFullscreen || isImageZoomed) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    };
  }, [isWorkspaceFullscreen, isStudioFullscreen, isImageZoomed]);
  
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
  
  const { setButtonTheme, buttonTheme } = useTheme();
  const { incrementAction, requireAuth, openAuthGate } = useAuthGate();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme colors for nav links
  const navColorThemes: Record<ColorTheme, { text: string; hover: string; glow: string }> = {
    purple: { text: 'text-purple-400', hover: 'hover:text-purple-300', glow: 'hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' },
    blue: { text: 'text-blue-400', hover: 'hover:text-blue-300', glow: 'hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
    gold: { text: 'text-amber-400', hover: 'hover:text-amber-300', glow: 'hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' },
    green: { text: 'text-green-400', hover: 'hover:text-green-300', glow: 'hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' },
    pink: { text: 'text-pink-400', hover: 'hover:text-pink-300', glow: 'hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' },
  };

  // Animation Studio API call function
  const generateAnimation = async () => {
    if (!studioPrompt.trim()) return;
    
    // Check if user can perform action (first one is free) - Animation Studio uses pink theme
    if (!incrementAction('pink')) return;
    
    saveActivity({ type: 'animation', prompt: studioPrompt });
    
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
            // Save SVG to gallery
            saveToGallery({
              url: `data:image/svg+xml,${encodeURIComponent(data.code.svg || '')}`,
              type: 'svg',
              prompt: studioPrompt,
              code: data.code.svg,
            });
          } else {
            setStudioCodeTab('css');
            // Save CSS animation code to gallery (as code snippet)
            saveToGallery({
              url: '',
              type: 'css',
              prompt: studioPrompt,
              code: data.code.css,
            });
          }
        } else {
          setStudioError(data.error || 'Failed to generate animation');
        }
      } else {
        // Use FastAPI backend for GIF/Video generation with Firebase auth
        try {
          // Get Firebase ID token
          const firebaseUser = (await import('@/lib/firebase')).auth.currentUser;
          if (!firebaseUser) {
            setStudioError('Please sign in to generate videos/GIFs');
            return;
          }
          
          const firebaseToken = await firebaseUser.getIdToken();
          
          // Call Next.js API route which forwards to FastAPI
          const apiEndpoint = studioTab === 'gif' ? '/api/text-to-gif' : '/api/text-to-video';
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: studioPrompt,
              firebaseToken
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            setStudioMediaUrl(data.url);
            // Save GIF/Video to gallery
            saveToGallery({
              url: data.url,
              type: studioTab as 'gif' | 'video',
              prompt: studioPrompt,
            });
          } else {
            setStudioError(data.error || 'Failed to generate media');
          }
        } catch (authError: any) {
          setStudioError(authError.message || 'Authentication failed');
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

  // Export handler with auth check
  const handleExport = (exportFn: () => void) => {
    // Require authentication for export
    if (!requireAuth(buttonTheme)) return;
    exportFn();
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
        
        // Handle image URL - set to the correct state based on mode
        if (data.imageUrl) {
          if (mode === "generate") {
            setGeneratedImage(data.imageUrl);
            // Save to gallery
            saveToGallery({
              url: data.imageUrl,
              type: 'generate',
              prompt: prompt,
            });
          } else if (mode === "sketch") {
            setRenderedSketchImage(data.imageUrl);
            // Save to gallery
            saveToGallery({
              url: data.imageUrl,
              type: 'sketch',
              prompt: sketchPrompt || 'Sketch rendering',
            });
          } else if (mode === "transform") {
            setTransformedImage(data.imageUrl);
            // Save to gallery
            saveToGallery({
              url: data.imageUrl,
              type: 'transform',
              prompt: transformPrompt || 'Image transformation',
            });
          }
          setAiResponse(data.enhancedPrompt || data.generationPrompt || "Image generated successfully!");
        } else {
          setAiResponse(data.result || data.description || data.message);
        }
      } else {
        setAiResponse(`Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
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
    // Check if user can perform action (first one is free) - AI Workspace uses blue theme
    if (!incrementAction('blue')) return;
    saveActivity({ type: 'generate', prompt });
    await callGeminiAPI("generate");
  };

  // Handle Render Sketch
  const handleRenderSketch = async () => {
    const canvasData = sketchCanvasRef.current?.getCanvasDataUrl();
    if (!canvasData) {
      setAiResponse("Please draw something on the canvas first");
      return;
    }
    // Check if user can perform action (first one is free) - AI Workspace uses blue theme
    if (!incrementAction('blue')) return;
    saveActivity({ type: 'sketch', prompt: sketchPrompt || 'Sketch rendering' });
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
    // Check if user can perform action (first one is free) - AI Workspace uses blue theme
    if (!incrementAction('blue')) return;
    saveActivity({ type: 'transform', prompt: transformPrompt || 'Image transformation' });
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

  // Handle ESC key to close zoomed image and fullscreen modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImageZoomed) setIsImageZoomed(false);
        if (isWorkspaceFullscreen) setIsWorkspaceFullscreen(false);
        if (isStudioFullscreen) setIsStudioFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageZoomed, isWorkspaceFullscreen, isStudioFullscreen]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <div className="w-full h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900 text-white" ref={studioSectionRef}>
            <div className="relative w-full h-full bg-zinc-900/80 backdrop-blur-xl overflow-hidden" suppressHydrationWarning> 
              {/* Top Toolbar with 4 Tabs */}
              <div className="sticky top-0 z-20 bg-zinc-950/90 border-b border-white/5 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 cursor-pointer"
                  onClick={()=>{router.push('/')}}>
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
                  {/*Workspace Toggle Button */}
                  <button
                    onClick={() => router.push('/workspace')}
                    className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-200 rounded-md text-sm text-gray-300 hover:text-black transition-colors"
                    title="Open Workspace"
                    aria-label="Open Workspace"
                  >
                    AI Workspace
                  </button>
                  <button 
                    onClick={() => handleExport(() => {
                      if (studioMediaUrl) {
                        const link = document.createElement('a');
                        link.href = studioMediaUrl;
                        link.download = `animation.${studioTab === 'gif' ? 'gif' : 'mp4'}`;
                        link.click();
                      } else if (studioCode) {
                        // Determine content and file extension based on current code tab
                        let content = '';
                        let extension = '';
                        let mimeType = 'text/plain';
                        
                        if (studioTab === 'svg') {
                          // SVG tab - export based on code tab
                          if (studioCodeTab === 'svg') {
                            content = studioCode.svg || '';
                            extension = 'svg';
                            mimeType = 'image/svg+xml';
                          } else if (studioCodeTab === 'react') {
                            content = studioCode.react || '';
                            extension = 'tsx';
                            mimeType = 'text/typescript';
                          } else {
                            content = studioCode.css || '';
                            extension = 'css';
                            mimeType = 'text/css';
                          }
                        } else {
                          // CSS tab - export based on code tab
                          if (studioCodeTab === 'css') {
                            content = studioCode.css || '';
                            extension = 'css';
                            mimeType = 'text/css';
                          } else if (studioCodeTab === 'html') {
                            // Combine HTML with CSS in a complete HTML file
                            const htmlContent = studioCode.html || '';
                            const cssContent = studioCode.css || '';
                            content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animation</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
                            extension = 'html';
                            mimeType = 'text/html';
                          } else if (studioCodeTab === 'react') {
                            content = studioCode.react || '';
                            extension = 'tsx';
                            mimeType = 'text/typescript';
                          }
                        }
                        
                        const blob = new Blob([content], { type: mimeType });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `animation.${extension}`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }
                    })}
                    disabled={!studioCode && !studioMediaUrl}
                    className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                  >
                    Export
                  </button>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="flex-1 flex min-h-0 h-full">
                {/* Left - Prompt Input Panel */}
                <div className={`w-80 h-full bg-zinc-950/50 border-r border-white/5 p-4 flex flex-col shrink-0 overflow-y-auto`}>
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-400 mb-2 block">Describe your animation</label>
                    <PromptInput
                      value={studioPrompt}
                      onChange={setStudioPrompt}
                      placeholder={
                        studioTab === 'css' ? "Make a bouncing glowing button animation with a pulsing cyan shadow..." :
                        studioTab === 'svg' ? "Create an animated loading spinner with rotating circles..." :
                        studioTab === 'gif' ? "A cute cat playing with a ball of yarn, playful movement..." :
                        "A serene ocean sunset with waves gently rolling onto the beach..."
                      }
                      onSubmit={generateAnimation}
                      disabled={studioLoading}
                      loading={studioLoading}
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
                <div className="flex-1 bg-zinc-900/50 relative flex flex-col h-full">
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
                  <div className="flex-1 flex items-center justify-center p-0 relative" style={getPreviewBgStyle()}>
                    {/* Loading State */}
                    {studioLoading && (
                      <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <Loader2 />
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
                      <div className="relative w-full h-full flex items-center justify-center">
                        {studioTab === 'svg' && studioCode?.svg ? (
                          <div className="flex items-center justify-center w-full h-full p-6">
                            <div
                              key={studioCode.svg}
                              className="svg-preview w-full h-full flex items-center justify-center bg-black/40 rounded-lg"
                              dangerouslySetInnerHTML={{ __html: studioCode.svg }}
                              suppressHydrationWarning
                            />
                            <style>{`
                              .svg-preview svg {
                                max-width: 440px;
                                max-height: 440px;
                                width: 100%;
                                height: auto;
                                display: block;
                                overflow: visible;
                              }
                              /* Bright preview so SVG is visible on dark grid */
                              .svg-preview svg * {
                                filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.25));
                              }
                              .svg-preview svg *:not([stroke]) {
                                stroke: #22d3ee;
                                stroke-width: 2;
                              }
                              .svg-preview svg *[stroke='none'] {
                                stroke: #22d3ee;
                                stroke-width: 2;
                              }
                              .svg-preview svg *:not([fill]) {
                                fill: transparent;
                              }
                              /* Allow Groq CSS to override if provided */
                              ${studioCode.css || ''}
                            `}</style>
                          </div>
                        ) : studioTab === 'css' && studioCode?.css ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div 
                              className="animated-preview"
                              dangerouslySetInnerHTML={{ __html: studioCode.html || '<button class="animated-element">Animated Element</button>' }}
                            />
                            <style>{studioCode.css}</style>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <div className="flex justify-center mb-4">
                              {studioTab === 'css' ? <Zap className="w-12 h-12 text-cyan-400/50" /> : <Palette className="w-12 h-12 text-green-400/50" />}
                            </div>
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
                              <img src={studioMediaUrl} alt="Generated GIF" className="max-w-full max-h-full" />
                            ) : (
                              <video 
                                src={studioMediaUrl} 
                                controls 
                                autoPlay 
                                loop 
                                className="max-w-full max-h-full"
                            />
                          )
                        ) : (
                          <div className="text-center text-gray-500">
                            <div className="flex justify-center mb-4">
                              {studioTab === 'gif' ? <Image className="w-12 h-12 text-pink-400/50" /> : <Video className="w-12 h-12 text-purple-400/50" />}
                            </div>
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
                <div className="w-80 h-full bg-zinc-950/50 border-l border-white/5 flex flex-col">
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
                        <div className="flex justify-center mb-4">
                          {studioTab === 'gif' ? <Image className="w-8 h-8 text-pink-400/50" /> : <Video className="w-8 h-8 text-purple-400/50" />}
                        </div>
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

              {/* Auth Gate Blur Overlay for Animation Studio */}
              {mounted && !user && (
                <div className="absolute inset-0 z-40 backdrop-blur-md bg-zinc-900/60 flex flex-col items-center justify-center">
                  <div className="text-center space-y-6 px-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white">Unlock Animation Studio</h3>
                      <p className="text-gray-400 max-w-md">Sign in or create an account to create CSS, SVG, GIF, and Video animations</p>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <BlurButton variant="pink" onClick={() => openAuthGate('pink')}>Sign In</BlurButton>
                      <BlurButton variant="pink" onClick={() => openAuthGate('pink')}>Sign Up</BlurButton>
                    </div>
                  </div>
                </div>
              )}

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
                    {studioTab === 'css' || studioTab === 'svg' ? 'Powered by Groq' : ''}
                  </span>
                </div>
              </div>
            </div>
        </div>
    );
}
