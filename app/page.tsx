"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Wand2, ImagePlus, Loader2 as Loader2Icon, Pencil, Bot, Zap, Play, Palette, Image, Video, RefreshCw, Maximize2, Minimize2, Shield } from "lucide-react";
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

export default function Home() {
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
          // Save GIF/Video to gallery
          saveToGallery({
            url: data.url,
            type: studioTab as 'gif' | 'video',
            prompt: studioPrompt,
          });
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
    <main className="min-h-screen overflow-x-hidden text-white bg-zinc-900">
      {/* Fullscreen AI Workspace Portal */}
      {isWorkspaceFullscreen && (
        <div className="fixed inset-0 flex flex-col z-9999 bg-zinc-950">
          {/* Toolbar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-zinc-800 border-white/5 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              </div>
              <div className="w-px h-6 bg-white/10" />
              <span className="text-sm font-semibold text-gray-300">AI Workspace - Fullscreen</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-1 p-1 border rounded-lg bg-zinc-800/50 backdrop-blur-sm border-white/5">
                {(['generate', 'sketch', 'upload'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setActiveMode(mode); setAiResponse(null); }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium text-sm transition-all ${
                      activeMode === mode
                        ? 'bg-linear-to-r from-blue-600 to-blue-400 text-white shadow-md'
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
              <button
                onClick={() => setIsWorkspaceFullscreen(false)}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-white/10 hover:text-white"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <div className="p-6 space-y-6 overflow-y-auto border-r w-80 bg-zinc-900/80 border-white/5 shrink-0">
              {activeMode === 'generate' && (
                <>
                  <div>
                    <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Prompt</label>
                    <PromptInput
                      value={prompt}
                      onChange={setPrompt}
                      placeholder="Describe your vision in detail..."
                      onSubmit={handleGenerate}
                      disabled={loading}
                      loading={loading}
                      tags={['Cyberpunk', 'Fantasy', 'Portrait', 'Landscape']}
                      onTagClick={(tag) => setPrompt(prev => prev ? `${prev}, ${tag.toLowerCase()} style` : `${tag} style`)}
                    />
                  </div>
                  <GenerateButton text="Generate" loadingText="Generating" onClick={handleGenerate} disabled={!prompt.trim() || loading} loading={loading} />
                </>
              )}
              {activeMode === 'sketch' && (
                <>
                  <div>
                    <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Brush Size: {brushSize}px</label>
                    <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-purple-500" />
                  </div>
                  <div>
                    <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Render Prompt</label>
                    <PromptInput
                      value={sketchPrompt}
                      onChange={setSketchPrompt}
                      placeholder="Describe how to render your sketch..."
                      onSubmit={handleRenderSketch}
                      disabled={!hasSketchDrawing || loading}
                      loading={loading}
                      tags={['Realistic', 'Cartoon', 'Digital Art', 'Watercolor']}
                      onTagClick={(tag) => setSketchPrompt(prev => prev ? `${prev}, ${tag.toLowerCase()}` : `Render as ${tag.toLowerCase()}`)}
                    />
                  </div>
                  <GenerateButton text="Render Sketch" loadingText="Rendering" onClick={handleRenderSketch} disabled={!hasSketchDrawing || loading} loading={loading} />
                </>
              )}
              {activeMode === 'upload' && (
                <>
                  <div>
                    <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Transform Prompt</label>
                    <PromptInput
                      value={transformPrompt}
                      onChange={setTransformPrompt}
                      placeholder="Describe the transformation..."
                      onSubmit={handleTransformImage}
                      disabled={!preview || loading}
                      loading={loading}
                      tags={['Style Transfer', 'Enhance', 'Upscale', 'Colorize']}
                      onTagClick={(tag) => setTransformPrompt(prev => prev ? `${prev}, ${tag.toLowerCase()}` : tag)}
                    />
                  </div>
                  <GenerateButton text="Transform" loadingText="Transforming" onClick={handleTransformImage} disabled={!preview || loading} loading={loading} />
                </>
              )}
            </div>

            {/* Main Canvas */}
            <div className="flex-1 p-6 overflow-auto bg-zinc-950/50">
              {activeMode === 'generate' && (
                <div className="relative flex items-center justify-center h-full border bg-zinc-900/50 rounded-2xl border-white/5">
                  {loading ? (
                    <div className="text-center"><Loader /><p className="mt-4 text-gray-400">Generating...</p></div>
                  ) : generatedImage ? (
                    <img src={generatedImage} alt="Generated" className="object-contain max-w-full max-h-full rounded-xl" onClick={() => setIsImageZoomed(true)} />
                  ) : (
                    <div className="text-center text-gray-500"><Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" /><p>Enter a prompt and click Generate</p></div>
                  )}
                </div>
              )}
              {activeMode === 'sketch' && (
                <div className="relative h-full overflow-hidden border rounded-2xl border-white/10">
                  <SketchCanvas ref={sketchCanvasRef} brushSize={brushSize} opacity={opacity} onBrushSizeChange={setBrushSize} onOpacityChange={setOpacity} onHasDrawingChange={setHasSketchDrawing} />
                  {loading && <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-900/90"><Loader /><p className="mt-4 text-gray-300">Rendering...</p></div>}
                </div>
              )}
              {activeMode === 'upload' && (
                <div className="flex items-center justify-center h-full border-2 border-dashed bg-zinc-900/50 rounded-2xl border-white/10">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setPreview(URL.createObjectURL(file)); }}} />
                  <div onClick={() => fileInputRef.current?.click()} className="text-center cursor-pointer">
                    {preview ? <img src={preview} alt="Preview" className="max-w-full max-h-[60vh] object-contain rounded-xl" /> : <><Upload className="w-16 h-16 mx-auto mb-4 text-gray-500" /><p className="text-gray-400">Click to upload an image</p></>}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-64 p-4 space-y-4 overflow-y-auto border-l bg-zinc-900/80 border-white/5 shrink-0">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">Result Preview</h3>
              {(activeMode === 'generate' && generatedImage) || (activeMode === 'sketch' && renderedSketchImage) || (activeMode === 'upload' && transformedImage) ? (
                <div className="relative overflow-hidden transition-all border rounded-lg cursor-pointer group border-white/10 hover:border-white/30 bg-black/30" onClick={() => setIsImageZoomed(true)}>
                  <img 
                    src={activeMode === 'generate' ? generatedImage! : activeMode === 'sketch' ? renderedSketchImage! : transformedImage!} 
                    alt="Result preview" 
                    className="object-cover w-full transition-opacity aspect-square group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                    <span className="text-sm font-medium text-white">View Full Size</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-xs text-center text-gray-500 border border-dashed rounded-lg border-white/10">No result yet</div>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 py-2 text-xs text-gray-500 border-t bg-zinc-900/80 border-white/5 shrink-0">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span>Ready</span></div>
            <span>Press Esc to exit fullscreen</span>
          </div>
        </div>
      )}

      {/* Fullscreen Animation Studio Portal */}
      {isStudioFullscreen && (
        <div className="fixed inset-0 flex flex-col z-9999 bg-zinc-950">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-zinc-900 border-white/5 shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-800/50">
                {(['css', 'svg', 'gif', 'video'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setStudioTab(tab); setStudioCode(null); setStudioMediaUrl(null); setStudioError(null); }}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      studioTab === tab 
                        ? tab === 'css' ? 'bg-cyan-600 text-white' : tab === 'svg' ? 'bg-green-600 text-white' : tab === 'gif' ? 'bg-pink-600 text-white' : 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsStudioFullscreen(false)} className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-white/10 hover:text-white" title="Exit Fullscreen">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 min-h-0">
            {/* Left Panel */}
            <div className="flex flex-col p-4 overflow-y-auto border-r w-80 bg-zinc-900/80 border-white/5 shrink-0">
              <div className="mb-4">
                <label className="block mb-2 text-xs font-medium text-gray-400">Describe your animation</label>
                <PromptInput
                  value={studioPrompt}
                  onChange={setStudioPrompt}
                  placeholder="Describe your animation..."
                  onSubmit={generateAnimation}
                  disabled={studioLoading}
                  loading={studioLoading}
                  tags={['Bounce', 'Fade', 'Slide', 'Rotate', 'Pulse']}
                  onTagClick={(tag) => setStudioPrompt(prev => prev ? `${prev} with ${tag.toLowerCase()} effect` : `Create a ${tag.toLowerCase()} animation`)}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-xs font-medium text-gray-400">Duration: {studioDuration}s</label>
                <input type="range" min="0.5" max="5" step="0.5" value={studioDuration} onChange={(e) => setStudioDuration(e.target.value)} className="w-full accent-cyan-500" />
              </div>
              <GenerateButton text="Generate" loadingText="Generating" onClick={generateAnimation} disabled={!studioPrompt.trim() || studioLoading} loading={studioLoading} />
            </div>

            {/* Center Preview */}
            <div className="flex items-center justify-center flex-1 p-8 bg-zinc-950/50" style={getPreviewBgStyle()}>
              {studioLoading && <div className="text-center"><Loader2 /><p className="mt-4 text-gray-400">Generating...</p></div>}
              {studioError && <div className="text-center text-red-400"><p>⚠️ {studioError}</p><button onClick={generateAnimation} className="px-4 py-2 mt-4 text-red-400 rounded bg-red-600/20">Try Again</button></div>}
              {!studioLoading && !studioError && studioCode?.svg && studioTab === 'svg' && (
                <div className="flex items-center justify-center" style={{ minWidth: '300px', minHeight: '300px' }}>
                  <div dangerouslySetInnerHTML={{ __html: studioCode.svg }} style={{ width: '100%', maxWidth: '400px', maxHeight: '400px' }} />
                </div>
              )}
              {!studioLoading && !studioError && studioCode?.css && studioTab === 'css' && <><div dangerouslySetInnerHTML={{ __html: studioCode.html || '<button class="animated-element">Animated</button>' }} /><style>{studioCode.css}</style></>}
              {!studioLoading && !studioError && studioMediaUrl && (studioTab === 'gif' || studioTab === 'video') && (studioTab === 'gif' ? <img src={studioMediaUrl} alt="GIF" className="rounded-lg max-h-80" /> : <video src={studioMediaUrl} controls autoPlay loop className="rounded-lg max-h-80" />)}
              {!studioLoading && !studioError && !studioCode && !studioMediaUrl && <div className="text-center text-gray-500"><Zap className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Enter a prompt and click Generate</p></div>}
            </div>

            {/* Right Code Panel */}
            <div className="flex flex-col overflow-hidden border-l w-96 bg-zinc-900/80 border-white/5 shrink-0">
              <div className="flex border-b border-white/5">
                {(studioTab === 'svg' ? ['svg', 'css', 'react'] : ['css', 'html', 'react']).map((tab) => (
                  <button key={tab} onClick={() => setStudioCodeTab(tab as any)} className={`flex-1 px-4 py-2 text-xs font-medium ${studioCodeTab === tab ? 'bg-zinc-800 text-white' : 'text-gray-400 hover:text-white'}`}>
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-gray-300">
                <code>{studioCode ? (studioCodeTab === 'svg' ? studioCode.svg : studioCodeTab === 'css' ? studioCode.css : studioCodeTab === 'html' ? studioCode.html : studioCode.react) || '// No code' : '// Generate to see code'}</code>
              </pre>
              <button onClick={copyStudioCode} disabled={!studioCode} className="py-2 m-4 text-xs text-gray-300 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-gray-600">Copy Code</button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t bg-zinc-900/80 border-white/5 shrink-0">
            <span>{studioTab.toUpperCase()} Animation</span>
            <span>Press Esc to exit fullscreen</span>
          </div>
        </div>
      )}

      {/* Circular Scroll Progress with Back to Top - Hidden in fullscreen */}
      {!isWorkspaceFullscreen && !isStudioFullscreen && <ScrollProgress />}
      
      {/* Activity History Popup */}
      <ActivityHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      
      {/* Gallery Popup */}
      <Gallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      
      {/* ========== FIXED NAVBAR - Outside all sections ========== */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-100 w-[90%] max-w-4xl">
        <div className="relative flex items-center justify-between px-8 py-3 border rounded-full shadow-lg backdrop-blur-2xl bg-linear-to-r from-white/8 to-white/4 border-white/8 shadow-black/20">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 rounded-full pointer-events-none bg-linear-to-r from-purple-500/5 via-transparent to-pink-500/5" />
          
          {/* Logo - Theme-aware */}
          <ThemedLogo />
          
          {/* Center Navigation Links */}
          <div className="absolute flex items-center gap-6 -translate-x-1/2 left-1/2">
            <button
              onClick={() => router.push('/workspace')}
              className={`text-sm font-medium transition-all duration-300 ${navColorThemes[buttonTheme].text} ${navColorThemes[buttonTheme].hover} ${navColorThemes[buttonTheme].glow}`}
            >
              AI Workspace
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={() => router.push('/studio')}
              className={`text-sm font-medium transition-all duration-300 ${navColorThemes[buttonTheme].text} ${navColorThemes[buttonTheme].hover} ${navColorThemes[buttonTheme].glow}`}
            >
              Animation Studio
            </button>
          </div>
          
          {/* Right Side: Gallery + History + Auth */}
          <div className="flex items-center gap-3">
            {user && <GalleryButton onClick={() => setIsGalleryOpen(true)} />}
            {user && <HistoryButton onClick={() => setIsHistoryOpen(true)} />}
            <AuthButtons />
          </div>
        </div>
      </nav>

      {/* ========== SECTION 1: HERO WITH LASERFLOW ========== */}
      <section ref={heroSectionRef} className="relative pb-32 bg-zinc-900">
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-2">
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
          <div className="px-6 pt-32 pb-8 md:px-12 lg:px-20 md:pt-30 md:pb-12">
            <div className="max-w-xl text-left">
              {/* Main Heading with TypeText effect on full heading */}
              <ScrollReveal variant="fadeUp" delay={0.1} duration={1}>
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
              </ScrollReveal>
              
              {/* Subtext with ShinyText */}
              <ScrollReveal variant="fadeUp" delay={0.3} duration={0.8}>
              <div className="mb-6 text-base font-medium tracking-wide sm:text-lg md:text-xl">
                <ShinyText 
                  text="Generate, sketch, or transform with the power of AI — all from one seamless workspace."
                  speed={4}
                />
              </div>
              </ScrollReveal>
              
              {/* Additional descriptive text */}
              <ScrollReveal variant="fadeUp" delay={0.5} duration={0.8}>
              <p className="mb-4 text-sm font-normal leading-relaxed tracking-wide text-gray-400 sm:text-base">
                Whether you're a designer, developer, or creator — SketchoFlow brings your imagination to life with cutting-edge AI tools.
              </p>
              </ScrollReveal>

              
              {/* JoinToday Button */}
              <div className="relative z-30 mt-15 animate-fade-in-up" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
                <JoinToday onJoinNowClick={() => setIsSignupPopupOpen(true)} />
              </div>

              {/* Signup Popup */}
              <AuthPopup
                isOpen={isSignupPopupOpen}
                onClose={() => setIsSignupPopupOpen(false)}
                mode="signup"
                onToggleMode={() => {}}
              />

              {/* Result Modal */}
              {(() => {
                const currentImage = activeMode === 'generate' ? generatedImage : 
                                     activeMode === 'sketch' ? renderedSketchImage : 
                                     transformedImage;
                const altText = activeMode === 'sketch' ? 'Rendered sketch' : 
                                activeMode === 'generate' ? 'Generated image' : 'Transformed image';
                return (
                  <ResultModal 
                    isOpen={isImageZoomed} 
                    image={currentImage}
                    onClose={() => setIsImageZoomed(false)}
                    alt={altText}
                  />
                );
              })()}
            </div>
          </div>

          {/* Image with Container Scroll Animation */}
          <div className="relative z-10 mt-8 md:-mt-34">
            <ContainerScroll
              titleComponent={<></>}
            >
              <img 
                src="/SketchoFlow Landing.png" 
                alt="SketchoFlow AI Workspace" 
                className="object-cover object-top w-full h-auto rounded-2xl"
              />
            </ContainerScroll>
          </div>
          
          {/* ========== WORKSPACE SECTION with LightRays ========== */}
          <div id="workspace-section" ref={workspaceSectionRef} className="relative -mt-32">
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
            <div className="relative z-10 px-6 pt-8 pb-32 mx-auto max-w-7xl">
              <div className="mb-16 space-y-6 text-center">
                <SplitText
                  text="Your Professional AI Workspace"
                  tag="h2"
                  className="text-5xl font-extrabold md:text-6xl"
                  splitType="chars"
                  delay={40}
                  duration={0.6}
                  ease="power2.out"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                  textAlign="center"
                />
                <ScrollReveal variant="fadeUp" delay={0.5} duration={0.8}>
                  <p className="max-w-3xl mx-auto text-xl font-normal tracking-wide text-gray-400">
                    Generate, sketch, or transform — all in one seamless interface designed for creators.
                  </p>
                </ScrollReveal>

                {/* Professional Workspace Tool Card */}
                <ScrollReveal variant="fadeUp" delay={0.6} duration={0.9}>
                  <div className="relative overflow-hidden border shadow-2xl bg-zinc-900/80 backdrop-blur-xl rounded-2xl border-white/10">
                    {/* Toolbar Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-zinc-800 border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <span className="text-sm font-semibold text-gray-300">AI Workspace</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Tab Navigation */}
                        <div className="flex gap-1 p-1 border rounded-lg bg-zinc-800/50 backdrop-blur-sm border-white/5">
                          {(['generate', 'sketch', 'upload'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => { setActiveMode(mode); setAiResponse(null); }}
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
                        
                        {/* Fullscreen Toggle Button */}
                        <button
                          onClick={() => setIsWorkspaceFullscreen(true)}
                          className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-white/10 hover:text-white"
                          title="Fullscreen"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex h-[600px]">
                      {/* Sidebar - Tool Properties */}
                      <div className="p-6 space-y-6 overflow-y-auto border-r w-80 bg-zinc-900/50 backdrop-blur-sm border-white/5">
                        {activeMode === 'generate' && (
                          <>
                            <div>
                              <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Prompt</label>
                              <PromptInput
                                value={prompt}
                                onChange={setPrompt}
                                placeholder="Describe your vision in detail..."
                                onSubmit={handleGenerate}
                                disabled={loading}
                                loading={loading}
                                tags={['Cyberpunk', 'Fantasy', 'Portrait', 'Landscape']}
                                onTagClick={(tag) => setPrompt(prev => prev ? `${prev}, ${tag.toLowerCase()} style` : `${tag} style`)}
                              />
                            </div>
                            
                            <div>
                              <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Style</label>
                              <div className="relative">
                                <select className="w-full px-4 py-3 pr-10 text-sm text-white transition-all border appearance-none cursor-pointer bg-zinc-800 border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:border-purple-500/50">
                                  <option className="py-2 text-white bg-zinc-800">Photorealistic</option>
                                  <option className="py-2 text-white bg-zinc-800">Anime</option>
                                  <option className="py-2 text-white bg-zinc-800">Oil Painting</option>
                                  <option className="py-2 text-white bg-zinc-800">Digital Art</option>
                                  <option className="py-2 text-white bg-zinc-800">3D Render</option>
                                  <option className="py-2 text-white bg-zinc-800">Watercolor</option>
                                </select>
                                <div className="absolute inset-y-0 flex items-center pointer-events-none right-3">
                                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Aspect Ratio</label>
                              <div className="grid grid-cols-2 gap-2">
                                {['16:9', '1:1', '9:16', '4:3'].map((ratio) => (
                                  <button
                                    key={ratio}
                                    className="px-3 py-2 text-sm text-gray-300 transition-all border rounded-lg bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:text-white"
                                  >
                                    {ratio}
                                  </button>
                                ))}
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
                              <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Canvas Settings</label>
                              <div className="space-y-3">
                                <div>
                                  <label className="block mb-2 text-xs text-gray-500">Brush Size: {brushSize}px</label>
                                  <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-purple-600" />
                                </div>
                                <div>
                                  <label className="block mb-2 text-xs text-gray-500">Opacity: {opacity}%</label>
                                  <input type="range" min="10" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-purple-600" />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Enhancement Prompt</label>
                              <PromptInput
                                value={sketchPrompt}
                                onChange={setSketchPrompt}
                                placeholder="Describe how to enhance your sketch..."
                                onSubmit={handleRenderSketch}
                                disabled={!hasSketchDrawing || loading}
                                loading={loading}
                                tags={['Realistic', 'Cartoon', 'Digital Art', 'Watercolor']}
                                onTagClick={(tag) => setSketchPrompt(prev => prev ? `${prev}, ${tag.toLowerCase()}` : `Render as ${tag.toLowerCase()}`)}
                              />
                            </div>

                            <GenerateButton text="Render Sketch" loadingText="Processing" onClick={handleRenderSketch} disabled={!hasSketchDrawing || loading} loading={loading} />
                          </>
                        )}

                        {activeMode === 'upload' && (
                          <>
                            <div>
                              <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Transformation</label>
                              <PromptInput
                                value={transformPrompt}
                                onChange={setTransformPrompt}
                                placeholder="Describe the transformation..."
                                onSubmit={handleTransformImage}
                                disabled={!preview || loading}
                                loading={loading}
                                tags={['Style Transfer', 'Enhance', 'Upscale', 'Colorize']}
                                onTagClick={(tag) => setTransformPrompt(prev => prev ? `${prev}, ${tag.toLowerCase()}` : tag)}
                              />
                            </div>

                            <div>
                              <label className="block mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Strength</label>
                              <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-pink-600" />
                              <div className="flex justify-between mt-1 text-xs text-gray-500">
                                <span>Subtle</span>
                                <span>Strong</span>
                              </div>
                            </div>

                            <GenerateButton text="Transform" loadingText="Transforming" onClick={handleTransformImage} disabled={!preview || loading} loading={loading} />
                          </>
                        )}
                      </div>

                      {/* Main Canvas Area */}
                      <div className="flex-1 p-8 bg-zinc-950/30 min-h-[600px]">
                        {activeMode === 'generate' && (
                          <div className="relative flex items-center justify-center h-full overflow-hidden border bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-white/5">
                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                            
                            {loading ? (
                              <div className="relative flex flex-col items-center justify-center w-full h-full text-center text-gray-400">
                                <div className="relative w-64 h-40"><Loader /></div>
                                <p className="mt-8 text-lg font-medium">Generating your image...</p>
                                <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
                              </div>
                            ) : generatedImage ? (
                              <div className="relative flex items-center justify-center w-full h-full p-4">
                                <img src={generatedImage} alt="Generated image" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setIsImageZoomed(true)} />
                              </div>
                            ) : (
                              <div className="relative text-center text-gray-500">
                                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Preview will appear here</p>
                                <p className="mt-2 text-sm">Enter a prompt and click Generate</p>
                              </div>
                            )}
                          </div>
                        )}

                        {activeMode === 'sketch' && (
                          <div className="relative h-full overflow-hidden border shadow-inner rounded-2xl border-white/10">
                            <SketchCanvas ref={sketchCanvasRef} brushSize={brushSize} opacity={opacity} onBrushSizeChange={setBrushSize} onOpacityChange={setOpacity} onHasDrawingChange={setHasSketchDrawing} />
                            {loading && (
                              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm">
                                <div className="relative w-64 h-40"><Loader /></div>
                                <p className="mt-8 text-lg font-medium text-gray-300">Rendering your sketch...</p>
                                <p className="mt-2 text-sm text-gray-500">AI is enhancing your artwork</p>
                              </div>
                            )}
                          </div>
                        )}

                        {activeMode === 'upload' && (
                          <div className="relative flex flex-col h-full overflow-hidden border-2 border-dashed bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-white/10">
                            <div onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center flex-1 transition-all cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 group">
                              {preview ? (
                                <img src={preview} alt="preview" className="object-contain max-w-full max-h-full rounded-xl" />
                              ) : (
                                <div className="text-center text-gray-500 transition-colors group-hover:text-pink-400">
                                  <Upload className="w-16 h-16 mx-auto mb-4" />
                                  <p className="text-lg font-medium">Drop image here or click to browse</p>
                                  <p className="mt-2 text-sm">PNG, JPG, WebP up to 10MB</p>
                                </div>
                              )}
                            </div>
                            {loading && (
                              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm">
                                <div className="relative w-64 h-40"><Loader /></div>
                                <p className="mt-8 text-lg font-medium text-gray-300">Transforming your image...</p>
                                <p className="mt-2 text-sm text-gray-500">AI is analyzing and enhancing</p>
                              </div>
                            )}
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                      </div>

                      {/* Right Sidebar - Result & Export */}
                      <div className="w-64 p-4 space-y-4 overflow-y-auto border-l bg-zinc-900/50 backdrop-blur-sm border-white/5">
                        <div>
                          <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                            {activeMode === 'sketch' ? 'Rendered Result' : activeMode === 'generate' ? 'Generated Image' : 'Transformed Image'}
                          </h3>
                          <div className="space-y-2">
                            {((activeMode === 'generate' && generatedImage) || (activeMode === 'sketch' && renderedSketchImage) || (activeMode === 'upload' && transformedImage)) ? (
                              <div onClick={() => setIsImageZoomed(true)} className="relative overflow-hidden transition-all border cursor-pointer group rounded-xl border-white/10 hover:border-purple-500/50 bg-black/30">
                                <img src={activeMode === 'generate' ? generatedImage! : activeMode === 'sketch' ? renderedSketchImage! : transformedImage!} alt={activeMode === 'sketch' ? 'Rendered sketch' : activeMode === 'generate' ? 'Generated image' : 'Transformed image'} className="object-cover w-full h-32 transition-opacity group-hover:opacity-75" />
                                <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
                                  <span className="text-xs font-medium text-white">View Full Size</span>
                                </div>
                              </div>
                            ) : (
                              <div className="px-3 py-8 text-center border border-dashed bg-zinc-800/30 rounded-xl border-white/10">
                                <p className="text-xs text-gray-500">
                                  {activeMode === 'sketch' ? 'Render a sketch to see the result here' : activeMode === 'generate' ? 'Generate an image to see the result' : 'Transform an image to see the result'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">Export As</h3>
                          <div className="space-y-1.5">
                            <button onClick={() => handleExport(() => { if (activeMode === 'sketch' && sketchCanvasRef.current) { const dataUrl = sketchCanvasRef.current.getCanvasDataUrl(); if (dataUrl) { const link = document.createElement('a'); link.download = 'sketch.png'; link.href = dataUrl; link.click(); } } else if (aiResponse) { const link = document.createElement('a'); link.download = 'generated.png'; link.href = aiResponse; link.click(); } })} className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-gray-300 transition-all rounded-lg cursor-pointer hover:bg-purple-600/20 hover:text-purple-300">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>PNG
                            </button>
                            <button onClick={() => handleExport(() => { const canvas = document.querySelector('canvas'); if (canvas) { const dataUrl = canvas.toDataURL('image/jpeg', 0.9); const link = document.createElement('a'); link.download = 'image.jpg'; link.href = dataUrl; link.click(); } })} className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-gray-300 transition-all rounded-lg cursor-pointer hover:bg-blue-600/20 hover:text-blue-300">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>JPEG
                            </button>
                            <button onClick={() => handleExport(() => { const canvas = document.querySelector('canvas'); if (canvas) { const dataUrl = canvas.toDataURL('image/webp', 0.9); const link = document.createElement('a'); link.download = 'image.webp'; link.href = dataUrl; link.click(); } })} className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-gray-300 transition-all rounded-lg cursor-pointer hover:bg-green-600/20 hover:text-green-300">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>WebP
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auth Gate Blur Overlay for Workspace */}
                    {!user && (
                      <div className="absolute inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-md bg-zinc-900/60 rounded-2xl">
                        <div className="px-8 space-y-6 text-center">
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Unlock AI Workspace</h3>
                            <p className="max-w-md text-gray-400">Sign in or create an account to access all AI-powered creative tools</p>
                          </div>
                          <div className="flex items-center justify-center gap-4">
                            <BlurButton variant="blue" onClick={() => openAuthGate('blue')}>Sign In</BlurButton>
                            <BlurButton variant="blue" onClick={() => openAuthGate('blue')}>Sign Up</BlurButton>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Bar */}
                    <div className="flex items-center justify-between px-6 py-2.5 bg-zinc-900/50 border-t border-white/5 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Ready</span>
                      </div>
                      <span>AI Model: Vision</span>
                      <span>100% • 1920x1080</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: AI ANIMATION FEATURES ========== */}
      <section ref={developmentSectionRef} className="relative bg-zinc-900">
        {/* GridBeam Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <GridBeam className="opacity-60">
            <div></div>
          </GridBeam>
        </div>

        {/* Gradient overlay for blending with section 2 */}
        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none bg-linear-to-b from-zinc-900 via-zinc-900/80 to-transparent z-1" />

        {/* Content - z-index lower than navbar (z-50) */}
        <div className="relative z-20 px-6 pt-48 pb-32 mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-16 space-y-6 text-center">
            <SplitText
              text="AI-Powered Animation Studio"
              tag="h2"
              className="text-5xl font-extrabold md:text-6xl text-emerald-400"
              splitType="chars"
              delay={40}
              duration={0.6}
              ease="power2.out"
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="center"
            />
            <ScrollReveal variant="fadeUp" delay={0.5} duration={0.8}>
              <p className="max-w-3xl mx-auto text-xl font-normal tracking-wide text-gray-400">
                Four powerful tools — from instant CSS animations to stunning AI-generated videos. Everything you need to create motion magic.
              </p>
            </ScrollReveal>
          </div>

          {/* Features Grid - 2x2 Quad Layout */}
          <div className="grid max-w-5xl gap-8 mx-auto md:grid-cols-2">
            
            {/* Feature 1: CSS Animation - Instant & Lightweight */}
            <ScrollReveal variant="fadeUp" delay={0.2} duration={0.9}>
            <ParticleCard
              className="p-8 transition-all duration-300 border bg-zinc-800/50 backdrop-blur-sm rounded-3xl border-white/10 hover:border-cyan-500/40"
              glowColor="6, 182, 212"
              enableTilt={true}
              clickEffect={true}
            >
              <div className="relative">
                {/* Lottie Animation */}
                <div className="flex items-center justify-center w-full mb-6 overflow-hidden aspect-4/3 rounded-2xl bg-zinc-900/30">
                  <DotLottieReact
                    src="/Data Scanning.lottie"
                    loop
                    autoplay
                    className="object-contain w-full h-full scale-110"
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Text → CSS Animation</h3>
                  <span className="px-3 py-1 text-xs font-semibold border rounded-full bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                    Zero GPU
                  </span>
                </div>
                <p className="mb-4 leading-relaxed text-gray-400">
                  Instant, lightweight animations that run 100% client-side. Create bouncing buttons, glowing effects, and smooth transitions.
                </p>
                <div className="p-4 mb-4 border bg-zinc-900/50 rounded-xl border-white/5">
                  <p className="mb-2 text-xs text-gray-500">Example prompt:</p>
                  <p className="font-mono text-sm text-cyan-300">&quot;Make a bouncing glowing button animation&quot;</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['CSS Code', 'HTML Snippet', 'Live Preview'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/10 text-cyan-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ParticleCard>
            </ScrollReveal>

            {/* Feature 2: SVG Animation - Vector-Based */}
            <ScrollReveal variant="fadeUp" delay={0.4} duration={0.9}>
            <ParticleCard
              className="p-8 transition-all duration-300 border bg-zinc-800/50 backdrop-blur-sm rounded-3xl border-white/10 hover:border-green-500/40"
              glowColor="34, 197, 94"
              enableTilt={true}
              clickEffect={true}
            >
              <div className="relative">
                {/* Lottie Animation */}
                <div className="flex items-center justify-center w-full mb-6 overflow-hidden aspect-4/3 rounded-2xl bg-zinc-900/30">
                  <DotLottieReact
                    src="/Seo isometric composition with human characters.lottie"
                    loop
                    autoplay
                    className="object-contain w-full h-full scale-110"
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Text → SVG Animation</h3>
                  <span className="px-3 py-1 text-xs font-semibold text-green-400 border rounded-full bg-green-500/10 border-green-500/20">
                    Vector Quality
                  </span>
                </div>
                <p className="mb-4 leading-relaxed text-gray-400">
                  Generate scalable vector animations with perfect quality at any size. Create rotating shapes, morphing icons, and path animations.
                </p>
                <div className="p-4 mb-4 border bg-zinc-900/50 rounded-xl border-white/5">
                  <p className="mb-2 text-xs text-gray-500">Example prompt:</p>
                  <p className="font-mono text-sm text-green-300">&quot;Create a rotating 3D-like cube animation&quot;</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['<svg> Code', '<animate>', 'Canvas Preview'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium text-green-400 rounded-full bg-green-500/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ParticleCard>
            </ScrollReveal>

            {/* Feature 3: GIF Animation - Easy to Embed */}
            <ScrollReveal variant="fadeUp" delay={0.6} duration={0.9}>
            <ParticleCard
              className="p-8 transition-all duration-300 border bg-zinc-800/50 backdrop-blur-sm rounded-3xl border-white/10 hover:border-pink-500/40"
              glowColor="236, 72, 153"
              enableTilt={true}
              clickEffect={true}
            >
              <div className="relative">
                {/* Lottie Animation */}
                <div className="flex items-center justify-center w-full mb-6 overflow-hidden aspect-4/3 rounded-2xl bg-zinc-900/30">
                  <DotLottieReact
                    src="/New app development on desktop.lottie"
                    loop
                    autoplay
                    className="object-contain w-full h-full scale-110"
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Text → GIF Animation</h3>
                  <span className="px-3 py-1 text-xs font-semibold text-pink-400 border rounded-full bg-pink-500/10 border-pink-500/20">
                    Instant Share
                  </span>
                </div>
                <p className="mb-4 leading-relaxed text-gray-400">
                  Generate eye-catching GIF animations from text. Perfect for social media, websites, and apps — loop-friendly and easy to embed.
                </p>
                <div className="p-4 mb-4 border bg-zinc-900/50 rounded-xl border-white/5">
                  <p className="mb-2 text-xs text-gray-500">Example prompt:</p>
                  <p className="font-mono text-sm text-pink-300">&quot;A glowing neon sign flickering on and off&quot;</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Runway Gen-2', 'Pika', 'PixVerse'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium text-pink-400 rounded-full bg-pink-500/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ParticleCard>
            </ScrollReveal>

            {/* Feature 4: Video Animation - Premium MP4 */}
            <ScrollReveal variant="fadeUp" delay={0.8} duration={0.9}>
            <ParticleCard
              className="p-8 transition-all duration-300 border bg-zinc-800/50 backdrop-blur-sm rounded-3xl border-white/10 hover:border-purple-500/40"
              glowColor="147, 51, 234"
              enableTilt={true}
              clickEffect={true}
            >
              <div className="relative">
                {/* Lottie Animation */}
                <div className="flex items-center justify-center w-full mb-6 overflow-hidden aspect-4/3 rounded-2xl bg-zinc-900/30">
                  <DotLottieReact
                    src="/Web Development.lottie"
                    loop
                    autoplay
                    className="object-contain w-full h-full scale-110"
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Text → Video (MP4)</h3>
                  <span className="px-3 py-1 text-xs font-semibold text-purple-400 border rounded-full bg-purple-500/10 border-purple-500/20">
                    AI Studio
                  </span>
                </div>
                <p className="mb-4 leading-relaxed text-gray-400">
                  Create professional video animations with AI. Generate explainer scenes, logo reveals, and cinematic motion graphics.
                </p>
                <div className="p-4 mb-4 border bg-zinc-900/50 rounded-xl border-white/5">
                  <p className="mb-2 text-xs text-gray-500">Example prompt:</p>
                  <p className="font-mono text-sm text-purple-300">&quot;Logo reveal with particles and light rays&quot;</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Runway Gen-2', 'Pika', 'PixVerse'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium text-purple-400 rounded-full bg-purple-500/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ParticleCard>
            </ScrollReveal>

          </div>

          {/* Bottom CTA */}
          <div className="relative z-40 pb-32 mt-16 text-center" suppressHydrationWarning>
            <p className="mb-6 text-gray-500">Ready to create stunning animations with AI?</p>
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
          <div className="px-6 mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="mb-16 space-y-6 text-center">
              <SplitText
                text="Your Animation Workspace"
                tag="h2"
                className="text-5xl font-extrabold md:text-6xl text-violet-400"
                splitType="chars"
                delay={40}
                duration={0.6}
                ease="power2.out"
                from={{ opacity: 0, y: 50 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="center"
              />
              <ScrollReveal variant="fadeUp" delay={0.5} duration={0.8}>
              <p className="max-w-3xl mx-auto text-xl font-normal tracking-wide text-gray-400">
                Four powerful tools in one unified interface. Create CSS, SVG, GIF, and Video animations with AI.
              </p>
              </ScrollReveal>
            </div>

            {/* Animation Studio Workspace */}
            <ScrollReveal variant="zoomIn" delay={0.7} duration={1}>
            <div className="relative overflow-hidden border shadow-2xl bg-zinc-900/80 backdrop-blur-xl border-white/10 rounded-xl" suppressHydrationWarning>
              {/* Top Toolbar with 4 Tabs */}
              <div className="flex items-center justify-between px-4 py-2 border-b bg-zinc-950/90 border-white/5">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  {/* 4 Feature Tabs */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/50">
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
                  {/* Fullscreen Toggle Button */}
                  <button
                    onClick={() => setIsStudioFullscreen(true)}
                    className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-white/10 hover:text-white"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
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
                    className="px-3 py-1 text-xs text-white transition-colors bg-pink-600 rounded hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Export
                  </button>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="flex h-[550px]">
                {/* Left - Prompt Input Panel */}
                <div className={`w-80 bg-zinc-950/50 border-r border-white/5 p-4 flex flex-col shrink-0 overflow-y-auto`}>
                  <div className="mb-4">
                    <label className="block mb-2 text-xs font-medium text-gray-400">Describe your animation</label>
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
                    <label className="block mb-2 text-xs font-medium text-gray-400">Quick Prompts</label>
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
                  <div className="mb-4 space-y-4">
                    <div>
                      <label className="block mb-2 text-xs font-medium text-gray-400">
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
                        <label className="block mb-2 text-xs font-medium text-gray-400">Easing</label>
                        <select 
                          value={studioEasing}
                          onChange={(e) => setStudioEasing(e.target.value)}
                          className="w-full px-3 py-2 text-sm text-gray-300 border rounded bg-zinc-900 border-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                        <label className="block mb-2 text-xs font-medium text-gray-400">Aspect Ratio</label>
                        <select 
                          value={studioAspectRatio}
                          onChange={(e) => setStudioAspectRatio(e.target.value)}
                          className="w-full px-3 py-2 text-sm text-gray-300 border rounded bg-zinc-900 border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500"
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
                <div className="relative flex flex-col flex-1 bg-zinc-900/50">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
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
                  <div className="relative flex items-center justify-center flex-1 p-8" style={getPreviewBgStyle()}>
                    {/* Loading State */}
                    {studioLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm">
                        <Loader2 />
                        <p className="mt-8 text-lg font-medium text-gray-300">
                          {studioTab === 'css' ? 'Generating CSS Animation...' :
                           studioTab === 'svg' ? 'Creating SVG Animation...' :
                           studioTab === 'gif' ? 'Generating GIF...' :
                           'Creating Video...'}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          {studioTab === 'gif' || studioTab === 'video' ? 'This may take a few moments' : 'AI is crafting your animation'}
                        </p>
                      </div>
                    )}

                    {/* Error State */}
                    {studioError && (
                      <div className="text-center">
                        <div className="mb-2 text-red-400">⚠️</div>
                        <p className="text-sm text-red-400">{studioError}</p>
                        <button 
                          onClick={generateAnimation}
                          className="px-4 py-2 mt-4 text-xs text-red-400 transition-colors rounded bg-red-600/20 hover:bg-red-600/30"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {/* CSS/SVG Preview */}
                    {!studioLoading && !studioError && (studioTab === 'css' || studioTab === 'svg') && (
                      <div className="relative">
                        {studioTab === 'svg' && studioCode?.svg ? (
                          <div 
                            className="flex items-center justify-center"
                            style={{ minWidth: '300px', minHeight: '300px' }}
                          >
                            <div 
                              className="svg-preview"
                              dangerouslySetInnerHTML={{ __html: studioCode.svg }} 
                              style={{ width: '100%', maxWidth: '400px', maxHeight: '400px' }}
                            />
                          </div>
                        ) : studioTab === 'css' && studioCode?.css ? (
                          <>
                            <div 
                              className="animated-preview"
                              dangerouslySetInnerHTML={{ __html: studioCode.html || '<button class="animated-element">Animated Element</button>' }}
                            />
                            <style>{studioCode.css}</style>
                          </>
                        ) : (
                          <div className="text-center text-gray-500">
                            <div className="flex justify-center mb-4">
                              {studioTab === 'css' ? <Zap className="w-12 h-12 text-cyan-400/50" /> : <Palette className="w-12 h-12 text-green-400/50" />}
                            </div>
                            <p className="text-sm">Enter a prompt and click Generate</p>
                            <p className="mt-2 text-xs text-gray-600">Your animation will appear here</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* GIF/Video Preview */}
                    {!studioLoading && !studioError && (studioTab === 'gif' || studioTab === 'video') && (
                      <div className="relative max-w-full max-h-full">
                        {studioMediaUrl ? (
                          studioTab === 'gif' ? (
                            <img src={studioMediaUrl} alt="Generated GIF" className="max-w-full rounded-lg shadow-2xl max-h-80" />
                          ) : (
                            <video 
                              src={studioMediaUrl} 
                              controls 
                              autoPlay 
                              loop 
                              className="max-w-full rounded-lg shadow-2xl max-h-80"
                            />
                          )
                        ) : (
                          <div className="text-center text-gray-500">
                            <div className="flex justify-center mb-4">
                              {studioTab === 'gif' ? <Image className="w-12 h-12 text-pink-400/50" /> : <Video className="w-12 h-12 text-purple-400/50" />}
                            </div>
                            <p className="text-sm">Enter a prompt and click Generate</p>
                            <p className="mt-2 text-xs text-gray-600">Your {studioTab === 'gif' ? 'GIF' : 'video'} will appear here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Background Options */}
                  <div className="flex items-center gap-2 px-4 py-2 border-t border-white/5">
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
                <div className="flex flex-col border-l w-80 bg-zinc-950/50 border-white/5">
                  {/* Code Tabs */}
                  <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5">
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
                      <span className="px-2 text-xs text-gray-500">
                        {studioTab === 'gif' ? 'GIF output will be displayed in preview' : 'Video output will be displayed in preview'}
                      </span>
                    )}
                  </div>

                  {/* Code Display */}
                  <div className="flex-1 p-4 overflow-auto">
                    {(studioTab === 'css' || studioTab === 'svg') ? (
                      <pre className="font-mono text-xs leading-relaxed text-gray-300 whitespace-pre-wrap">
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
                      <div className="py-8 text-center text-gray-500">
                        <div className="flex justify-center mb-4">
                          {studioTab === 'gif' ? <Image className="w-8 h-8 text-pink-400/50" /> : <Video className="w-8 h-8 text-purple-400/50" />}
                        </div>
                        <p className="text-xs">
                          {studioTab === 'gif' ? 'GIF files are visual outputs' : 'Video files are visual outputs'}
                        </p>
                        <p className="mt-2 text-xs text-gray-600">
                          Use the Export button to download
                        </p>
                        {studioMediaUrl && (
                          <p className="mt-4 text-xs text-green-400">✓ Ready to export</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Copy Button */}
                  <div className="px-4 py-3 border-t border-white/5">
                    <button 
                      onClick={copyStudioCode}
                      disabled={!studioCode || (studioTab !== 'css' && studioTab !== 'svg')}
                      className="flex items-center justify-center w-full gap-2 py-2 text-xs font-medium text-gray-300 transition-colors rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-gray-600 disabled:cursor-not-allowed"
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
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-md bg-zinc-900/60 rounded-xl">
                  <div className="px-8 space-y-6 text-center">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white">Unlock Animation Studio</h3>
                      <p className="max-w-md text-gray-400">Sign in or create an account to create CSS, SVG, GIF, and Video animations</p>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <BlurButton variant="pink" onClick={() => openAuthGate('pink')}>Sign In</BlurButton>
                      <BlurButton variant="pink" onClick={() => openAuthGate('pink')}>Sign Up</BlurButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Status Bar */}
              <div className="flex items-center justify-between px-4 py-2 border-t bg-zinc-950/90 border-white/5">
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
            </ScrollReveal>

            {/* Feature Highlights with Lucide Icons */}
            <ScrollReveal variant="fadeUp" delay={0.2} duration={0.6}>
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
                  <h4 className="mb-1 text-sm font-semibold text-white">{feature.title}</h4>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== SECTION 5: CONCLUSION ========== */}
      <section ref={conclusionSectionRef} className="relative min-h-screen pt-24 pb-0 overflow-hidden bg-black">
        {/* Top Gradient Transition - pure black blend */}
        <div className="absolute inset-x-0 top-0 z-10 h-40 bg-black pointer-events-none" />

        {/* Main Content - Flex layout for side by side */}
        <div className="relative z-20 flex items-center min-h-screen">
          {/* Left Side - Text Content (takes 50% on large screens) */}
          <div className="relative z-30 w-full px-8 py-20 lg:w-1/2 md:px-16 lg:px-20">
            {/* Main Headline */}
            <div className="mb-6">
              <SplitText
                text="Empower Creativity"
                tag="h2"
                className="text-4xl font-bold text-white md:text-5xl lg:text-6xl"
                splitType="chars"
                delay={40}
                duration={0.6}
                ease="power2.out"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="left"
              />
              <div className="flex flex-wrap items-baseline gap-3 mt-2">
                <span className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">to</span>
                <RotatingText
                  texts={['Sketch','Generate','Animate', 'Export', 'Share', 'Love']}
                  mainClassName="inline-flex px-4 py-2 bg-linear-to-r from-zinc-800 via-yellow-200 to-zinc-800 text-zinc-900 rounded-lg overflow-hidden text-4xl md:text-5xl lg:text-6xl font-bold"
                />
              </div>
            </div>

            {/* Subtitle with ShinyText */}
            <ScrollReveal variant="fadeUp" delay={0.3} duration={0.8}>
            <div className="max-w-lg mb-6 text-base leading-relaxed md:text-lg">
              <ShinyText 
                text="Sketchoflow transforms your rough sketches into polished animations. Generate CSS, SVG, GIF, and video animations with AI — no design experience needed. Your imagination is the only limit."
                speed={3}
                className="text-gray-600!"
              />
            </div>
            </ScrollReveal>

            {/* Feature Points with Lucide Icons */}
            <ScrollReveal variant="fadeUp" delay={0.5} duration={0.8}>
            <div className="grid max-w-md grid-cols-2 gap-3 mb-6">
              {[
                { icon: Pencil, text: 'Sketch to Animation', color: 'text-violet-400' },
                { icon: Bot, text: 'AI-Powered Generation', color: 'text-cyan-400' },
                { icon: Zap, text: 'Instant Export', color: 'text-amber-400' },
                { icon: RefreshCw, text: 'Image to Transform', color: 'text-pink-400' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2.5">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm font-medium text-gray-200">{item.text}</span>
                </div>
              ))}
            </div>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal variant="fadeUp" delay={0.3} duration={0.6}>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <StartFree text="Start Creating Free" />
              <Explore 
                text="Explore Features" 
                onClick={() => workspaceSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>
            </ScrollReveal>

            {/* Trust Badge */}
            <ScrollReveal variant="fadeUp" delay={0.4} duration={0.6}>
            <p className="text-sm text-gray-500">
              Join <span className="font-medium text-white">10,000+</span> creators already using Sketchoflow
            </p>
            </ScrollReveal>
          </div>

          {/* Right Side - 3D Robot (takes 50% on large screens) */}
          <div className="hidden lg:block absolute right-0 top-0 w-[55%] h-[110%] z-10 overflow-visible">
            <ScrollReveal variant="zoomOut" delay={0.2} duration={1}>
            <div 
              className="w-full h-full overflow-visible"
            >
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
                style={{
                  transform: 'translateX(0%) translateY(-5%) scale(1.8)',
                  transformOrigin: 'center top',
                }}
              />
            </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-linear-to-t from-black to-transparent z-25" />
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative pt-20 pb-10 bg-black">
        {/* Top border glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent" />
        
        <div className="px-8 mx-auto max-w-7xl md:px-16 lg:px-20">
          {/* Footer Grid */}
          <ScrollReveal variant="fadeUp" delay={0.1} duration={0.6}>
          <div className="grid grid-cols-2 gap-10 mb-16 md:grid-cols-4">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 shadow-lg rounded-xl bg-linear-to-br from-violet-600 to-purple-600 shadow-purple-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SketchoFlow</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                Transform your creative ideas into stunning animations with the power of AI.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Templates', 'Integrations'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">Resources</h4>
              <ul className="space-y-3">
                {['Documentation', 'Tutorials', 'Blog', 'Community'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">Company</h4>
              <ul className="space-y-3">
                {['About', 'Careers', 'Contact', 'Privacy'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </ScrollReveal>

          {/* Bottom Bar */}
          <ScrollReveal variant="fadeUp" delay={0.2} duration={0.6}>
          <div className="flex flex-col items-center justify-between pt-8 border-t md:flex-row border-white/10">
            <p className="text-sm text-gray-600">
              © 2025 SketchoFlow. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <SocialButtons />
            </div>
          </div>
          </ScrollReveal>
        </div>
      </footer>
    </main>
  );
}
