import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';

function ModelPrimitive({ url, type }) {
    // Use the correct loader based on file type
    const object = useLoader(type === 'fbx' ? FBXLoader : GLTFLoader, url);
    // For GLTF, the scene is under .scene; for FBX, the object is the scene
    const scene = type === 'fbx' ? object : object.scene;
    return <primitive object={scene} />;
}

export default function AnyModelViewer({ url, type }) {
    return (
        <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
            <Canvas camera={{ position: [0, 1.5, 3], fov: 60 }} shadows>
                <Html center>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow />
                    <Suspense fallback={null}>
                        <ModelPrimitive url={url} type={type} />
                    </Suspense>
                    <OrbitControls enableDamping dampingFactor={0.1} />
                    <Environment preset="sunset" background={false} />
                </Html>
            </Canvas>
        </div>
    );
}
