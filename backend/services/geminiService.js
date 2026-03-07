const { GoogleGenerativeAI } = require('@google/generative-ai');

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CASE_STUDY_EXAMPLES = `
GOLD STANDARD EXAMPLES (Learn from these):

Q1 2024 (Strong Context):
"The strong market momentum from 2023 spilled over into the first quarter of this year, as global equity markets marched higher on much better-than-feared economic data, an improving corporate earnings picture, and a continuation of the AI mania that dominated last year's market narrative. The MSCI All-Country World Index (ACWI) of global stocks gained 8.2% for the quarter to finish at a new high-water mark, representing its 21st new record high so far this year."

WHY THIS WORKS:
- Sets context: mentions 2023 momentum
- Explains WHY: "much better-than-feared economic data"
- Uses specific numbers: 8.2%, 21st record high
- Tells the STORY: past success → current results

Q2 2024 (Specific Company Impact):
"Just five stocks drove 55% of the S&P's Q2 return, led by strong gains in mega caps NVIDIA (+46%), Microsoft (+33%), Broadcom (+65%), Meta (+28%), and Amazon (+15%)."

WHY THIS WORKS:
- Quantifies concentration: "five stocks drove 55%"
- Shows SPECIFIC company moves with percentages
- Makes impact memorable
- Uses strong language: "strong gains"

Q1 2025 (Market Momentum & Inflection):
"Building on the strong momentum of the prior two years, the MSCI All-Country World Index (ACWI) surged nearly 6% and hit multiple record highs during the first six weeks of 2025, but a steady selloff in risk assets erased those gains and more by quarter's end... After a fast start culminating in the Index's third new record high of the year on February 19th, the S&P 500 Index corrected more than 10% by mid March to record a first quarter loss of 4.3%"

WHY THIS WORKS:
- Describes TIMELINE: "first six weeks... by quarter's end"
- Shows INFLECTION: "started strong but reversed"
- Uses SPECIFIC DATES: "February 19th", "mid March"
- Explains CONSEQUENCE: "snapping a five-quarter win streak"

KEY PRINCIPLES TO FOLLOW:
1. NARRATIVE FLOW: "Beginning → Middle → End" (not just facts)
2. CONTEXT: Always explain WHY things happened
3. SPECIFIC NUMBERS: Use actual percentages for company moves, not vague terms
4. TIMELINE: Reference time periods within quarter (early, mid, late)
5. INFLECTION POINTS: Show turning points (strong start, sudden reversal, etc.)
6. MARKET CONCENTRATION: Quantify which stocks drove returns
7. FORWARD CATALYST: Connect quarter to what comes next
8. INSTITUTIONAL TONE: Use restrained, professional language
`;

const generateReportNarrative = async (report, marketData) => {
  console.log('[Gemini] generateReportNarrative called');
  const { quarter, year } = report;
  const { indices, news, recordHighs } = marketData;

  // Extract index data
  const spyData = indices.SPY.finnhub || indices.SPY.alphaVantage || indices.SPY.polygon;
  const qqqData = indices.QQQ.finnhub || indices.QQQ.alphaVantage || indices.QQQ.polygon;
  const acwxData = indices.ACWX.finnhub || indices.ACWX.polygon;

  const sp500Return = spyData?.return || 0;
  const nasdaqReturn = qqqData?.return || 0;
  const acwiReturn = acwxData?.return || 0;
  const sp500Highs = recordHighs.SPY || 'N/A';
  const nasdaqHighs = recordHighs.QQQ || 'N/A';

  // Determine market direction and sentiment
  const isPositiveQuarter = sp500Return > 0;
  const marketDirection = isPositiveQuarter ? 'rallied' : 'declined';
  const performanceDescriptor = Math.abs(sp500Return) > 10 ? 'strong' : 'modest';

  // Calculate concentration metrics
  const nasdaqSpread = Math.abs(nasdaqReturn - sp500Return);
  const concentrationLevel = nasdaqSpread > 8 ? 'extreme (6-8 stocks likely drove 55-65% of returns)' 
                            : nasdaqSpread > 4 ? 'notable (7-10 stocks likely drove 50% of returns)'
                            : 'broad-based (15+ stocks contributed significantly)';

  const indicesText = `
QUARTERLY MARKET DATA FOR ${quarter} ${year}:
- S&P 500 (SPY): ${sp500Return}% return, ${sp500Highs} record highs
- Nasdaq 100 (QQQ): ${nasdaqReturn}% return, ${nasdaqHighs} record highs
- MSCI ACWI (ACWX): ${acwiReturn}% return
- Performance Direction: ${marketDirection}
- Sentiment: ${performanceDescriptor}
- Market Concentration: ${concentrationLevel}
- Nasdaq/S&P Spread: ${nasdaqSpread.toFixed(2)}%`;

  const newsText = news && news.length > 0
    ? `\nMARKET NEWS & CATALYSTS:\n${news.slice(0, 5).map((n, i) => `- ${i + 1}. ${n.title || n}`).join('\n')}`
    : '';

  const prompt = `You are a professional financial analyst writing quarterly market reports for institutional investors.

${CASE_STUDY_EXAMPLES}

NOW WRITE THE NARRATIVE FOR ${quarter} ${year}:

${indicesText}
${newsText}

REQUIREMENTS FOR YOUR NARRATIVE:
1. NARRATIVE STRUCTURE (Must Follow):
   OPENING: Set the scene objectively
   → Explain what led to this quarter
   → Describe key market themes (avoid drama)
   → Example good opening: "The first quarter of 2025 saw significant market declines as investors reassessed valuations"
   → Example bad opening: "The first quarter shattered the illusion of a bull market"
   
   INDEX PERFORMANCE: Tell the story of how markets moved
   → Use TIMELINE language: "early quarter", "mid-March", "by quarter's end"
   → Show INFLECTION POINTS: did markets start strong then fall? or recover?
   → Include specific return percentages and record highs
   → Use S&P 500 (SPY), Nasdaq (QQQ), MSCI ACWI (ACWX) with full names first mention

2. LANGUAGE & TONE (INSTITUTIONAL - NOT DRAMATIC):
   - Simple, direct: "declined" not "retreated", "rose" not "surged"
   - Short sentences: 10-15 words maximum
   - Action verbs but RESTRAINED: rose, fell, gained, declined, shifted, adjusted
   - AVOID dramatic language: NO "shattered", "brutal", "violent", "plummeted", "crushed"
   - AVOID vague terms: "fickle", "idiosyncratic", "headwinds"
   - Use "but" for turning points, stay objective: "Markets rose early, but declined as earnings disappointed"
   - Match tone of: "The market experienced notable volatility" NOT "The market was battered"

3. COMPANY PERFORMANCE:
   - Include 3+ specific companies with percentages
   - Example: "NVIDIA rose 42%, Microsoft added 15%, Amazon fell 6%"
   - Show which companies drove returns
   - Explain WHY they moved (earnings, guidance, etc.)

4. MARKET CONCENTRATION:
   - Quantify concentration: "Eight stocks drove 55% of returns"
   - Or: "Broad-based participation with 15+ stocks contributing"
   - Tie to the Nasdaq/S&P spread: ${nasdaqSpread.toFixed(2)}%

5. INFLECTION POINTS:
   - Identify where sentiment shifted
   - Use specific dates or timeframes: "mid-February", "late March", "first two weeks"
   - Show transition: "The quarter began with X, but shifted to Y when Z happened"

6. FORWARD-LOOKING CATALYSTS:
   - Name SPECIFIC things to watch
   - Example: "Whether AI capital spending will drive 30% margin expansion"
   - NOT generic: "Monitor geopolitical risks"
   - Connect current quarter to next

WRITE 4-6 PARAGRAPHS following these guidelines.
NO PREAMBLE. START WITH THE NARRATIVE.`;

  try {
    const model = client.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }, { apiVersion: 'v1beta' });
    
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const generationTime = Date.now() - startTime;
    
    const narrative = result.response.text();

    console.log('[Gemini] ✅ Narrative generated in', generationTime, 'ms');
    console.log('[Gemini] Token usage:', result.response.promptTokenCount, 'prompt,', result.response.candidatesTokenCount, 'output');

    return {
      success: true,
      narrative: narrative,
      generationTime: generationTime,
      tokenUsage: {
        promptTokens: result.response.promptTokenCount || 0,
        outputTokens: result.response.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error('[Gemini] ❌ Error generating narrative:', error.message);
    return {
      success: false,
      error: error.message,
      narrative: ''
    };
  }
};

const generateSummary = async (narrative, report) => {
  console.log('[Gemini Summary] Called');
  const { quarter, year } = report;

  const prompt = `You are a financial analyst writing executive summaries for institutional investors.

Write a clear 2-3 sentence executive summary for a ${quarter} ${year} quarterly equity market report.

Based on this narrative:
${narrative}

REQUIREMENTS:
- Use RESTRAINED, INSTITUTIONAL tone (not dramatic)
- Lead with factual market performance, not hyperbole
- Include actual performance metrics (S&P 500 %, Nasdaq %, MSCI ACWI %)
- AVOID: "brutal", "high-octane", "shattered", "violent", "crashed"
- USE: "marked", "saw", "experienced", "shifted", "adjusted"
- Simple language that institutional investors understand
- Factual and measured, not promotional

EXAMPLE GOOD SUMMARY (Institutional Tone):
"Global equity markets posted gains in 2024, with the S&P 500 rising 25.0% and the MSCI ACWI climbing 17.5%. The S&P 500 recorded 57 new record highs while adding significant market value, reflecting broad market participation."

EXAMPLE BAD SUMMARY (Too Dramatic):
"Global equity markets shattered expectations with a brutal rally, posting record gains..."

Generate ONLY the summary, no additional text.`;

  try {
    const model = client.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }, { apiVersion: 'v1beta' });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    console.log('[Gemini Summary] ✅ Generated');
    return summary;
  } catch (error) {
    console.error('[Gemini Summary] ❌ Error:', error.message);
    return '';
  }
};

const generateAnnualNarratives = async (year, quarterDataMap) => {
  console.log(`[Gemini Annual] Generating narratives for ${year}`);

  const { q1, q2, q3, q4 } = quarterDataMap;

  // FIXED: Proper extraction from quarterlyDataSplitter output
  const getReturnData = (quarterData) => {
    try {
      if (!quarterData || !quarterData.indices) {
        console.log('[Gemini Annual] Warning: Missing quarter data');
        return { spy: 0, qqq: 0, acwi: 0 };
      }

      // Extract from polygon data (most reliable source)
      const getReturn = (indexData) => {
        if (!indexData) return 0;
        
        // Try polygon first
        if (indexData.polygon && indexData.polygon.return !== undefined) {
          return indexData.polygon.return;
        }
        
        // Fallback to finnhub
        if (indexData.finnhub && indexData.finnhub.return !== undefined) {
          return indexData.finnhub.return;
        }

        return 0;
      };

      return {
        spy: getReturn(quarterData.indices.SPY),
        qqq: getReturn(quarterData.indices.QQQ),
        acwi: getReturn(quarterData.indices.ACWX)  // Note: ACWX not ACWI
      };
    } catch (error) {
      console.error('[Gemini Annual] Error extracting returns:', error.message);
      return { spy: 0, qqq: 0, acwi: 0 };
    }
  };

  const q1Returns = getReturnData(q1);
  const q2Returns = getReturnData(q2);
  const q3Returns = getReturnData(q3);
  const q4Returns = getReturnData(q4);

  console.log('[Gemini Annual] Extracted returns:');
  console.log(`  Q1: SPY=${q1Returns.spy}%, QQQ=${q1Returns.qqq}%, ACWI=${q1Returns.acwi}%`);
  console.log(`  Q2: SPY=${q2Returns.spy}%, QQQ=${q2Returns.qqq}%, ACWI=${q2Returns.acwi}%`);
  console.log(`  Q3: SPY=${q3Returns.spy}%, QQQ=${q3Returns.qqq}%, ACWI=${q3Returns.acwi}%`);
  console.log(`  Q4: SPY=${q4Returns.spy}%, QQQ=${q4Returns.qqq}%, ACWI=${q4Returns.acwi}%`);

  const prompt = `You are a professional financial analyst writing quarterly market narratives for an annual report covering ${year}.

For EACH quarter, write:
1. ONE paragraph (institutional tone, 3-4 sentences) describing what happened in that quarter
2. ONE bullet point (data insight) about that quarter

Market Data for ${year}:
Q1: S&P 500 ${q1Returns.spy}%, Nasdaq ${q1Returns.qqq}%, MSCI ACWI ${q1Returns.acwi}%
Q2: S&P 500 ${q2Returns.spy}%, Nasdaq ${q2Returns.qqq}%, MSCI ACWI ${q2Returns.acwi}%
Q3: S&P 500 ${q3Returns.spy}%, Nasdaq ${q3Returns.qqq}%, MSCI ACWI ${q3Returns.acwi}%
Q4: S&P 500 ${q4Returns.spy}%, Nasdaq ${q4Returns.qqq}%, MSCI ACWI ${q4Returns.acwi}%

IMPORTANT:
- Use institutional language (no "brutal", "shattered", "violent")
- One paragraph per quarter (3-4 sentences each)
- One bullet point per quarter
- Include specific numbers and facts
- Mention inflection points and market drivers
- Professional tone throughout

Format your response EXACTLY like this:

Q1_NARRATIVE: [Your Q1 paragraph here]
Q1_BULLET: [Your Q1 bullet point here]
Q2_NARRATIVE: [Your Q2 paragraph here]
Q2_BULLET: [Your Q2 bullet point here]
Q3_NARRATIVE: [Your Q3 paragraph here]
Q3_BULLET: [Your Q3 bullet point here]
Q4_NARRATIVE: [Your Q4 paragraph here]
Q4_BULLET: [Your Q4 bullet point here]`;

  try {
    const model = client.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }, { apiVersion: 'v1beta' });
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const generationTime = Date.now() - startTime;

    const responseText = result.response.text();
    console.log('[Gemini Annual] Response (first 300 chars):', responseText.substring(0, 300));

    // FIXED: Better parsing that handles various formats
    const extractField = (text, fieldName) => {
      // Try exact format first
      let regex = new RegExp(`${fieldName}:\\s*(.+?)(?=\\nQ\\d_|$)`, 's');
      let match = text.match(regex);
      
      if (match && match[1]) {
        return match[1].trim();
      }

      // Fallback: look for field name and capture until next field or end
      regex = new RegExp(`${fieldName}[:\\s]*([^\\n]*(?:\\n(?!Q\\d_)[^\\n]*)*)`, 's');
      match = text.match(regex);
      
      if (match && match[1]) {
        return match[1].trim();
      }

      console.warn(`[Gemini Annual] Could not parse ${fieldName}`);
      return '';
    };

    const q1Narrative = extractField(responseText, 'Q1_NARRATIVE');
    const q1Bullet = extractField(responseText, 'Q1_BULLET');
    const q2Narrative = extractField(responseText, 'Q2_NARRATIVE');
    const q2Bullet = extractField(responseText, 'Q2_BULLET');
    const q3Narrative = extractField(responseText, 'Q3_NARRATIVE');
    const q3Bullet = extractField(responseText, 'Q3_BULLET');
    const q4Narrative = extractField(responseText, 'Q4_NARRATIVE');
    const q4Bullet = extractField(responseText, 'Q4_BULLET');

    console.log('[Gemini Annual] ✅ Parsed narratives and bullets');

    return {
      success: true,
      q1: { narrative: q1Narrative, bulletPoint: q1Bullet },
      q2: { narrative: q2Narrative, bulletPoint: q2Bullet },
      q3: { narrative: q3Narrative, bulletPoint: q3Bullet },
      q4: { narrative: q4Narrative, bulletPoint: q4Bullet },
      generationTime,
      tokenUsage: {
        promptTokens: result.response.promptTokenCount || 0,
        outputTokens: result.response.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error('[Gemini Annual] ❌ Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};




module.exports = {
  generateReportNarrative,
  generateSummary,
  generateAnnualNarratives
};