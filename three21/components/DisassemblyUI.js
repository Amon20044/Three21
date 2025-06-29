import { useState, useEffect } from 'react';

export function DisassemblyUI({ currentLayer, totalLayers, isAnimating, onOpenAI }) {
    const [showInstructions, setShowInstructions] = useState(true);

    useEffect(() => {
        // Auto-hide instructions after 5 seconds
        const timer = setTimeout(() => {
            setShowInstructions(false);
        }, 8000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {/* Instructions Overlay */}
            {showInstructions && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    zIndex: 1000,
                    maxWidth: '300px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 255, 208, 0.3)'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#00ffd0' }}>🔧 Disassembly Controls</h3>
                    <div style={{ lineHeight: '1.6' }}>
                        <div><strong>E Key:</strong> Disassemble next layer</div>
                        <div><strong>Q Key:</strong> Reassemble previous layer</div>
                        <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
                            Model will disassemble layer by layer outward from each parent's center
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowInstructions(false)}
                        style={{
                            marginTop: '15px',
                            background: 'rgba(0, 255, 208, 0.2)',
                            border: '1px solid #00ffd0',
                            color: '#00ffd0',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Hide Instructions
                    </button>
                </div>
            )}

            {/* AI Assistant Button */}
            <button
                onClick={onOpenAI}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #00ffd0 0%, #2a5298 100%)',
                    border: 'none',
                    color: '#1e3c72',
                    padding: '12px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    zIndex: 1000,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0, 255, 208, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
                onMouseOver={(e) => {
                    e.target.style.transform = 'translateX(-50%) translateY(-2px) scale(1.05)';
                    e.target.style.boxShadow = '0 6px 25px rgba(0, 255, 208, 0.4)';
                }}
                onMouseOut={(e) => {
                    e.target.style.transform = 'translateX(-50%) translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 20px rgba(0, 255, 208, 0.3)';
                }}
            >
                🤖 Three21Bot AI
            </button>

            {/* Status Indicator */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                padding: '15px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px',
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#00ffd0' }}>Status:</span> {
                        isAnimating ? '🔄 Animating...' : '⚡ Ready'
                    }
                </div>
                <div>
                    <span style={{ color: '#00ffd0' }}>Layer:</span> {currentLayer} / {totalLayers}
                </div>
                {totalLayers > 0 && (
                    <div style={{ 
                        marginTop: '8px', 
                        width: '100px', 
                        height: '4px', 
                        background: 'rgba(255,255,255,0.2)', 
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${(currentLayer / totalLayers) * 100}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #00ffd0, #2a5298)',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                )}
            </div>

            {/* Show/Hide Instructions Button */}
            {!showInstructions && (
                <button
                    onClick={() => setShowInstructions(true)}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        background: 'rgba(0, 255, 208, 0.8)',
                        border: 'none',
                        color: '#1e3c72',
                        padding: '10px 15px',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        zIndex: 1000,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 12px rgba(0, 255, 208, 0.3)'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = '#00ffd0';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'rgba(0, 255, 208, 0.8)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    ? Show Controls
                </button>
            )}
        </>
    );
}
