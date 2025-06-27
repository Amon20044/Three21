import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { get as idbGet } from 'idb-keyval';

const AnyModelViewer = dynamic(() => import('../components/AnyModelViewer'), { ssr: false });

export default function ModelPage() {
    const router = useRouter();
    const [fileUrl, setFileUrl] = useState(null);
    const [type, setType] = useState(null);

    useEffect(() => {
        // Try to get file from query, else from IndexedDB
        async function loadModel() {
            const file = await idbGet('lastModelFile');
            const t = await idbGet('lastModelType');
            if (file && t) {
                setType(t);
                setFileUrl(URL.createObjectURL(file));
            } else if (router.isReady) {
                const url = router.query.file;
                if (url) {
                    setFileUrl(url);
                    localStorage.setItem('lastModelUrl', url);
                } else {
                    const last = localStorage.getItem('lastModelUrl');
                    if (last) setFileUrl(last);
                }
            }
        }
        loadModel();
    }, [router.isReady, router.query.file]);

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
                <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: 12 }}>No model uploaded</h2>
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
            </div>
        );
    }

    return <AnyModelViewer url={fileUrl} type={type} />;
}