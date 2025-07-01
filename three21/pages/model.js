import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { get as idbGet } from 'idb-keyval';
import { ModelInfoProvider } from '../components/ModelInfoContext';
import ModelErrorBoundary from '../components/ModelErrorBoundary';

const AnyModelViewer = dynamic(() => import('../components/AnyModelViewer'), { ssr: false });

// Demo model configuration
const DEMO_CONFIG = {
    url: '/demo.fbx',
    type: 'fbx',
    description: `This 330x380 mm modular firebox assembly is a precision-engineered, high-temperature enclosure designed for thermal experimentation and monitoring applications. The robust outer housing is built to withstand intense heat, while the inner chamber is insulated with refractory materials to ensure thermal containment and efficiency. Key components include integrated temperature or pressure meters (yellow-black cubes), high-intensity heating or indicator lamps (gray cylinders), and a rotary head assembly for adjustable operation or sensor interfacing. A translucent high-temperature glass window allows safe visual inspection of internal processes. The modular design, visible in the exploded view, supports ease of maintenance, part replacement, and component upgrades—making this unit ideal for research labs, industrial testing environments, and controlled combustion setups requiring both performance and flexibility.`,
    name: '330x380mm Modular Firebox Assembly'
};

export default function ModelPage() {
    const router = useRouter();
    const [fileUrl, setFileUrl] = useState(null);
    const [type, setType] = useState(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [demoConfig, setDemoConfig] = useState(null);

    useEffect(() => {
        async function loadModel() {
            // Check if demo mode is requested
            if (router.isReady && router.query.type === 'demo') {
                setIsDemoMode(true);
                setDemoConfig(DEMO_CONFIG);
                setFileUrl(DEMO_CONFIG.url);
                setType(DEMO_CONFIG.type);
                return;
            }

            // Regular model loading logic
            const file = await idbGet('lastModelFile');
            const t = await idbGet('lastModelType');
            if (file && t) {
                setType(t);
                setFileUrl(URL.createObjectURL(file));
            } else if (router.isReady) {
                const url = router.query.file;
                const queryType = router.query.type;
                if (url) {
                    setFileUrl(url);
                    // Determine type from URL extension or query parameter
                    const detectedType = queryType || (url.toLowerCase().includes('.fbx') ? 'fbx' : 'gltf');
                    setType(detectedType);
                    localStorage.setItem('lastModelUrl', url);
                    localStorage.setItem('lastModelType', detectedType);
                } else {
                    const lastUrl = localStorage.getItem('lastModelUrl');
                    const lastType = localStorage.getItem('lastModelType');
                    if (lastUrl && lastType) {
                        setFileUrl(lastUrl);
                        setType(lastType);
                    }
                }
            }
        }
        loadModel();
    }, [router.isReady, router.query.file, router.query.type]);

    if (!fileUrl || !type) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            }}>
                <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: 12 }}>
                    {isDemoMode ? 'Loading Demo Model...' : 'No model uploaded'}
                </h2>
                {!isDemoMode && (
                    <a href="/import-model" style={{
                        padding: '12px 28px',
                        background: 'linear-gradient(90deg, #00ffd0 0%, #2a5298 100%)',
                        color: '#1e3c72',
                        fontWeight: 600,
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        textDecoration: 'none',
                        boxShadow: '0 2px 12px 0 rgba(0,255,208,0.15)',
                        transition: 'background 0.2s',
                    }}>Go to Import Page</a>
                )}
            </div>
        );
    }

    return (
        <ModelErrorBoundary>
            <ModelInfoProvider demoConfig={isDemoMode ? demoConfig : null}>
                <AnyModelViewer 
                    url={fileUrl} 
                    type={type} 
                    isDemoMode={isDemoMode}
                    demoConfig={demoConfig}
                />
            </ModelInfoProvider>
        </ModelErrorBoundary>
    );
}