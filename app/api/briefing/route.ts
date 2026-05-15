import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = (company: string) =>
  `You are a strategic analyst. Produce a structured briefing on ${company}.

Output ONLY newline-delimited JSON — one object per line, in this exact order, with no other text before or after:
{"type":"company","value":"<official company name>"}
{"type":"oneLiner","value":"<one sentence: what they do>"}
{"type":"businessModel","value":"<2-3 sentences on how they make money>"}
{"type":"marketMap","value":[{"name":"<competitor>","description":"<one line>"},{"name":"<competitor>","description":"<one line>"},{"name":"<competitor>","description":"<one line>"},{"name":"<competitor>","description":"<one line>"},{"name":"<competitor>","description":"<one line>"}]}
{"type":"keyRisks","value":[{"title":"<risk>","explanation":"<one sentence>"},{"title":"<risk>","explanation":"<one sentence>"},{"title":"<risk>","explanation":"<one sentence>"}]}
{"type":"investorAngle","value":"<2-3 sentences on what an investor would focus on>"}
{"type":"swot","value":{"strengths":["<point>","<point>","<point>"],"weaknesses":["<point>","<point>","<point>"],"opportunities":["<point>","<point>","<point>"],"threats":["<point>","<point>","<point>"]}}`;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { company } = body;

  if (!company?.trim()) {
    return new Response(JSON.stringify({ error: 'Please provide a company name.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server not configured. Add ANTHROPIC_API_KEY environment variable.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: PROMPT(company.trim()) }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`\n{"type":"error","value":"${msg}"}\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
