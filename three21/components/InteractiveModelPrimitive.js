import { useRef, useEffect, forwardRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export const InteractiveModelPrimitive = forwardRef(({ url, type, onModelLoad }, ref) => {
    // Load the model
    const object = useLoader(type === 'fbx' ? FBXLoader : GLTFLoader, url);
    const scene = type === 'fbx' ? object : object.scene;
    
    // Notify parent when model is loaded
    useEffect(() => {
        if (scene && onModelLoad) {
            onModelLoad(scene);
        }
    }, [scene, onModelLoad]);
    
    return <primitive ref={ref} object={scene} />;
});
