import { createContext, useContext, useState, useCallback } from 'react';
import { set as idbSet, get as idbGet } from 'idb-keyval';

const ModelInfoContext = createContext();

export const useModelInfo = () => {
    const context = useContext(ModelInfoContext);
    if (!context) {
        console.warn('useModelInfo used outside ModelInfoProvider, returning null');
        return null;
    }
    return context;
};

export function ModelInfoProvider({ children }) {
    const [modelInfo, setModelInfo] = useState(null);
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);

    // Save model info to IndexedDB and state
    const saveModelInfo = useCallback(async (info) => {
        const modelData = {
            ...info,
            uploadTime: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        await idbSet('currentModelInfo', modelData);
        setModelInfo(modelData);
        return modelData;
    }, []);

    // Load model info from IndexedDB
    const loadModelInfo = useCallback(async () => {
        try {
            const savedInfo = await idbGet('currentModelInfo');
            if (savedInfo) {
                setModelInfo(savedInfo);
                return savedInfo;
            }
        } catch (error) {
            console.error('Failed to load model info:', error);
        }
        return null;
    }, []);

    // Generate AI analysis of the model
    const generateModelAnalysis = useCallback(async (screenshot, modelData) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: 'Provide a comprehensive analysis of this 3D model. Include component identification, likely purpose, engineering insights, and reverse engineering observations.'
                    }],
                    modelInfo: modelData,
                    screenshot: screenshot
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate analysis');
            }

            const data = await response.json();
            return data.content;
        } catch (error) {
            console.error('AI analysis failed:', error);
            return null;
        }
    }, []);

    // Update model info with AI analysis
    const updateModelAnalysis = useCallback(async (analysis) => {
        if (!modelInfo) return;

        const updatedInfo = {
            ...modelInfo,
            aiAnalysis: analysis,
            analysisTime: new Date().toISOString()
        };

        await idbSet('currentModelInfo', updatedInfo);
        setModelInfo(updatedInfo);
    }, [modelInfo]);

    // Open AI chat with specific part selected
    const openAIForPart = useCallback((partName) => {
        setSelectedPart(partName);
        setIsAIOpen(true);
    }, []);

    // Close AI chat
    const closeAI = useCallback(() => {
        setIsAIOpen(false);
        setSelectedPart(null);
    }, []);

    const value = {
        modelInfo,
        isAIOpen,
        selectedPart,
        saveModelInfo,
        loadModelInfo,
        generateModelAnalysis,
        updateModelAnalysis,
        openAIForPart,
        closeAI,
        setIsAIOpen,
        setSelectedPart
    };

    return (
        <ModelInfoContext.Provider value={value}>
            {children}
        </ModelInfoContext.Provider>
    );
}
