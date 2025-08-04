import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Initialize Gemini client with validation
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  throw new Error('GEMINI_API_KEY is not configured');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Maximum content length to send to Gemini (in characters)
const MAX_CONTENT_LENGTH = 10000;

// Common navigation/footer class patterns to ignore
const IGNORE_CLASS_PATTERNS = [
  'nav', 'footer', 'sidebar', 'menu', 'header', 'banner',
  'cookie', 'privacy', 'terms', 'social', 'share', 'copyright'
];

// Name extraction patterns
const NAME_PATTERNS = [
  // Title + Name patterns
  /Dr\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Professor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Prof\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Professor\s+Dr\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Dr\.\s+Professor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  
  // Name + Title patterns
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s+Ph\.?D\.?/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+Ph\.?D\.?/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s+Professor/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s+(?:Assistant|Associate|Full)\s+Professor/i,
  
  // Name + Context patterns
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+Lab/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+Research\s+Group/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+Group/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:'s)?\s+Lab(?:oratory)?/i,
  /Lab(?:oratory)?\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\'s\s+Research/i,
  
  // Common faculty page patterns
  /Faculty Profile:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Principal Investigator:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Lab Director:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Group Leader:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Head:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  
  // Fallback patterns
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+\([^)]+\)/i,
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+at\s+[A-Z]/i,
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Department/i
];

// Elements likely to contain professor names
const NAME_CONTAINING_SELECTORS = [
  'h1', 'h2', 'h3', 
  '.faculty-name', '.professor-name', '.pi-name', '.profile-name', '.staff-name',
  '[itemprop="name"]', '.name', '.fullname', '.title-name',
  '.contact-name', '.author-name', '.researcher-name', '.investigator'
];

// Define the request body type
interface GenerateEmailRequest {
  urlContent: string;
  goal: string;
  tone: string;
  userName?: string;
  recipientName?: string;
  recipientEmail?: string;
  url?: string;
  warmth?: number;
}

// Function to extract potential name from URL
function extractNameFromUrl(url: string): string | null {
  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Look for common patterns in paths that might contain names
    const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment.length > 0);
    
    // Filter out common non-name segments
    const potentialNameSegments = pathSegments.filter(segment => {
      // Filter out common directory names and file extensions
      return !segment.match(/^(about|faculty|staff|research|lab|group|publications|contact|index|home|www)$/) && 
             !segment.match(/\.(html|php|aspx|jsp)$/);
    });
    
    if (potentialNameSegments.length > 0) {
      // Process potential name segments
      for (const segment of potentialNameSegments) {
        // Replace hyphens and underscores with spaces
        const processedSegment = segment.replace(/[-_]/g, ' ');
        
        // Check if it looks like a name (capitalized words)
        const namePattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/;
        if (namePattern.test(processedSegment)) {
          return processedSegment;
        }
        
        // Check for name-like pattern (firstlast or first-last)
        const nameParts = processedSegment.match(/^([A-Z][a-z]+)[-_]?([A-Z][a-z]+)$/i);
        if (nameParts) {
          return `${nameParts[1]} ${nameParts[2]}`;
        }
      }
    }
    
    // Check for name in subdomains (e.g., smith.faculty.university.edu)
    const subdomains = parsedUrl.hostname.split('.');
    if (subdomains.length > 2) {
      const firstSubdomain = subdomains[0];
      // If first subdomain looks like a name
      if (firstSubdomain.length > 3 && !firstSubdomain.match(/^(www|faculty|web|people|staff)$/)) {
        // Check if it looks like a last name
        if (/^[a-z]+$/i.test(firstSubdomain)) {
          return firstSubdomain.charAt(0).toUpperCase() + firstSubdomain.slice(1);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

// Function to extract email addresses from content
function extractEmails(content: string, $: cheerio.CheerioAPI): string[] {
  const emails: string[] = [];
  
  // Extract from mailto links
  $('a[href^="mailto:"]').each((_, element) => {
    const href = $(element).attr('href');
    if (href) {
      const email = href.replace('mailto:', '').split('?')[0].trim();
      if (isValidEmail(email) && !emails.includes(email)) {
        emails.push(email);
      }
    }
  });
  
  // Extract from text content using regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const contentEmails = content.match(emailRegex) || [];
  
  for (const email of contentEmails) {
    if (isValidEmail(email) && !emails.includes(email)) {
      emails.push(email);
    }
  }
  
  return emails;
}

// Simple email validation function
function isValidEmail(email: string): boolean {
  const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/i;
  return re.test(email);
}

// Detect the context of the URL to determine if it's likely an academic page
function detectUrlContext(url?: string, cleanedContent?: string): 'academic' | 'job' | 'company' | 'generic' {
  if (!url && !cleanedContent) return 'generic';
  
  try {
    // Check URL patterns
    if (url) {
      const urlLower = url.toLowerCase();
      // Academic URL patterns
      if (
        urlLower.includes('.edu') ||
        urlLower.includes('faculty') ||
        urlLower.includes('professor') ||
        urlLower.includes('academic') ||
        urlLower.includes('research') ||
        urlLower.includes('lab') ||
        urlLower.includes('department')
      ) {
        return 'academic';
      }
      
      // Job posting patterns
      if (
        urlLower.includes('job') ||
        urlLower.includes('career') ||
        urlLower.includes('position') ||
        urlLower.includes('apply') ||
        urlLower.includes('employ') ||
        urlLower.includes('hiring') ||
        urlLower.includes('linkedin.com/jobs') ||
        urlLower.includes('indeed.com') ||
        urlLower.includes('glassdoor.com')
      ) {
        return 'job';
      }
      
      // Company patterns
      if (
        urlLower.includes('about-us') ||
        urlLower.includes('team') ||
        urlLower.includes('leadership') ||
        urlLower.includes('company') ||
        urlLower.includes('contact-us')
      ) {
        return 'company';
      }
    }
    
    // Check content patterns if URL check isn't conclusive
    if (cleanedContent) {
      const contentLower = cleanedContent.toLowerCase();
      
      // Academic content keywords
      const academicKeywords = ['professor', 'faculty', 'research', 'lab', 'publication', 'phd', 'academic', 'university', 'college'];
      let academicScore = 0;
      academicKeywords.forEach(keyword => {
        if (contentLower.includes(keyword)) academicScore++;
      });
      
      // Job posting keywords
      const jobKeywords = ['job description', 'responsibilities', 'qualifications', 'apply', 'salary', 'position', 'hiring', 'recruiter'];
      let jobScore = 0;
      jobKeywords.forEach(keyword => {
        if (contentLower.includes(keyword)) jobScore++;
      });
      
      // Company keywords
      const companyKeywords = ['company', 'business', 'mission', 'vision', 'founded', 'headquarters', 'team', 'ceo', 'leadership'];
      let companyScore = 0;
      companyKeywords.forEach(keyword => {
        if (contentLower.includes(keyword)) companyScore++;
      });
      
      // Determine context based on highest score
      const maxScore = Math.max(academicScore, jobScore, companyScore);
      if (maxScore > 2) {
        if (maxScore === academicScore) return 'academic';
        if (maxScore === jobScore) return 'job';
        if (maxScore === companyScore) return 'company';
      }
    }
    
    return 'generic';
  } catch (error) {
    console.error('Error detecting URL context:', error);
    return 'generic';
  }
}

async function extractContactName($: cheerio.CheerioAPI, cleanedContent: string, url?: string): Promise<string> {
  // First, detect the context of the URL
  const context = detectUrlContext(url, cleanedContent);
  
  // 1. Check targeted elements that often contain person names
  for (const selector of NAME_CONTAINING_SELECTORS) {
    const elements = $(selector);
    if (elements.length) {
      for (let i = 0; i < Math.min(elements.length, 5); i++) {
        const text = $(elements[i]).text().trim();
        // Check if this element contains a name pattern
        for (const pattern of NAME_PATTERNS) {
          const match = text.match(pattern);
          if (match) {
            // Process the name
            let name = match[0].trim();
            // If we matched a group, use the first group
            if (match[1]) {
              // Only add Professor title in academic contexts
              if (context === 'academic' && !name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
                name = `Professor ${match[1]}`;
              } else {
                name = match[1];
              }
            }
            return name;
          }
        }
      }
    }
  }

  // 2. Look in meta tags and title
  const metaName = $('meta[property="og:title"], meta[name="author"], meta[name="twitter:title"], meta[property="article:author"]').attr('content');
  if (metaName) {
    for (const pattern of NAME_PATTERNS) {
      const match = metaName.match(pattern);
      if (match) {
        const name = match[0].trim();
        if (match[1]) {
          if (context === 'academic' && !name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
            return `Professor ${match[1]}`;
          }
          return match[1];
        }
        return name;
      }
    }
  }

  const title = $('title').text().trim();
  if (title) {
    for (const pattern of NAME_PATTERNS) {
      const match = title.match(pattern);
      if (match) {
        const name = match[0].trim();
        if (match[1]) {
          if (context === 'academic' && !name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
            return `Professor ${match[1]}`;
          }
          return match[1];
        }
        return name;
      }
    }
  }

  // 3. Try to extract name from URL if provided
  if (url) {
    const nameFromUrl = extractNameFromUrl(url);
    if (nameFromUrl) {
      if (context === 'academic') {
        return `Professor ${nameFromUrl}`;
      }
      return nameFromUrl;
    }
  }

  // 4. Try regex patterns on the cleaned content
  for (const pattern of NAME_PATTERNS) {
    const match = cleanedContent.match(pattern);
    if (match) {
      const name = match[0].trim();
      if (match[1]) {
        if (context === 'academic' && !name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
          return `Professor ${match[1]}`;
        }
        return match[1];
      }
      return name;
    }
  }

  // 5. Look for any "Contact" sections
  const contactSection = $('*:contains("Contact")').filter(function(this: any) {
    return $(this).text().trim() === 'Contact' || 
           $(this).text().trim() === 'Contact Us' || 
           $(this).text().trim() === 'Contact Information';
  });
  
  if (contactSection.length > 0) {
    // Get the next few elements after the contact section
    let contactElement = contactSection.first();
    let nextElements = contactElement.nextAll().slice(0, 5);
    
    // Check for name patterns in these elements
    for (let i = 0; i < nextElements.length; i++) {
      const text = $(nextElements[i]).text().trim();
      for (const pattern of NAME_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
          const name = match[0].trim();
          if (match[1]) {
            if (context === 'academic' && !name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
              return `Professor ${match[1]}`;
            }
            return match[1];
          }
          return name;
        }
      }
    }
  }

  // 6. If all else fails, use Gemini to extract the name
  let prompt;
  if (context === 'academic') {
    prompt = `Extract the name of the professor or lead researcher from this text. The text is from a professor's lab or faculty webpage. Only return the name with title (e.g., "Dr. John Smith" or "Professor Jane Doe"). If no clear name is found, return "Professor":\n\n${cleanedContent.substring(0, 3000)}`;
  } else if (context === 'job') {
    prompt = `Extract the name of the hiring manager or recruiter from this text. The text is from a job posting. Only return the name without any additional text. If no clear name is found, return "Hiring Manager":\n\n${cleanedContent.substring(0, 3000)}`;
  } else if (context === 'company') {
    prompt = `Extract the name of a key person (CEO, founder, team lead, etc.) from this text. The text is from a company webpage. Only return the name without any additional text. If no clear name is found, return "Team":\n\n${cleanedContent.substring(0, 3000)}`;
  } else {
    prompt = `Extract a person's name from this text. Only return the name without any additional text. If no clear name is found, return "Team":\n\n${cleanedContent.substring(0, 3000)}`;
  }
  
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    
    const name = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || getDefaultNameByContext(context);
    
    // If Gemini returns a generic fallback, try to find a name in the content
    if (name === getDefaultNameByContext(context)) {
      const nameMatch = cleanedContent.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
      if (nameMatch) {
        if (context === 'academic') {
          return `Professor ${nameMatch[0]}`;
        }
        return nameMatch[0];
      }
    }
    return name;
  } catch (error) {
    console.error('Error extracting name with Gemini:', error);
    return getDefaultNameByContext(context);
  }
}

// Helper function to get default name based on context
function getDefaultNameByContext(context: 'academic' | 'job' | 'company' | 'generic'): string {
  switch (context) {
    case 'academic':
      return 'Professor';
    case 'job':
      return 'Hiring Manager';
    case 'company':
      return 'Team';
    default:
      return 'Team';
  }
}

// Function to find AI-suggested email addresses
async function findAISuggestedEmails(content: string, url?: string, recipientName?: string): Promise<string[]> {
  try {
    // Extract key organizations, people, or departments from the content
    const context = detectUrlContext(url, content);
    const organizationPrompt = `
      Based on the following webpage content, identify the key organization, department, lab, or person that would be most relevant for contact:

      URL: ${url || 'Not provided'}
      Content: ${content.substring(0, 2000)}

      Extract:
      1. Organization name (university, company, lab, etc.)
      2. Department or division name
      3. Key person's name (if mentioned)
      4. Lab or research group name (if applicable)

      Return only the most relevant 1-2 entities that someone would likely search for to find contact information.
      Format as a simple list, one item per line.
    `;

    const orgResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: organizationPrompt,
    });

    const organizations = orgResponse.text?.trim() || '';
    console.log('Extracted organizations:', organizations);

    if (!organizations) {
      return [];
    }

    // Now search for email addresses based on the extracted entities
    const emailSearchPrompt = `
      Based on the following organization or person information, SEARCH THE WEB for email addresses that could be used to reach them. 
      
      Context: ${context}
      Organization/Person Info: ${organizations}
      ${recipientName ? `Recipient Name: ${recipientName}` : ''}
      
      ONLY RETURN THE EMAIL ADRESSES IF THEY ARE REAL AND VALID.
      
      Return the result as a valid JSON array of email strings, and leave it empty if no valid email addresses are found:
      ["email1@domain.com", "email2@domain.com", "email3@domain.com"]
    `;

    const emailResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: emailSearchPrompt,
    });

    const emailText = emailResponse.text?.trim() || '';
    console.log('AI email suggestions raw:', emailText);

    // Clean and parse the JSON response
    const cleanedEmailText = emailText.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      const suggestedEmails = JSON.parse(cleanedEmailText);
      if (Array.isArray(suggestedEmails)) {
        // Validate emails and filter out invalid ones
        const validEmails = suggestedEmails.filter((email: string) => 
          typeof email === 'string' && isValidEmail(email)
        );
        console.log('AI suggested emails:', validEmails);
        return validEmails;
      }
    } catch (parseError) {
      console.error('Error parsing AI email suggestions:', parseError);
      // Try to extract emails from the response text using regex as fallback
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const extractedEmails = emailText.match(emailRegex) || [];
      const validEmails = extractedEmails.filter(email => isValidEmail(email));
      console.log('Fallback extracted emails:', validEmails);
      return validEmails;
    }

    return [];
  } catch (error) {
    console.error('Error finding AI-suggested emails:', error);
    return [];
  }
}

// Function to ensure the email has the correct signature with the user's name
function ensureCorrectSignature(emailBody: string, userName: string): string {
  // Common signature patterns
  const signaturePatterns = [
    /Sincerely,\s*\n+\s*([^,\n]+)/i,
    /Best regards,\s*\n+\s*([^,\n]+)/i,
    /Regards,\s*\n+\s*([^,\n]+)/i,
    /Yours truly,\s*\n+\s*([^,\n]+)/i,
    /Thanks,\s*\n+\s*([^,\n]+)/i,
    /Thank you,\s*\n+\s*([^,\n]+)/i,
    /Yours sincerely,\s*\n+\s*([^,\n]+)/i,
    /Best,\s*\n+\s*([^,\n]+)/i,
    /Cheers,\s*\n+\s*([^,\n]+)/i,
    /Warm regards,\s*\n+\s*([^,\n]+)/i,
    /Kind regards,\s*\n+\s*([^,\n]+)/i,
  ];
  
  // Always replace "User" with the actual userName
  emailBody = emailBody.replace(/\b(User|user)\b/g, userName);
  
  // Check if the email already has a signature with the user's name
  for (const pattern of signaturePatterns) {
    if (pattern.test(emailBody)) {
      const match = emailBody.match(pattern);
      if (match && match[1]) {
        const signatureName = match[1].trim();
        // Check for common generic names or if it doesn't match the userName
        if (
          signatureName.toLowerCase() === 'user' || 
          signatureName.toLowerCase() === 'me' || 
          signatureName.toLowerCase() === 'your name' || 
          signatureName.toLowerCase() !== userName.toLowerCase()
        ) {
          // Replace the incorrect name with the user's name
          return emailBody.replace(pattern, (matched) => {
            const salutationPart = matched.split(/\n+\s*/)[0];
            return `${salutationPart}\n${userName}`;
          });
        }
      }
    }
  }
  
  // If no signature found or replacement needed, check if we need to add a signature
  if (!signaturePatterns.some(pattern => pattern.test(emailBody))) {
    // Add a signature if none exists
    return `${emailBody.trim()}\n\nBest regards,\n${userName}`;
  }
  
  return emailBody;
}

function extractRelevantContent($: cheerio.CheerioAPI): string {
  const content: string[] = [];

  // Get title and meta description
  const title = $('title').text().trim();
  if (title) content.push(title);

  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc) content.push(metaDesc);

  // Extract from main content areas
  $('article, main, section, div, p, h1, h2').each((_, element) => {
    if (shouldIgnoreElement($, element)) return;

    const text = $(element).text().trim();
    if (text) {
      // Check if element has significant text content
      const wordCount = text.split(/\s+/).length;
      if (wordCount > 5) { // Ignore very short text blocks
        content.push(text);
      }
    }
  });

  return content.join('\n\n');
}

function shouldIgnoreElement($: cheerio.CheerioAPI, element: any): boolean {
  const classes = $(element).attr('class') || '';
  const id = $(element).attr('id') || '';
  
  return IGNORE_CLASS_PATTERNS.some(pattern => 
    classes.toLowerCase().includes(pattern) || 
    id.toLowerCase().includes(pattern)
  );
}

// Create Supabase server client
const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};

// Function to extract user name from Supabase user data with robust fallbacks
function extractUserName(user: any): string {
  if (!user) return 'Me';
  
  // Check if we have user metadata
  const metadata = user.user_metadata || {};
  
  // List of generic usernames to avoid using
  const genericNames = ['user', 'me', 'admin', 'customer', 'guest', 'person'];
  
  // Try to get name from various metadata fields
  let name = metadata.full_name || 
             metadata.name ||
             metadata.preferred_name ||
             metadata.display_name ||
             metadata.given_name ||
             // If there's a first_name and last_name, combine them
             (metadata.first_name && metadata.last_name 
               ? `${metadata.first_name} ${metadata.last_name}`
               : null) ||
             // Try just first name if available
             metadata.first_name ||
             // Extract from email (before the @)
             (user.email ? user.email.split('@')[0] : null) ||
             'Me';
             
  // Clean up the name
  name = name.trim();
  
  // Avoid using generic names
  if (genericNames.includes(name.toLowerCase())) {
    // If the name is generic but we have an email, use the email username instead
    if (user.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize the first letter of the email username
      name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    } else {
      name = 'Me'; // Fallback
    }
  }
  
  // Ensure first letter is capitalized
  if (name && name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  return name;
}

// Function to validate and clean up any provided user name
function validateUserName(name: string | undefined | null): string {
  if (!name) return 'Me';
  
  // Clean up the name
  name = name.trim();
  
  // List of generic usernames to avoid
  const genericNames = ['user', 'me', 'admin', 'customer', 'guest', 'person'];
  
  // If name is generic or very short, reject it
  if (genericNames.includes(name.toLowerCase()) || name.length < 2) {
    return 'Me';
  }
  
  // Ensure first letter is capitalized
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export async function POST(request: Request) {
  try {
    console.log('Starting email generation process...');
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Parse the request body
    const body: GenerateEmailRequest = await request.json();
    let { urlContent, goal, tone, userName, recipientName, recipientEmail, url, warmth } = body;
    let extractedEmails: string[] = [];

    console.log('Request parameters:', { goal, tone, userName, url, warmth });

    // Validate required fields
    if (!urlContent) {
      console.error('Missing urlContent in request');
      return NextResponse.json(
        { error: 'URL content is required' },
        { status: 400 }
      );
    }

    if (!goal) {
      console.error('Missing goal in request');
      return NextResponse.json(
        { error: 'Goal is required' },
        { status: 400 }
      );
    }

    if (!tone) {
      console.error('Missing tone in request');
      return NextResponse.json(
        { error: 'Tone is required' },
        { status: 400 }
      );
    }
    
    // Get user from Supabase if userName isn't provided
    if (!userName || userName.trim().toLowerCase() === 'user') {
      try {
        // Get the current authenticated user
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user from Supabase:', error);
        } else if (user) {
          // Try to get the name from user_metadata
          userName = user.user_metadata?.name || 
                    user.user_metadata?.full_name ||
                    user.user_metadata?.preferred_name ||
                    user.user_metadata?.display_name ||
                    (user.user_metadata?.first_name && user.user_metadata?.last_name 
                      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                      : user.user_metadata?.first_name);
          // If still no userName, try the profiles table as fallback
          if (!userName) {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, display_name, first_name, last_name, email')
                .eq('id', user.id)
                .single();
              if (!profileError && profile) {
                userName = profile.full_name || 
                          profile.display_name || 
                          (profile.first_name && profile.last_name ? 
                            `${profile.first_name} ${profile.last_name}` : 
                            profile.first_name);
              }
            } catch (err) {
              // Ignore
            }
          }
          // If we still don't have a name, fall back to email or defaults
          if (!userName && user.email) {
            let cleanName = user.email.split('@')[0].replace(/[._-]/g, ' ');
            cleanName = cleanName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            userName = cleanName;
          }
          if (!userName) userName = 'Me';
        } else {
          userName = 'Me';
        }
      } catch (error) {
        userName = 'Me';
      }
    }

    // If URL is provided, fetch and process the content
    if (url) {
      try {
        console.log('Fetching URL content:', url);
        // Fetch the webpage with timeout
        const response = await axios.get(url, {
          timeout: 5000, // 5 second timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        // Load HTML into cheerio
        const $ = cheerio.load(response.data) as unknown as cheerio.CheerioAPI;

        // Remove unwanted elements
        $('nav, footer, script, style, iframe, noscript').remove();

        // Extract and clean content
        const cleanedContent = extractRelevantContent($);

        if (!cleanedContent.trim()) {
          return NextResponse.json(
            { error: 'Could not extract meaningful content from URL' },
            { status: 400 }
          );
        }

        // Extract contact name as context (optional, not enforced)
        if (!recipientName) {
          try {
            recipientName = await extractContactName($, cleanedContent, url);
          } catch (error) {
            console.log('Could not extract recipient name, AI will handle addressing naturally');
            recipientName = undefined;
          }
        }

        // Extract email addresses
        extractedEmails = extractEmails(cleanedContent, $);

        // Use the cleaned content
        urlContent = cleanedContent;
      } catch (error) {
        console.error('Error processing URL:', error);
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            return NextResponse.json(
              { error: 'Request timed out' },
              { status: 408 }
            );
          }
          return NextResponse.json(
            { error: 'Failed to fetch the webpage' },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: 'An unexpected error occurred while processing the URL' },
          { status: 500 }
        );
      }
    }

    // Truncate content if necessary
    const truncatedContent = urlContent.length > MAX_CONTENT_LENGTH
      ? urlContent.substring(0, MAX_CONTENT_LENGTH) + '...'
      : urlContent;

    console.log('Generating email with Gemini...');

    // Fetch user's resume context if available
    let resumeContext = '';
    try {
      const cookieStore = await import('next/headers').then(m => m.cookies());
      const resolvedCookies = await cookieStore;
      
      const resumeSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return resolvedCookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              try {
                resolvedCookies.set(name, value, options);
              } catch {
                // The set method will throw in middleware or when cookies are static
              }
            },
            remove(name: string, options: any) {
              try {
                resolvedCookies.set(name, '', { ...options, maxAge: 0 });
              } catch {
                // The delete method will throw in middleware or when cookies are static
              }
            },
          },
        }
      );

      const { data: { session } } = await resumeSupabase.auth.getSession();
      
      if (session?.user?.id) {
        const { data: resume } = await resumeSupabase
          .from('user_resumes')
          .select('extracted_text')
          .eq('user_id', session.user.id)
          .single();
        
        if (resume?.extracted_text) {
          // Limit resume context to prevent prompt from being too long
          resumeContext = resume.extracted_text.substring(0, 2000);
          console.log('Found resume context for user, length:', resumeContext.length);
        }
      }
    } catch (error) {
      console.log('Could not fetch resume context:', error);
      // Continue without resume context
    }
    
    // Create a dynamic prompt based on the input parameters
    const warmthLevel = warmth || 50;
    const warmthDescription = warmthLevel <= 25 ? "very professional and formal" : 
                             warmthLevel <= 50 ? "balanced with professional warmth" : 
                             warmthLevel <= 75 ? "friendly and conversational" : 
                             "very personal and warm";
    
    const prompt = `
      Generate a short, catchy, highly personalized, human and natural cold email using the following information:

      - URL: ${url}
      - URL Content Preview: ${truncatedContent}
      - Goal: ${goal}
      - Tone: ${tone}
      - Warmth Level: ${warmthLevel}/100 (${warmthDescription})
      - Sender's Name: ${userName || 'Me'}
      - Context: ${detectUrlContext(url, truncatedContent)}
      ${recipientName ? `- Suggested Recipient: ${recipientName} (use as context, but address naturally)` : ''}
      ${resumeContext ? `- Sender's Background/Resume: ${resumeContext}` : ''}

      Before writing:
      1. Deeply analyze the provided URL content preview.
      2. Attempt to infer or simulate a live search of the URL and related information.
      3. Identify and extract at least 2 specific, verifiable insights relevant to the recipient or organization.

      **Do not** proceed to writing the email if you cannot find specific details — instead, thoughtfully reflect on the provided preview.

      Email writing rules:
      - Adapt your style and format to the context (academic, job application, business, etc.)
      - You must *mention exact and real* details that show clear research.
      - The email must *feel naturally written by a human* and be short and concise, not like a template.
      - Match the requested tone ("${tone}") with the warmth level (${warmthLevel}/100).
      ${resumeContext ? '- When relevant, subtly incorporate the sender\'s background, experience, or qualifications from their resume to make the outreach more compelling and relevant.' : ''}
      - WARMTH LEVEL GUIDANCE:
        * 1-25: Use very formal language, minimal personal touches, professional distance
        * 26-50: Professional with some warmth, appropriate personal elements
        * 51-75: Conversational tone, friendly approach, personal connections
        * 76-100: Highly personalized, warm language, personal anecdotes when appropriate
      - Address the recipient naturally based on context - if no specific name is known, use appropriate greetings like:
        * Academic: "Dear Professor," "Hello," or "Hi there,"
        * Business: "Dear Team," "Hello," or "Hi,"
        * Job: "Dear Hiring Manager," "Hello," or "Hi,"
        * Generic: "Hello," "Hi there," or "Dear Team,"
      - Clearly state the sender's goal and end with a friendly, low-pressure call to action.
      - Keep the body under 150 words unless a slightly longer message fits the tone.
      - CRITICAL: The sign-off MUST include the EXACT name "${userName || 'Me'}" and not generic terms.
      - NEVER use "User" or any generic placeholder for the sender's name.
      - The email signature must be in this exact format: 
        
        "Best regards,
        ${userName || 'Me'}"
        
        OR
        
        "Sincerely,
        ${userName || 'Me'}"

      Return the output strictly in this valid JSON format:
      {
        "subject": "Short and personalized subject line",
        "body": "The fully written email body including the appropriate greeting and sign-off with the sender's exact name '${userName || 'Me'}'"
      }

      Important:
      - If URL information is insufficient, say so naturally in the email, but still make it sound like you made an effort.
      - Prioritize being real, human, and engaging over sounding formal or robotic.
      - Use complete sentences. Avoid buzzwords and generic phrases like "innovative solutions" or "dynamic environment" unless specifically referenced from research.
      - THE SENDER NAME MUST BE EXACTLY "${userName || 'Me'}", NOT "User" OR ANY OTHER PLACEHOLDER.
      - Adjust the language formality and personal touches based on the warmth level (${warmthLevel}/100).

      Language: English.
    `;

    try {
      // Generate the email using Gemini
      console.log('Sending request to Gemini API...');
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      console.log('Received response from Gemini');

      const text = response.text || '';
      
      if (!text) {
        console.error('No response text received from Gemini');
        throw new Error('No response text received from Gemini');
      }
      
      // Clean the response text by removing markdown code block formatting
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      // Parse the JSON response
      try {
        console.log('Parsing Gemini response...');
        const emailData = JSON.parse(cleanedText);
        console.log('Successfully parsed response');
        
        // Ensure the email body has the correct signature with the user's name
        const body = ensureCorrectSignature(emailData.body, userName || 'Me');
        
        // Get AI-suggested emails after generating the email
        console.log('Finding AI-suggested emails...');
        const aiSuggestedEmails = await findAISuggestedEmails(truncatedContent, url, recipientName);
        
        // Combine all emails (page-extracted + AI-suggested) and remove duplicates
        const allEmails = [...new Set([...extractedEmails, ...aiSuggestedEmails])];
        
        return NextResponse.json({
          ...emailData,
          body,
          recipientName: recipientName || getDefaultNameByContext(detectUrlContext(url, truncatedContent)),
          recipientEmail: recipientEmail || allEmails[0] || '',
          extractedEmails: extractedEmails,
          aiSuggestedEmails: aiSuggestedEmails,
          allEmails: allEmails,
          userName: userName || ''
        });
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.error('Raw response:', cleanedText);
        // If JSON parsing fails, try to extract subject and body using regex
        const subjectMatch = cleanedText.match(/"subject":\s*"([^"]+)"/);
        const bodyMatch = cleanedText.match(/"body":\s*"([^"]+)"/);
        
        if (subjectMatch && bodyMatch) {
          // Ensure the email body has the correct signature with the user's name
          const body = ensureCorrectSignature(bodyMatch[1], userName || 'Me');
          
          // Get AI-suggested emails after generating the email
          console.log('Finding AI-suggested emails (fallback path)...');
          const aiSuggestedEmails = await findAISuggestedEmails(truncatedContent, url, recipientName);
          
          // Combine all emails (page-extracted + AI-suggested) and remove duplicates
          const allEmails = [...new Set([...extractedEmails, ...aiSuggestedEmails])];
          
          return NextResponse.json({
            subject: subjectMatch[1],
            body,
            recipientName: recipientName || getDefaultNameByContext(detectUrlContext(url, truncatedContent)),
            recipientEmail: recipientEmail || allEmails[0] || '',
            extractedEmails: extractedEmails,
            aiSuggestedEmails: aiSuggestedEmails,
            allEmails: allEmails,
            userName: userName || ''
          });
        } else {
          throw new Error('Could not parse response format');
        }
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to generate email with AI' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in email generation process:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate email' },
      { status: 500 }
    );
  }
} 
