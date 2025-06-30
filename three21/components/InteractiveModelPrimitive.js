import { useRef, useEffect, forwardRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

export const InteractiveModelPrimitive = forwardRef(({ url, type, onModelLoad }, ref) => {
    // Load the model
    const object = useLoader(type === 'fbx' ? FBXLoader : GLTFLoader, url);
    const scene = type === 'fbx' ? object : object.scene;
    
    // Simple lighting setup to make model visible
    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh) {
                    // Store original material for reference
                    if (!child.userData.originalMaterial) {
                        child.userData.originalMaterial = child.material.clone();
                    }
                    
                    // Keep the original material completely unchanged
                    child.material = child.userData.originalMaterial.clone();
                    
                    // No additional effects - just preserve original material
                }
            });
        }
    }, [scene]);
    
    // No dynamic lighting effects needed - using global scene lighting only
    // Model will be visible through the global lighting setup in AnyModelViewer
    
    // Notify parent when model is loaded
    useEffect(() => {
        if (scene && onModelLoad) {
            onModelLoad(scene);
        }
    }, [scene, onModelLoad]);
    
    return <primitive ref={ref} object={scene} />;
});

InteractiveModelPrimitive.displayName = 'InteractiveModelPrimitive';
