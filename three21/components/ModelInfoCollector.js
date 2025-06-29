import { useState } from 'react';

export function ModelInfoCollector({ 
    fileName, 
    fileType, 
    onSubmit, 
    onSkip,
    isLoading 
}) {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [purpose, setPurpose] = useState('');
    const [complexity, setComplexity] = useState('medium');
    const [tags, setTags] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const modelInfo = {
            filename: fileName,
            type: fileType,
            description: description.trim(),
            category: category.trim(),
            purpose: purpose.trim(),
            complexity,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            userProvided: true
        };
        onSubmit(modelInfo);
    };

    const handleSkip = () => {
        const basicInfo = {
            filename: fileName,
            type: fileType,
            userProvided: false
        };
        onSkip(basicInfo);
    };

    const categories = [
        'Mechanical Parts', 'Electronics', 'Automotive', 'Architecture', 
        'Furniture', 'Tools', 'Toys', 'Medical', 'Aerospace', 'Other'
    ];

    const purposes = [
        'Prototyping', 'Analysis', 'Reverse Engineering', 'Education', 
        'Manufacturing', 'Visualization', 'Documentation', 'Other'
    ];

    return (
        <div className="model-info-collector">
            <div className="collector-container">
                <div className="collector-header">
                    <h2>📋 Tell us about your model</h2>
                    <p>Help Three21Bot understand your model better for AI-powered analysis</p>
                </div>

                <div className="file-preview">
                    <div className="file-icon">
                        📄
                    </div>
                    <div className="file-details">
                        <h3>{fileName}</h3>
                        <span className="file-type">{fileType.toUpperCase()} File</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="info-form">
                    <div className="form-group">
                        <label>Model Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this model represents (e.g., 'Engine block for a V8 motor', 'Smartphone housing design', etc.)"
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="">Select category...</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Purpose</label>
                            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                                <option value="">Select purpose...</option>
                                {purposes.map(purp => (
                                    <option key={purp} value={purp}>{purp}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Complexity Level</label>
                        <div className="complexity-selector">
                            {[
                                { value: 'simple', label: '🟢 Simple', desc: 'Basic shapes, few parts' },
                                { value: 'medium', label: '🟡 Medium', desc: 'Multiple components' },
                                { value: 'complex', label: '🔴 Complex', desc: 'Highly detailed, many parts' }
                            ].map(({ value, label, desc }) => (
                                <label key={value} className={`complexity-option ${complexity === value ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        value={value}
                                        checked={complexity === value}
                                        onChange={(e) => setComplexity(e.target.value)}
                                    />
                                    <div className="complexity-content">
                                        <span className="complexity-label">{label}</span>
                                        <span className="complexity-desc">{desc}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tags (optional)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="mechanical, automotive, engine (comma-separated)"
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={handleSkip}
                            className="skip-button"
                            disabled={isLoading}
                        >
                            Skip for now
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? '⏳ Processing...' : '🚀 Continue with AI Analysis'}
                        </button>
                    </div>
                </form>

                <div className="ai-features">
                    <h4>🤖 What Three21Bot will help you with:</h4>
                    <ul>
                        <li>🔍 Identify individual components and their functions</li>
                        <li>⚙️ Explain assembly mechanisms and connections</li>
                        <li>🛠️ Provide reverse engineering insights</li>
                        <li>📐 Analyze materials and manufacturing methods</li>
                        <li>🎯 Answer questions about specific parts</li>
                    </ul>
                </div>
            </div>

            <style jsx>{`
                .model-info-collector {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 1000;
                }

                .collector-container {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .collector-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .collector-header h2 {
                    color: #00ffd0;
                    font-size: 28px;
                    margin: 0 0 10px 0;
                    font-weight: 700;
                }

                .collector-header p {
                    color: #ccd6f6;
                    font-size: 16px;
                    margin: 0;
                    opacity: 0.8;
                }

                .file-preview {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: rgba(0, 255, 208, 0.1);
                    border: 1px solid rgba(0, 255, 208, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 30px;
                }

                .file-icon {
                    font-size: 32px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #00ffd0 0%, #2a5298 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .file-details h3 {
                    color: #00ffd0;
                    margin: 0 0 5px 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .file-type {
                    color: #8892b0;
                    font-size: 14px;
                    font-weight: 500;
                }

                .info-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .form-group label {
                    color: #ccd6f6;
                    font-weight: 600;
                    font-size: 14px;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 12px 16px;
                    color: #ccd6f6;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    border-color: #00ffd0;
                    box-shadow: 0 0 0 2px rgba(0, 255, 208, 0.2);
                }

                .form-group input::placeholder,
                .form-group textarea::placeholder {
                    color: #8892b0;
                }

                .complexity-selector {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .complexity-option {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .complexity-option:hover,
                .complexity-option.selected {
                    border-color: #00ffd0;
                    background: rgba(0, 255, 208, 0.1);
                }

                .complexity-option input[type="radio"] {
                    margin: 0;
                    accent-color: #00ffd0;
                }

                .complexity-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .complexity-label {
                    color: #ccd6f6;
                    font-weight: 600;
                    font-size: 14px;
                }

                .complexity-desc {
                    color: #8892b0;
                    font-size: 12px;
                }

                .form-actions {
                    display: flex;
                    gap: 16px;
                    margin-top: 20px;
                }

                .skip-button,
                .submit-button {
                    flex: 1;
                    padding: 14px 24px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    outline: none;
                }

                .skip-button {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: #ccd6f6;
                }

                .skip-button:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.15);
                }

                .submit-button {
                    background: linear-gradient(90deg, #00ffd0 0%, #2a5298 100%);
                    color: #1e3c72;
                }

                .submit-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0, 255, 208, 0.3);
                }

                .skip-button:disabled,
                .submit-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .ai-features {
                    margin-top: 30px;
                    padding: 20px;
                    background: rgba(0, 255, 208, 0.05);
                    border: 1px solid rgba(0, 255, 208, 0.2);
                    border-radius: 12px;
                }

                .ai-features h4 {
                    color: #00ffd0;
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .ai-features ul {
                    margin: 0;
                    padding-left: 0;
                    list-style: none;
                }

                .ai-features li {
                    color: #ccd6f6;
                    margin: 8px 0;
                    font-size: 14px;
                    line-height: 1.5;
                }

                /* Scrollbar Styles */
                .collector-container::-webkit-scrollbar {
                    width: 6px;
                }

                .collector-container::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }

                .collector-container::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 208, 0.3);
                    border-radius: 3px;
                }

                @media (max-width: 768px) {
                    .collector-container {
                        padding: 20px;
                        margin: 10px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .collector-header h2 {
                        font-size: 24px;
                    }
                }
            `}</style>
        </div>
    );
}
