"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Sparkles, Wand2, ImagePlus, Loader2 as Loader2Icon, Pencil, Bot, Zap, Play, Palette, Image, Video, RefreshCw, Minimize2, Shield } from "lucide-react";
import dynamic from 'next/dynamic';
const GenerateButton = dynamic(() => import('@/components/GenerateButton'), { ssr: false });
const AuthButtons = dynamic(() => import('@/components/AuthButtons'), { ssr: false });
import { useTheme, ColorTheme } from "@/context/ThemeContext";
import { useAuthGate } from "@/context/AuthGateContext";
import { useAuth } from "@/context/AuthContext";
import SketchCanvas, { SketchCanvasRef } from "@/components/SketchCanvas";
const AuthPopup = dynamic(() => import('@/components/AuthPopup'), { ssr: false });
import Loader from "@/components/Loader";
const StartFree = dynamic(() => import('@/components/StartFree'), { ssr: false });
const BlurButton = dynamic(() => import('@/components/BlurButtons'), { ssr: false });
import PromptInput from "@/components/PromptInput";
import ActivityHistory, { HistoryButton, saveActivity } from "@/components/ActivityHistory";
import Gallery, { GalleryButton, saveToGallery } from "@/components/Gallery";
import { useRouter } from 'next/navigation';
import ResultModal from "@/components/ResultModal";

const Workspace = () => {
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
  const router = useRouter();

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

      const promptToSend = sketchPrompt?.trim() || "";
      // Save activity (allow empty prompt for sketch)
      saveActivity({ type: 'sketch', prompt: promptToSend || 'Sketch rendering' });

      // Inform user when generating without a prompt
      if (!promptToSend) setAiResponse("Generating from the sketch (no prompt provided)...");

      // Save the sketch as a temporary preview while AI generates
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

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleExport = (exportFn: () => void) => {
    // Require authentication for export
    if (!requireAuth(buttonTheme)) return;
    exportFn();
  };

  return (
    <div className="fixed inset-0 z-30 transition-all">
      <div className="relative w-full h-screen flex flex-col bg-zinc-900/95 backdrop-blur-lg overflow-hidden">
          {/* Toolbar Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-zinc-800 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 cursor-pointer"
                        onClick={() => router.push('/')}>
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <span className="text-sm font-semibold text-gray-300">AI Workspace</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Tab Navigation */}
                        <div className="flex gap-1 bg-zinc-800/50 backdrop-blur-sm rounded-lg p-1 border border-white/5">
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
                        
                        {/* Toggle to Studio */}
                        <button
                        onClick={() => router.push('/studio')}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-200 rounded-md text-sm text-gray-300 hover:text-black transition-colors"
                        title="Open Studio"
                        aria-label="Open Studio"
                        >
                        AI Studio
                        </button>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex min-h-0 h-full">
                      {/* Sidebar - Tool Properties */}
                      <div className="w-80 h-full bg-zinc-900/50 backdrop-blur-sm border-r border-white/5 p-6 space-y-6 overflow-y-auto">
                        {activeMode === 'generate' && (
                          <>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Prompt</label>
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
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Style</label>
                              <div className="relative">
                                <select className="w-full px-4 py-3 pr-10 bg-zinc-800 border border-purple-500/30 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer hover:border-purple-500/50">
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
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Canvas Settings</label>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-2">Brush Size: {brushSize}px</label>
                                  <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-purple-600" />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-2">Opacity: {opacity}%</label>
                                  <input type="range" min="10" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-purple-600" />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Enhancement Prompt</label>
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
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Transformation</label>
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
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Strength</label>
                              <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-pink-600" />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Subtle</span>
                                <span>Strong</span>
                              </div>
                            </div>

                            <GenerateButton text="Transform" loadingText="Transforming" onClick={handleTransformImage} disabled={!preview || loading} loading={loading} />
                          </>
                        )}
                      </div>

                      {/* Main Canvas Area */}
                      <div className="flex-1 bg-zinc-950/30 min-h-0 h-full">
                        {activeMode === 'generate' && (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                            
                            {loading ? (
                              <div className="relative text-center text-gray-400 w-full h-full flex flex-col items-center justify-center">
                                <div className="relative w-64 h-40"><Loader /></div>
                                <p className="text-lg font-medium mt-8">Generating your image...</p>
                                <p className="text-sm mt-2 text-gray-500">This may take a few moments</p>
                              </div>
                            ) : generatedImage ? (
                              <div className="relative w-full h-full flex items-center justify-center p-4">
                                <img src={generatedImage} alt="Generated image" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setIsImageZoomed(true)} />
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
                            <SketchCanvas ref={sketchCanvasRef} brushSize={brushSize} opacity={opacity} onBrushSizeChange={setBrushSize} onOpacityChange={setOpacity} onHasDrawingChange={setHasSketchDrawing} />
                            {loading && (
                              <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                                <div className="relative w-64 h-40"><Loader /></div>
                                <p className="text-lg font-medium text-gray-300 mt-8">Rendering your sketch...</p>
                                <p className="text-sm mt-2 text-gray-500">AI is enhancing your artwork</p>
                              </div>
                            )}
                          </div>
                        )}

                        {activeMode === 'upload' && (
                          <div className="h-full flex flex-col bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/10 relative overflow-hidden">
                            <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group">
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
                            {loading && (
                              <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                                <div className="relative w-64 h-40"><Loader /></div>
                                <p className="text-lg font-medium text-gray-300 mt-8">Transforming your image...</p>
                                <p className="text-sm mt-2 text-gray-500">AI is analyzing and enhancing</p>
                              </div>
                            )}
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                      </div>

                      {/* Right Sidebar - Result & Export */}
                      <div className="w-64 h-full bg-zinc-900/50 backdrop-blur-sm border-l border-white/5 p-4 space-y-4 overflow-y-auto">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                            {activeMode === 'sketch' ? 'Rendered Result' : activeMode === 'generate' ? 'Generated Image' : 'Transformed Image'}
                          </h3>
                          <div className="space-y-2">
                            {((activeMode === 'generate' && generatedImage) || (activeMode === 'sketch' && renderedSketchImage) || (activeMode === 'upload' && transformedImage)) ? (
                              <div onClick={() => setIsImageZoomed(true)} className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all bg-black/30">
                                <img src={activeMode === 'generate' ? generatedImage! : activeMode === 'sketch' ? renderedSketchImage! : transformedImage!} alt={activeMode === 'sketch' ? 'Rendered sketch' : activeMode === 'generate' ? 'Generated image' : 'Transformed image'} className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">View Full Size</span>
                                </div>
                              </div>
                            ) : (
                              <div className="px-3 py-8 bg-zinc-800/30 rounded-xl border border-dashed border-white/10 text-center">
                                <p className="text-xs text-gray-500">
                                  {activeMode === 'sketch' ? 'Render a sketch to see the result here' : activeMode === 'generate' ? 'Generate an image to see the result' : 'Transform an image to see the result'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Export As</h3>
                          <div className="space-y-1.5">
                            <button onClick={() => handleExport(() => { if (activeMode === 'sketch' && sketchCanvasRef.current) { const dataUrl = sketchCanvasRef.current.getCanvasDataUrl(); if (dataUrl) { const link = document.createElement('a'); link.download = 'sketch.png'; link.href = dataUrl; link.click(); } } else if (aiResponse) { const link = document.createElement('a'); link.download = 'generated.png'; link.href = aiResponse; link.click(); } })} className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-purple-600/20 hover:text-purple-300 rounded-lg cursor-pointer transition-all flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>PNG
                            </button>
                            <button onClick={() => handleExport(() => { const canvas = document.querySelector('canvas'); if (canvas) { const dataUrl = canvas.toDataURL('image/jpeg', 0.9); const link = document.createElement('a'); link.download = 'image.jpg'; link.href = dataUrl; link.click(); } })} className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 rounded-lg cursor-pointer transition-all flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>JPEG
                            </button>
                            <button onClick={() => handleExport(() => { const canvas = document.querySelector('canvas'); if (canvas) { const dataUrl = canvas.toDataURL('image/webp', 0.9); const link = document.createElement('a'); link.download = 'image.webp'; link.href = dataUrl; link.click(); } })} className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-green-600/20 hover:text-green-300 rounded-lg cursor-pointer transition-all flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>WebP
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auth Gate Blur Overlay for Workspace */}
                    {!user && (
                      <div className="absolute inset-0 z-40 backdrop-blur-md bg-zinc-900/60 flex flex-col items-center justify-center rounded-2xl">
                        <div className="text-center space-y-6 px-8">
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Unlock AI Workspace</h3>
                            <p className="text-gray-400 max-w-md">Sign in or create an account to access all AI-powered creative tools</p>
                          </div>
                          <div className="flex items-center justify-center gap-4">
                            <BlurButton variant="blue" onClick={() => openAuthGate('blue')}>Sign In</BlurButton>
                            <BlurButton variant="blue" onClick={() => openAuthGate('blue')}>Sign Up</BlurButton>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Result Modal */}
                    <ResultModal
                      isOpen={isImageZoomed}
                      image={
                        activeMode === 'generate' ? generatedImage : activeMode === 'sketch' ? renderedSketchImage : transformedImage
                      }
                      onClose={() => setIsImageZoomed(false)}
                      alt={activeMode === 'sketch' ? 'Rendered sketch' : activeMode === 'generate' ? 'Generated image' : 'Transformed image'}
                    />
        </div>
      </div>
  );
}



export default Workspace