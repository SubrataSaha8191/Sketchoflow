"use client";
import { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Pencil, Eraser, Circle, Square, Minus, Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";

export interface SketchCanvasRef {
  getCanvasDataUrl: () => string | null;
  clearCanvas: () => void;
}

interface SketchCanvasProps {
  brushSize?: number;
  opacity?: number;
  onBrushSizeChange?: (size: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onHasDrawingChange?: (hasDrawing: boolean) => void;
}

type Tool = 'pencil' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'pan';

interface HistoryState {
  imageData: ImageData;
}

const SketchCanvas = forwardRef<SketchCanvasRef, SketchCanvasProps>(
  ({ brushSize = 3, opacity = 100, onBrushSizeChange, onOpacityChange, onHasDrawingChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [internalBrushSize, setInternalBrushSize] = useState(brushSize);
  const [internalOpacity, setInternalOpacity] = useState(opacity);
  const [activeTool, setActiveTool] = useState<Tool>('pencil');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // For shape drawing
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [tempCanvas, setTempCanvas] = useState<HTMLCanvasElement | null>(null);
  
  // History for undo/redo - using refs for immediate access
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef(-1);
  const [historyLength, setHistoryLength] = useState(0); // For UI updates
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1); // For UI updates
  const maxHistory = 50;

  // Sync with external props
  useEffect(() => {
    setInternalBrushSize(brushSize);
  }, [brushSize]);

  useEffect(() => {
    setInternalOpacity(opacity);
  }, [opacity]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    // Fill with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctxRef.current = ctx;
    
    // Save initial state directly to refs
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [{ imageData }];
    historyIndexRef.current = 0;
    setHistoryLength(1);
    setCurrentHistoryIndex(0);
  }, []);

  // Helper function to convert hex color to rgba with opacity
  const getColorWithOpacity = (hexColor: string, opacity: number) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  // Update context settings when they change
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = internalBrushSize;
    ctx.globalAlpha = 1; // Reset globalAlpha, we use rgba instead
    
    if (activeTool === 'eraser') {
      ctx.strokeStyle = "#ffffff";
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.strokeStyle = getColorWithOpacity(strokeColor, internalOpacity);
      ctx.globalCompositeOperation = "source-over";
    }
  }, [strokeColor, internalBrushSize, internalOpacity, activeTool]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Trim history to current index and add new state
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push({ imageData });
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    
    // Update UI state
    setHistoryLength(newHistory.length);
    setCurrentHistoryIndex(historyIndexRef.current);
    onHasDrawingChange?.(historyIndexRef.current > 0);
  }, [onHasDrawingChange]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    
    const ctx = ctxRef.current;
    if (!ctx) return;

    historyIndexRef.current -= 1;
    const state = historyRef.current[historyIndexRef.current];
    if (state) {
      ctx.putImageData(state.imageData, 0, 0);
      setCurrentHistoryIndex(historyIndexRef.current);
      onHasDrawingChange?.(historyIndexRef.current > 0);
    }
  }, [onHasDrawingChange]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    
    const ctx = ctxRef.current;
    if (!ctx) return;

    historyIndexRef.current += 1;
    const state = historyRef.current[historyIndexRef.current];
    if (state) {
      ctx.putImageData(state.imageData, 0, 0);
      setCurrentHistoryIndex(historyIndexRef.current);
      onHasDrawingChange?.(historyIndexRef.current > 0);
    }
  }, [onHasDrawingChange]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getCanvasDataUrl: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL("image/png");
    },
    clearCanvas: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = ctxRef.current;
      if (!ctx) return;
      
      // Cancel any ongoing drawing
      setIsDrawing(false);
      setIsPanning(false);
      setTempCanvas(null);
      
      // Reset to identity matrix and clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Re-apply the 2x scale
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      
      // Restore context settings
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = internalBrushSize;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = getColorWithOpacity(strokeColor, internalOpacity);
      
      // IMMEDIATELY clear history using refs
      const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current = [{ imageData: newImageData }];
      historyIndexRef.current = 0;
      setHistoryLength(1);
      setCurrentHistoryIndex(0);
      onHasDrawingChange?.(false);
    },
  }), [internalBrushSize, strokeColor, internalOpacity, onHasDrawingChange]);

  const getCanvasPoint = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    const point = getCanvasPoint(e);
    setStartPoint(point);
    
    if (activeTool === 'pencil' || activeTool === 'eraser') {
      ctxRef.current!.beginPath();
      ctxRef.current!.moveTo(point.x, point.y);
    } else {
      // For shapes, create temp canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const temp = document.createElement('canvas');
        temp.width = canvas.width;
        temp.height = canvas.height;
        const tempCtx = temp.getContext('2d');
        if (tempCtx && ctxRef.current) {
          tempCtx.drawImage(canvas, 0, 0);
        }
        setTempCanvas(temp);
      }
    }
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (activeTool === 'pan' && isPanning) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;
    
    const point = getCanvasPoint(e);
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else if (tempCanvas) {
      // Restore from temp canvas and draw shape preview
      // Reset transform to draw tempCanvas at 1:1
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.restore();
      
      // Now draw the shape with the 2x transform active
      ctx.beginPath();
      
      if (activeTool === 'line') {
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      } else if (activeTool === 'rectangle') {
        const width = point.x - startPoint.x;
        const height = point.y - startPoint.y;
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
      } else if (activeTool === 'circle') {
        const radiusX = Math.abs(point.x - startPoint.x);
        const radiusY = Math.abs(point.y - startPoint.y);
        const centerX = startPoint.x + (point.x - startPoint.x) / 2;
        const centerY = startPoint.y + (point.y - startPoint.y) / 2;
        ctx.ellipse(centerX, centerY, radiusX / 2, radiusY / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      ctxRef.current?.closePath();
      setTempCanvas(null);
      saveToHistory();
    }
  };

  const clearCanvas = (e?: React.MouseEvent) => {
    // Prevent any event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    // Cancel any ongoing drawing FIRST
    setIsDrawing(false);
    setIsPanning(false);
    setTempCanvas(null);
    
    // Reset to identity matrix and clear ENTIRE canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Re-apply the 2x scale
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    
    // Restore context settings
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = internalBrushSize;
    ctx.globalAlpha = 1;
    ctx.strokeStyle = activeTool === 'eraser' ? "#ffffff" : getColorWithOpacity(strokeColor, internalOpacity);
    
    // IMMEDIATELY clear history using refs (no React state delay)
    const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [{ imageData: newImageData }];
    historyIndexRef.current = 0;
    setHistoryLength(1);
    setCurrentHistoryIndex(0);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.25), 4));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Use native wheel event to properly prevent default behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.25), 4));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const tools = [
    { id: 'pencil' as Tool, icon: Pencil, label: 'Pencil' },
    { id: 'eraser' as Tool, icon: Eraser, label: 'Eraser' },
    { id: 'line' as Tool, icon: Minus, label: 'Line' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'pan' as Tool, icon: Move, label: 'Pan' },
  ];

  const getCursor = () => {
    switch (activeTool) {
      case 'pan': return isPanning ? 'grabbing' : 'grab';
      case 'eraser': return 'cell';
      default: return 'crosshair';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Canvas Container with zoom/pan */}
      <div 
        ref={containerRef}
        className="flex-1 relative rounded-lg overflow-hidden bg-zinc-800/50"
        style={{ cursor: getCursor() }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            className="bg-white shadow-2xl"
            style={{ 
              width: '100%', 
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
        
        {/* Floating toolbar - Tools */}
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 bg-zinc-800/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-2 rounded-lg transition-all ${
                activeTool === tool.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
          
          <div className="w-px h-6 bg-white/20 mx-1" />
          
          <button
            onClick={undo}
            disabled={currentHistoryIndex <= 0}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={currentHistoryIndex >= historyLength - 1}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom toolbar - Color & Actions */}
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-zinc-800/95 backdrop-blur-sm rounded-full border border-white/10 shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Color:</span>
            <div 
              className="w-7 h-7 rounded-full cursor-pointer border-2 border-white/30 relative overflow-hidden shadow-inner"
              style={{ backgroundColor: strokeColor }}
            >
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          
          <div className="w-px h-5 bg-white/20" />
          
          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => handleZoom(0.25)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-5 bg-white/20" />
          
          <button
            onClick={clearCanvas}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-3 py-1.5 text-xs font-medium bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/30 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
});

SketchCanvas.displayName = "SketchCanvas";

export default SketchCanvas;
