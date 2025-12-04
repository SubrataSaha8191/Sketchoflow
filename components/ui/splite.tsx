'use client'

import { Suspense, lazy, useRef, forwardRef, useImperativeHandle, CSSProperties } from 'react'
import type { Application } from '@splinetool/runtime'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  style?: CSSProperties
  onLoad?: (spline: Application) => void
}

export interface SplineSceneRef {
  spline: Application | null
}

export const SplineScene = forwardRef<SplineSceneRef, SplineSceneProps>(
  ({ scene, className, style, onLoad }, ref) => {
    const splineRef = useRef<Application | null>(null)

    useImperativeHandle(ref, () => ({
      spline: splineRef.current
    }))

    const handleLoad = (spline: Application) => {
      splineRef.current = spline
      // Set high quality rendering
      if (spline) {
        try {
          // Enable high quality settings if available
          spline.setZoom && spline.setZoom(1);
        } catch (e) {
          // Ignore if method not available
        }
      }
      onLoad?.(spline)
    }

    return (
      <Suspense 
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader"></span>
          </div>
        }
      >
        <div style={{ ...style, imageRendering: 'high-quality' }} className={className}>
          <Spline
            scene={scene}
            className="w-full h-full"
            onLoad={handleLoad}
            style={{ imageRendering: 'auto' }}
          />
        </div>
      </Suspense>
    )
  }
)

SplineScene.displayName = 'SplineScene'