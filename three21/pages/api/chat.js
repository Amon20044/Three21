import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are Three21Bot, an expert AI assistant specialized in 3D model analysis and reverse engineering. Your expertise includes:

🔧 **3D Model Analysis**: Identify components, materials, assembly methods, and design patterns
🛠️ **Reverse Engineering**: Break down complex models into understandable parts and systems
📐 **Engineering Insights**: Provide technical explanations about mechanical systems, electronics, and design principles
🎯 **Part Identification**: Help users understand what specific components do and how they work
⚙️ **Assembly Logic**: Explain how parts connect and function together

**Guidelines:**
- Always provide detailed, technical yet accessible explanations
- Focus on practical engineering insights
- When analyzing model screenshots, describe visible components, their likely functions, and engineering principles
- For part-specific questions, explain the component's role in the overall system
- Include reverse engineering tips and methodologies
- Use engineering terminology appropriately but explain complex concepts
- Suggest improvements or design alternatives when relevant

**Response Style:**
- Be comprehensive but organized with clear sections
- Use technical emojis and formatting for better readability
- Provide actionable insights for reverse engineering
- Include material estimations and manufacturing insights when possible`;

export async function POST(req) {
    try {
        const { messages, modelInfo, selectedPart, screenshot } = await req.json();

        // Build context from model info
        let contextPrompt = SYSTEM_PROMPT;
        
        if (modelInfo) {
            contextPrompt += `\n\n**Current Model Context:**`;
            
            // Demo mode specific context
            if (modelInfo.isDemoMode && modelInfo.demoInfo) {
                contextPrompt += `
- **Demo Model**: ${modelInfo.demoInfo.name}
- **Model Type**: ${modelInfo.demoInfo.type}
- **Description**: ${modelInfo.demoInfo.description}
- **Mode**: Interactive Demo - All component names and structure available`;
            } else {
                contextPrompt += `
- **Model Name**: ${modelInfo.filename || 'Unknown'}
- **File Type**: ${modelInfo.type || 'Unknown'}
- **Description**: ${modelInfo.description || 'No description provided'}
- **Upload Time**: ${modelInfo.uploadTime || 'Unknown'}`;
            }
        }

        // Add model structure information for better AI responses
        if (modelInfo?.modelStructure) {
            const structure = modelInfo.modelStructure;
            contextPrompt += `\n\n**Model Structure Reference:**
- **Total Components**: ${structure.components?.length || 0}
- **Component Names**: ${structure.components?.map(c => c.name).filter(Boolean).join(', ') || 'None identified'}
- **Hierarchy**: Available for detailed component analysis`;
            
            if (structure.components && structure.components.length > 0) {
                contextPrompt += `\n- **Key Components**: ${structure.components.slice(0, 10).map(c => 
                    `${c.name} (${c.type || 'Unknown type'})`
                ).join(', ')}`;
            }
        }

        // Selected part context with enhanced details
        if (selectedPart || modelInfo?.selectedPart) {
            const partInfo = selectedPart || modelInfo.selectedPart;
            contextPrompt += `\n\n**Selected Part Focus**: ${typeof partInfo === 'object' ? partInfo.name : partInfo}`;
            
            if (typeof partInfo === 'object') {
                contextPrompt += `
- **Part Type**: ${partInfo.type || 'Unknown'}
- **Material**: ${partInfo.material || 'Unknown'}
- **Geometry**: ${partInfo.geometry || 'Unknown'}`;
                
                if (partInfo.position) {
                    contextPrompt += `
- **Position**: [${partInfo.position.join(', ')}]`;
                }
                
                if (partInfo.path) {
                    contextPrompt += `
- **Hierarchy Path**: ${partInfo.path}`;
                }
            }
            
            contextPrompt += `\nFocus your analysis specifically on this component and its role in the overall system.`;
        }

        if (screenshot) {
            contextPrompt += `\n\n**Visual Analysis**: A screenshot of the current model view has been provided. Analyze the visible components, their arrangement, and engineering details.`;
        }

        // Prepare messages with context
        const contextualMessages = [
            { role: 'system', content: contextPrompt },
            ...messages
        ];

        // Add screenshot to the last user message if provided
        if (screenshot && contextualMessages.length > 0) {
            const lastMessage = contextualMessages[contextualMessages.length - 1];
            if (lastMessage.role === 'user') {
                lastMessage.content = [
                    { type: 'text', text: lastMessage.content },
                    { 
                        type: 'image', 
                        image: screenshot.replace(/^data:image\/[a-z]+;base64,/, ''),
                    }
                ];
            }
        }

        const result = await generateText({
            model: google('gemini-2.0-flash-exp'),
            messages: contextualMessages,
            maxTokens: 2000,
            temperature: 0.7,
        });

        return new Response(JSON.stringify({ content: result.text }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('AI API Error:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Failed to generate AI response',
                details: error.message 
            }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Default export for Next.js API route compatibility
export default POST;
