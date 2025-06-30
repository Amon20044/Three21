import { Suspense, useRef, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { InteractiveModelPrimitive } from './InteractiveModelPrimitive';
import { DisassemblyUI } from './DisassemblyUI';
import { useLayerManager } from './LayerManager';
import { AnimationController } from './AnimationController';
import { Three21Bot } from './Three21Bot';
import { useModelInfo } from './ModelInfoContext';
import { Toast } from './Toast';
import html2canvas from 'html2canvas';

export default function AnyModelViewer({ url, type }) {
    const modelRef = useRef();
    const canvasRef = useRef();
    const { initializeLayers, currentLayer, isAnimating, totalLayers, updateAnimation } = useLayerManager(modelRef);
    
    // Toast state for object clicking
    const [toast, setToast] = useState({ message: '', isVisible: false });
    
    // Use optional chaining to prevent context errors
    const modelInfoContext = useModelInfo();
    const { 
        modelInfo, 
        isAIOpen, 
        selectedPart, 
        closeAI, 
        setIsAIOpen, 
        loadModelInfo 
    } = modelInfoContext || {};
    
    // Load model info when component mounts
    useEffect(() => {
        if (loadModelInfo) {
            loadModelInfo();
        }
    }, [loadModelInfo]);

    const handleModelLoad = useCallback((scene) => {
        if (modelRef.current) {
            // Initialize layer system after model loads
            setTimeout(() => {
                initializeLayers(modelRef.current);
            }, 100);
        }
    }, [initializeLayers]);

    // Handle object click
    const handleObjectClick = useCallback((objectName, clickedObject) => {
        console.log('Object clicked:', objectName, clickedObject);
        
        // Show toast with object name
        setToast({
            message: `Clicked: ${objectName}`,
            isVisible: true
        });
    }, []);

    // Hide toast
    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
    }, []);

    // Screenshot functionality
    const handleScreenshot = useCallback(async () => {
        try {
            const canvas = canvasRef.current?.querySelector('canvas');
            if (!canvas) {
                throw new Error('Canvas not found');
            }

            // Use html2canvas to capture the entire viewer area
            const screenshot = await html2canvas(canvasRef.current, {
                backgroundColor: null,
                allowTaint: true,
                useCORS: true,
                scale: 1
            });
            
            return screenshot.toDataURL('image/png');
        } catch (error) {
            console.error('Screenshot failed:', error);
            return null;
        }
    }, []);

    const handleOpenAI = useCallback(() => {
        if (setIsAIOpen) {
            setIsAIOpen(true);
        }
    }, [setIsAIOpen]);

    return (
        <div ref={canvasRef} className="dark-theme" style={{ 
            width: '100vw', 
            height: '100vh', 
            background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #000000 70%, #000000 100%)', 
            position: 'relative' 
        }}>
            <Canvas 
                camera={{ position: [0, 20, 40], fov: 60 }} 
                shadows
                gl={{ 
                    antialias: true, 
                    alpha: true,
                    powerPreference: "high-performance",
                    preserveDrawingBuffer: true,
                    failIfMajorPerformanceCaveat: false
                }}
                onCreated={({ gl }) => {
                    // Handle WebGL context loss
                    gl.domElement.addEventListener('webglcontextlost', (event) => {
                        console.warn('WebGL context lost, preventing default behavior');
                        event.preventDefault();
                    }, false);

                    gl.domElement.addEventListener('webglcontextrestored', (event) => {
                        console.log('WebGL context restored');
                        // Context will be automatically restored by Three.js
                    }, false);
                }}
            >
                {/* Enhanced lighting for maximum model visibility */}
                <ambientLight intensity={0.8} color="#ffffff" />
                <directionalLight 
                    position={[10, 10, 5]} 
                    intensity={1.5} 
                    castShadow 
                    color="#ffffff"
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <directionalLight 
                    position={[-10, 10, 5]} 
                    intensity={1.2} 
                    color="#ffffff"
                />
                <directionalLight 
                    position={[0, -10, 5]} 
                    intensity={1.0} 
                    color="#ffffff"
                />
                <directionalLight 
                    position={[0, 0, -10]} 
                    intensity={1.0} 
                    color="#ffffff"
                />
                {/* Multiple point lights for comprehensive illumination */}
                <pointLight 
                    position={[0, 5, 10]} 
                    intensity={1.5} 
                    color="#ffffff"
                    distance={50}
                    decay={1}
                />
                <pointLight 
                    position={[10, 0, 0]} 
                    intensity={1.2} 
                    color="#ffffff"
                    distance={40}
                    decay={1}
                />
                <pointLight 
                    position={[-10, 0, 0]} 
                    intensity={1.2} 
                    color="#ffffff"
                    distance={40}
                    decay={1}
                />
                <pointLight 
                    position={[0, -5, 0]} 
                    intensity={1.0} 
                    color="#ffffff"
                    distance={40}
                    decay={1}
                />
                <Suspense fallback={null}>
                    <InteractiveModelPrimitive 
                        ref={modelRef}
                        url={url} 
                        type={type} 
                        onModelLoad={handleModelLoad}
                        onObjectClick={handleObjectClick}
                    />
                </Suspense>
                <OrbitControls enableDamping dampingFactor={0.1} />
                <Environment preset="night" background={false} />
                <AnimationController updateAnimation={updateAnimation} />
            </Canvas>
            
            <DisassemblyUI 
                currentLayer={currentLayer}
                totalLayers={totalLayers}
                isAnimating={isAnimating}
                onOpenAI={handleOpenAI}
            />

            {isAIOpen && closeAI && (
                <Three21Bot
                    isOpen={isAIOpen}
                    onClose={closeAI}
                    modelInfo={modelInfo}
                    selectedPart={selectedPart}
                    onScreenshot={handleScreenshot}
                />
            )}

            <Toast 
                message={toast.message}
                isVisible={toast.isVisible}
                onHide={hideToast}
            />
        </div>
    );
}
