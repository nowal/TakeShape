import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
const COACHING_MODEL = process.env.ANTHROPIC_COACHING_MODEL || 'claude-sonnet-4-6';

type AnalyzeBody = {
  images?: string[];
  rules?: string;
  serviceFocus?: string;
};

type StructuredAnalysis = {
  overview: {
    siteType: string;
    confidence: 'low' | 'medium' | 'high';
    summary: string;
  };
  windowCleaning: {
    estimatedWindowSections: Array<{
      reference: string;
      paneCountEstimate: string;
      confidence: 'low' | 'medium' | 'high';
      notes: string;
    }>;
    screenConditionNotes: string[];
    accessConstraints: string[];
  };
  powerWashing: {
    roofWashLikely: boolean | null;
    roofWashEvidence: string[];
    surfaceIssues: string[];
    safetyRisks: string[];
  };
  quoteScopeWatchouts: string[];
  homeownerQuestions: string[];
  missingCoverage: string[];
};

const DEFAULT_STRUCTURED: StructuredAnalysis = {
  overview: {
    siteType: 'unknown',
    confidence: 'low',
    summary: 'No structured analysis available.'
  },
  windowCleaning: {
    estimatedWindowSections: [],
    screenConditionNotes: [],
    accessConstraints: []
  },
  powerWashing: {
    roofWashLikely: null,
    roofWashEvidence: [],
    surfaceIssues: [],
    safetyRisks: []
  },
  quoteScopeWatchouts: [],
  homeownerQuestions: [],
  missingCoverage: []
};

const extractBase64Data = (dataUrlOrBase64: string) => {
  const match = dataUrlOrBase64.match(/^data:image\/\w+;base64,(.+)$/);
  return match ? match[1] : dataUrlOrBase64;
};

const getTextBlocks = (content: Anthropic.Messages.Message['content']) =>
  content
    .filter((block) => block.type === 'text')
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n\n')
    .trim();

const parseJsonWithRepair = async (rawText: string, schemaHint: string) => {
  const firstPass = (() => {
    try {
      return JSON.parse(extractJsonPayload(rawText));
    } catch {
      return null;
    }
  })();

  if (firstPass) return firstPass;

  const repairResponse = await anthropic.messages.create({
    model: COACHING_MODEL,
    max_tokens: 1400,
    system: 'Return strict JSON only. No markdown. No prose.',
    messages: [
      {
        role: 'user',
        content: `Convert the following model output into valid JSON that matches this schema:\n${schemaHint}\n\nOutput to repair:\n${rawText}`
      }
    ]
  });

  const repairedText = getTextBlocks(repairResponse.content);
  return JSON.parse(extractJsonPayload(repairedText));
};

const extractJsonPayload = (text: string) => {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
};

const coerceStructured = (value: unknown): StructuredAnalysis => {
  if (!value || typeof value !== 'object') return DEFAULT_STRUCTURED;

  return {
    overview: {
      siteType: String((value as any)?.overview?.siteType || 'unknown'),
      confidence:
        (['low', 'medium', 'high'] as const).includes((value as any)?.overview?.confidence)
          ? (value as any).overview.confidence
          : 'low',
      summary: String((value as any)?.overview?.summary || '')
    },
    windowCleaning: {
      estimatedWindowSections: Array.isArray((value as any)?.windowCleaning?.estimatedWindowSections)
        ? (value as any).windowCleaning.estimatedWindowSections.map((item: any) => ({
            reference: String(item?.reference || ''),
            paneCountEstimate: String(item?.paneCountEstimate || ''),
            confidence:
              (['low', 'medium', 'high'] as const).includes(item?.confidence)
                ? item.confidence
                : 'low',
            notes: String(item?.notes || '')
          }))
        : [],
      screenConditionNotes: Array.isArray((value as any)?.windowCleaning?.screenConditionNotes)
        ? (value as any).windowCleaning.screenConditionNotes.map((note: unknown) => String(note || ''))
        : [],
      accessConstraints: Array.isArray((value as any)?.windowCleaning?.accessConstraints)
        ? (value as any).windowCleaning.accessConstraints.map((item: unknown) => String(item || ''))
        : []
    },
    powerWashing: {
      roofWashLikely:
        typeof (value as any)?.powerWashing?.roofWashLikely === 'boolean'
          ? (value as any).powerWashing.roofWashLikely
          : null,
      roofWashEvidence: Array.isArray((value as any)?.powerWashing?.roofWashEvidence)
        ? (value as any).powerWashing.roofWashEvidence.map((item: unknown) => String(item || ''))
        : [],
      surfaceIssues: Array.isArray((value as any)?.powerWashing?.surfaceIssues)
        ? (value as any).powerWashing.surfaceIssues.map((item: unknown) => String(item || ''))
        : [],
      safetyRisks: Array.isArray((value as any)?.powerWashing?.safetyRisks)
        ? (value as any).powerWashing.safetyRisks.map((item: unknown) => String(item || ''))
        : []
    },
    quoteScopeWatchouts: Array.isArray((value as any)?.quoteScopeWatchouts)
      ? (value as any).quoteScopeWatchouts.map((item: unknown) => String(item || ''))
      : [],
    homeownerQuestions: Array.isArray((value as any)?.homeownerQuestions)
      ? (value as any).homeownerQuestions.map((item: unknown) => String(item || ''))
      : [],
    missingCoverage: Array.isArray((value as any)?.missingCoverage)
      ? (value as any).missingCoverage.map((item: unknown) => String(item || ''))
      : []
  };
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const body = (await req.json()) as AnalyzeBody;
    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
    const rules = String(body.rules || '').trim();
    const serviceFocus = String(body.serviceFocus || 'Window cleaning and power washing').trim();

    if (!images.length) {
      return NextResponse.json({ error: 'At least one image frame is required.' }, { status: 400 });
    }

    const limitedImages = images.slice(0, 40);

    const extractionSchema = `{
  "overview": {
    "siteType": "string",
    "confidence": "low|medium|high",
    "summary": "string"
  },
  "windowCleaning": {
    "estimatedWindowSections": [{
      "reference": "short identifier of visible area",
      "paneCountEstimate": "estimated panes or range",
      "confidence": "low|medium|high",
      "notes": "why"
    }],
    "screenConditionNotes": ["string"],
    "accessConstraints": ["string"]
  },
  "powerWashing": {
    "roofWashLikely": true,
    "roofWashEvidence": ["string"],
    "surfaceIssues": ["string"],
    "safetyRisks": ["string"]
  },
  "quoteScopeWatchouts": ["string"],
  "homeownerQuestions": ["string"],
  "missingCoverage": ["string"]
}`;

    const extractionPrompt = `You are analyzing extracted walkthrough video frames for home service quoting prep.

Return STRICT JSON only (no markdown, no comments) with this schema:
${extractionSchema}

Rules:
- Use only what is visible.
- If not enough evidence, be explicit and set uncertain fields conservatively.
- For roofWashLikely, use null if uncertain.
- Service focus: ${serviceFocus}`;

    const extractionMessage = {
      role: 'user' as const,
      content: [
        {
          type: 'text' as const,
          text: 'Extract structured quote-relevant findings from these frames.'
        },
        ...limitedImages.map((image) => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/jpeg' as const,
            data: extractBase64Data(image)
          }
        }))
      ]
    };

    const structuredResponse = await anthropic.messages.create({
      model: COACHING_MODEL,
      max_tokens: 1400,
      system: extractionPrompt,
      messages: [extractionMessage]
    });

    const structuredRawText = getTextBlocks(structuredResponse.content);
    let structured: StructuredAnalysis = DEFAULT_STRUCTURED;

    try {
      const parsed = await parseJsonWithRepair(structuredRawText, extractionSchema);
      structured = coerceStructured(parsed);
    } catch {
      structured = {
        ...DEFAULT_STRUCTURED,
        overview: {
          siteType: 'unknown',
          confidence: 'low',
          summary: 'Model returned non-JSON structured output.'
        }
      };
    }

    const coachingSystemPrompt = `You are a senior field trainer for home service estimators.
Generate practical coaching guidance for better quote quality.
Keep it concise and actionable.
Return bullet points only.`;

    const coachingUserPrompt = `Service focus: ${serviceFocus}

Provider-specific rules:
${rules || 'No additional rules provided.'}

Structured findings:
${JSON.stringify(structured, null, 2)}

Produce 3 to 15 bullet points for the quoter.
Each bullet must be one concrete, high-impact reminder based on the findings.
Prioritize quote accuracy, scope risk, and missing info to confirm.
Do not include section headers, numbering, or filler text.`;

    const coachingResponse = await anthropic.messages.create({
      model: COACHING_MODEL,
      max_tokens: 1200,
      system: coachingSystemPrompt,
      messages: [
        {
          role: 'user',
          content: coachingUserPrompt
        }
      ]
    });

    const notes = getTextBlocks(coachingResponse.content);

    if (!notes) {
      return NextResponse.json({ error: 'No coaching notes returned from model.' }, { status: 502 });
    }

    return NextResponse.json({
      notes,
      imageCount: limitedImages.length,
      structured
    });
  } catch (error) {
    console.error('Error generating coaching notes:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching notes.' },
      { status: 500 }
    );
  }
}
