import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractJSON(text: string): string {
  // Strip markdown code fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Extract first JSON object
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) return obj[0].trim();
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company } = body;

    if (!company || typeof company !== 'string' || !company.trim()) {
      return NextResponse.json(
        { error: 'Please provide a company name or URL.' },
        { status: 400 }
      );
    }

    const companyInput = company.trim();

    const prompt = `You are a strategic analyst. Research the company ${companyInput} and return a structured briefing in the following JSON format with no additional text:
{
"company": "Company name",
"oneLiner": "One sentence description of what they do",
"businessModel": "2-3 sentences on how they make money",
"marketMap": [{"name": "Competitor name", "description": "One-line description"}, ...4-6 total],
"keyRisks": [{"title": "Risk title", "explanation": "One sentence explanation"}, ...3 total],
"investorAngle": "2-3 sentences on what an investor would focus on",
"swot": {
"strengths": ["2-3 bullet points"],
"weaknesses": ["2-3 bullet points"],
"opportunities": ["2-3 bullet points"],
"threats": ["2-3 bullet points"]
}
}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages: any[] = [{ role: 'user', content: prompt }];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response: any;
    let iterations = 0;
    const maxIterations = 5;

    do {
      response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 3 }] as any,
        messages,
      });

      if (response.stop_reason === 'pause_turn') {
        messages.push({ role: 'assistant', content: response.content });
        iterations++;
      }
    } while (response.stop_reason === 'pause_turn' && iterations < maxIterations);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textBlock = response.content?.find((b: any) => b.type === 'text');

    if (!textBlock?.text) {
      return NextResponse.json(
        { error: 'No response received. Please try again.' },
        { status: 422 }
      );
    }

    const jsonText = extractJSON(textBlock.text);

    let briefing;
    try {
      briefing = JSON.parse(jsonText);
    } catch {
      console.error('JSON parse failed. Raw:', textBlock.text.slice(0, 500));
      return NextResponse.json(
        { error: 'The AI returned an unexpected format. Please try again.' },
        { status: 422 }
      );
    }

    if (!briefing.company || !briefing.oneLiner || !briefing.swot) {
      return NextResponse.json(
        { error: 'Incomplete briefing received. Please try again.' },
        { status: 422 }
      );
    }

    return NextResponse.json(briefing);
  } catch (error) {
    console.error('Briefing error:', error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'API key is invalid. Check your ANTHROPIC_API_KEY environment variable.' },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit reached. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'AI service error. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
