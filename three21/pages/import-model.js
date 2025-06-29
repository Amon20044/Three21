import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { set as idbSet } from 'idb-keyval';
import { ModelInfoCollector } from '../components/ModelInfoCollector';
import { useModelInfo } from '../components/ModelInfoContext';

export default function ImportModelPage() {
    const fileInputRef = useRef();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showInfoCollector, setShowInfoCollector] = useState(false);
    const router = useRouter();
    
    // Use optional chaining to prevent error if context not available
    const modelInfoContext = useModelInfo();
    const { saveModelInfo } = modelInfoContext || {};

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.glb') || file.name.endsWith('.fbx'))) {
            setSelectedFile(file);
            setShowInfoCollector(true);
        }
    };

    const handleModelInfoSubmit = async (modelInfo) => {
        setLoading(true);
        try {
            const type = selectedFile.name.endsWith('.fbx') ? 'fbx' : 'glb';
            
            // Save file to IndexedDB
            await idbSet('lastModelFile', selectedFile);
            await idbSet('lastModelType', type);
            
            // Save model info if context is available
            if (saveModelInfo) {
                await saveModelInfo({
                    ...modelInfo,
                    filename: selectedFile.name,
                    type,
                    fileSize: selectedFile.size
                });
            }
            
            // Navigate to model viewer
            router.push(`/model?type=${type}`);
        } catch (error) {
            console.error('Failed to save model:', error);
            setLoading(false);
        }
    };

    const handleSkipInfo = async (basicInfo) => {
        setLoading(true);
        try {
            const type = selectedFile.name.endsWith('.fbx') ? 'fbx' : 'glb';
            
            await idbSet('lastModelFile', selectedFile);
            await idbSet('lastModelType', type);
            
            if (saveModelInfo) {
                await saveModelInfo({
                    ...basicInfo,
                    filename: selectedFile.name,
                    type,
                    fileSize: selectedFile.size
                });
            }
            
            router.push(`/model?type=${type}`);
        } catch (error) {
            console.error('Failed to save model:', error);
            setLoading(false);
        }
    };

    return (
        <>
            {showInfoCollector && selectedFile && (
                <ModelInfoCollector
                    fileName={selectedFile.name}
                    fileType={selectedFile.name.endsWith('.fbx') ? 'fbx' : 'glb'}
                    onSubmit={handleModelInfoSubmit}
                    onSkip={handleSkipInfo}
                    isLoading={loading}
                />
            )}
            
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                }}
            >
                {loading ? (
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.12)',
                            borderRadius: '20px',
                            padding: '48px 40px',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <div className="loader" style={{ marginBottom: 18 }}>
                            <svg width="48" height="48" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20" stroke="#00ffd0" strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset="60">
                                    <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite" />
                                </circle>
                            </svg>
                        </div>
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.2rem', letterSpacing: '1px' }}>
                            Processing your model...
                        </span>
                    </div>
                ) : (
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            padding: '40px 32px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: '320px',
                        }}
                    >
                        <h1
                            style={{
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '2.2rem',
                                marginBottom: '18px',
                                letterSpacing: '1px',
                                textShadow: '0 2px 8px rgba(30,60,114,0.2)',
                            }}
                        >
                            Import your <span style={{ color: '#00ffd0' }}>.glb/.fbx</span> model
                        </h1>
                        
                        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <p style={{ color: '#00ffd0', fontSize: '1.1rem', margin: '0 0 8px 0', fontWeight: 600 }}>
                                🤖 Three21Bot AI Analysis Ready
                            </p>
                            <p style={{ color: '#ccd6f6', fontSize: '0.9rem', margin: 0, opacity: 0.8 }}>
                                Get intelligent insights and reverse engineering analysis
                            </p>
                        </div>
                        
                        <label
                            htmlFor="model-upload"
                            style={{
                                display: 'inline-block',
                                padding: '14px 32px',
                                background: 'linear-gradient(90deg, #00ffd0 0%, #2a5298 100%)',
                                color: '#1e3c72',
                                fontWeight: 600,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                marginBottom: '12px',
                                boxShadow: '0 2px 12px 0 rgba(0,255,208,0.15)',
                                transition: 'background 0.2s',
                            }}
                        >
                            Choose .glb or .fbx File
                            <input
                                id="model-upload"
                                type="file"
                                accept=".glb,.fbx"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </label>
                        <p style={{ color: '#fff', opacity: 0.8, fontSize: '1rem', marginTop: 0 }}>
                            Only .glb or .fbx files are supported
                        </p>
                    </div>
                )}
                <footer style={{ position: 'fixed', bottom: 18, color: '#fff', opacity: 0.5, fontSize: '0.95rem' }}>
                    Powered by <span style={{ color: '#00ffd0' }}>Three.js</span> & <span style={{ color: '#00ffd0' }}>AI SDK</span>
                </footer>
            </div>
        </>
    );
}
