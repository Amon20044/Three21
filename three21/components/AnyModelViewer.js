import { Suspense, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { InteractiveModelPrimitive } from './InteractiveModelPrimitive';
import { DisassemblyUI } from './DisassemblyUI';
import { useLayerManager } from './LayerManager';
import { AnimationController } from './AnimationController';
import { Three21Bot } from './Three21Bot';
import { useModelInfo } from './ModelInfoContext';
import html2canvas from 'html2canvas';

export default function AnyModelViewer({ url, type }) {
    const modelRef = useRef();
    const canvasRef = useRef();
    const { initializeLayers, currentLayer, isAnimating, totalLayers, updateAnimation } = useLayerManager(modelRef);
    
    // Use optional chaining to prevent context errors
    const modelInfoContext = useModelInfo();
    const { 
        modelInfo, 
        isAIOpen, 
        selectedPart, 
        closeAI, 
        setIsAIOpen, 
        loadModelInfo 
    } = modelInfoContext || {
        modelInfo: null,
        isAIOpen: false,
        selectedPart: null,
        closeAI: () => {},
        setIsAIOpen: () => {},
        loadModelInfo: () => Promise.resolve()
    };
    
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
        setIsAIOpen(true);
    }, [setIsAIOpen]);

    return (
        <div ref={canvasRef} style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', position: 'relative' }}>
            <Canvas camera={{ position: [0, 1.5, 3], fov: 60 }} shadows>
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow />
                <Suspense fallback={null}>
                    <InteractiveModelPrimitive 
                        ref={modelRef}
                        url={url} 
                        type={type} 
                        onModelLoad={handleModelLoad}
                    />
                </Suspense>
                <OrbitControls enableDamping dampingFactor={0.1} />
                <Environment preset="sunset" background={false} />
                <AnimationController updateAnimation={updateAnimation} />
            </Canvas>
            
            <DisassemblyUI 
                currentLayer={currentLayer}
                totalLayers={totalLayers}
                isAnimating={isAnimating}
                onOpenAI={handleOpenAI}
            />

            {isAIOpen && (
                <Three21Bot
                    isOpen={isAIOpen}
                    onClose={closeAI}
                    modelInfo={modelInfo}
                    selectedPart={selectedPart}
                    onScreenshot={handleScreenshot}
                />
            )}
        </div>
    );
}
