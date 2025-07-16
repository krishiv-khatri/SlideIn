import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Function to analyze URL and generate context using AI
async function analyzeUrlWithAI(url: string, goal: string): Promise<{
  context: string;
  contactName: string;
}> {
  const prompt = `
    Analyze this URL and provide insights for email outreach:
    URL: ${url}
    Goal: ${goal}
    
    Based on the URL structure, domain, and path, provide:
    1. What type of organization/person this likely represents
    2. Appropriate contact name/title for the context
    3. Relevant context for the goal: ${goal}
    
    Return JSON format:
    {
      "context": "Brief description of what this URL represents and relevant context",
      "contactName": "Appropriate contact name or title"
    }
  `;
  
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    
    const responseText = result.text?.trim() || '';
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    
    return {
      context: parsed.context || `Information related to ${url}`,
      contactName: parsed.contactName || 'Contact'
    };
  } catch (error) {
    console.error('Error analyzing URL with AI:', error);
    
    // Fallback based on URL patterns
    const urlLower = url.toLowerCase();
    let contactName = 'Contact';
    let context = `Information found at ${url}`;
    
    if (urlLower.includes('.edu') || urlLower.includes('faculty') || urlLower.includes('professor')) {
      contactName = 'Professor';
      context = 'Academic or research-related information';
    } else if (urlLower.includes('job') || urlLower.includes('career')) {
      contactName = 'Hiring Manager';
      context = 'Job posting or career opportunity';
    } else if (urlLower.includes('company') || urlLower.includes('about')) {
      contactName = 'Team';
      context = 'Company or organization information';
    }
    
    return { context, contactName };
  }
}

// Function to format email response
function formatEmailResponse(text: string): { subject: string; body: string } {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Try to extract subject line
  let subject = '';
  let bodyLines: string[] = [];
  let foundSubject = false;
  
  for (const line of lines) {
    if (!foundSubject && (line.toLowerCase().includes('subject:') || line.trim().length < 100)) {
      subject = line.replace(/subject:\s*/i, '').trim();
      foundSubject = true;
    } else {
      bodyLines.push(line);
    }
  }
  
  // If no clear subject found, generate one
  if (!subject) {
    subject = 'Exploring Collaboration Opportunities';
  }
  
  const body = bodyLines.join('\n\n');
  return { subject, body };
}

export async function POST(request: Request) {
  try {
    const { url, goal, tone, yourName } = await request.json();

    // Validate required fields
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    console.log('Analyzing URL with AI...');
    
    // Use AI to analyze the URL and generate context
    const { context, contactName } = await analyzeUrlWithAI(url, goal || 'collaboration');

    console.log('Generating email with AI...');
    
    // Generate email using AI with the analyzed context
    const emailPrompt = `
      Generate a personalized cold email based on this information:
      
      - Sender: ${yourName || 'a professional'}
      - Recipient: ${contactName}
      - Goal: ${goal || 'collaboration'}
      - Tone: ${tone || 'professional'}
      - Context: ${context}
      - URL Reference: ${url}
      
      Requirements:
      - Write a natural, human email (not a template)
      - Keep it concise (4-6 sentences)
      - Show genuine interest based on the context
      - Include a clear but low-pressure call to action
      - Use appropriate greeting and sign-off
      - Address the recipient as ${contactName}
      
      Format the response as a complete email with subject and body.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: emailPrompt
    });
    
    const emailText = result.text || '';
    const { subject, body } = formatEmailResponse(emailText);

    return NextResponse.json({
      subject,
      body,
      contactName
    });
  } catch (error: unknown) {
    console.error('Error processing request:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the email' },
      { status: 500 }
    );
  }
} 