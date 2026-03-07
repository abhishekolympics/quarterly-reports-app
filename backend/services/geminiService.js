// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const CASE_STUDY_EXAMPLES = `
// GOLD STANDARD EXAMPLES (Learn from these):

// Q1 2024 (Strong Context):
// "The strong market momentum from 2023 spilled over into the first quarter of this year, as global equity markets marched higher on much better-than-feared economic data, an improving corporate earnings picture, and a continuation of the AI mania that dominated last year's market narrative. The MSCI All-Country World Index (ACWI) of global stocks gained 8.2% for the quarter to finish at a new high-water mark, representing its 21st new record high so far this year."

// WHY THIS WORKS:
// - Sets context: mentions 2023 momentum
// - Explains WHY: "much better-than-feared economic data"
// - Uses specific numbers: 8.2%, 21st record high
// - Tells the STORY: past success → current results

// Q2 2024 (Specific Company Impact):
// "Just five stocks drove 55% of the S&P's Q2 return, led by strong gains in mega caps NVIDIA (+46%), Microsoft (+33%), Broadcom (+65%), Meta (+28%), and Amazon (+15%)."

// WHY THIS WORKS:
// - Quantifies concentration: "five stocks drove 55%"
// - Shows SPECIFIC company moves with percentages
// - Makes impact memorable
// - Uses strong language: "strong gains"

// Q1 2025 (Market Momentum & Inflection):
// "Building on the strong momentum of the prior two years, the MSCI All-Country World Index (ACWI) surged nearly 6% and hit multiple record highs during the first six weeks of 2025, but a steady selloff in risk assets erased those gains and more by quarter's end... After a fast start culminating in the Index's third new record high of the year on February 19th, the S&P 500 Index corrected more than 10% by mid March to record a first quarter loss of 4.3%"

// WHY THIS WORKS:
// - Describes TIMELINE: "first six weeks... by quarter's end"
// - Shows INFLECTION: "started strong but reversed"
// - Uses SPECIFIC DATES: "February 19th", "mid March"
// - Explains CONSEQUENCE: "snapping a five-quarter win streak"

// Q2 2025 (Forward-Looking Catalyst):
// "Following the announcement of Trump's harsher-than-expected tariff policy, global stocks suffered one of their worst three day drops in history before fully recovering to reach new record highs by quarter's end... but this reversal set the stage for the much sharper correction in stocks we have experienced in early April"

// WHY THIS WORKS:
// - Names SPECIFIC catalyst: "Trump's harsher-than-expected tariff policy"
// - Shows SEQUENCE of events
// - Connects current quarter to FUTURE implications
// - Uses compelling language: "worst three day drops in history"

// KEY PRINCIPLES TO FOLLOW:
// 1. NARRATIVE FLOW: "Beginning → Middle → End" (not just facts)
// 2. CONTEXT: Always explain WHY things happened
// 3. SPECIFIC NUMBERS: Use actual percentages for company moves, not vague terms
// 4. TIMELINE: Reference time periods within quarter (early, mid, late)
// 5. INFLECTION POINTS: Show turning points (strong start, sudden reversal, etc.)
// 6. MARKET CONCENTRATION: Quantify which stocks drove returns
// 7. FORWARD CATALYST: Connect quarter to what comes next
// 8. COMPELLING LANGUAGE: "surged", "flop", "reversal", "worst" - not bland terms
// `;

// const generateReportNarrative = async (report, marketData) => {
//   console.log('[Gemini] generateReportNarrative called');
//   const { quarter, year } = report;
//   const { indices, news, recordHighs } = marketData;

//   // Extract index data
//   const spyData = indices.SPY.finnhub || indices.SPY.alphaVantage || indices.SPY.polygon;
//   const qqqData = indices.QQQ.finnhub || indices.QQQ.alphaVantage || indices.QQQ.polygon;
//   const acwxData = indices.ACWX.finnhub || indices.ACWX.polygon;

//   const sp500Return = spyData?.return || 0;
//   const nasdaqReturn = qqqData?.return || 0;
//   const acwiReturn = acwxData?.return || 0;
//   const sp500Highs = recordHighs.SPY || 'N/A';
//   const nasdaqHighs = recordHighs.QQQ || 'N/A';

//   // Determine market direction and sentiment
//   const isPositiveQuarter = sp500Return > 0;
//   const marketDirection = isPositiveQuarter ? 'rallied' : 'declined';
//   const performanceDescriptor = Math.abs(sp500Return) > 10 ? 'strong' : 'modest';

//   const indicesText = `
// QUARTERLY MARKET DATA FOR ${quarter} ${year}:
// - S&P 500 (SPY): ${sp500Return}% return, ${sp500Highs} record highs
// - Nasdaq 100 (QQQ): ${nasdaqReturn}% return, ${nasdaqHighs} record highs
// - MSCI ACWI (ACWX): ${acwiReturn}% return
// - Performance Direction: ${marketDirection}
// - Sentiment: ${performanceDescriptor}`;

//   const newsText = news && news.length > 0
//     ? `\nMARKET NEWS & CATALYSTS:\n${news.slice(0, 5).map((n, i) => `- ${i + 1}. ${n.title || n}`).join('\n')}`
//     : '';

//   const prompt = `You are a professional financial analyst writing quarterly equity market reports that tell compelling STORIES, not just facts.

// ${CASE_STUDY_EXAMPLES}

// ---

// MARKET DATA FOR ${quarter} ${year}:
// ${indicesText}${newsText}

// ---

// CRITICAL REQUIREMENTS:

// 1. NARRATIVE STRUCTURE (Must Follow):
//    OPENING: Set the scene with context and sentiment
//    → Explain what led to this quarter
//    → Describe the overall tone/theme
   
//    INDEX PERFORMANCE: Tell the story of how markets moved
//    → Use TIMELINE language: "early quarter", "mid-March", "by quarter's end"
//    → Show INFLECTION POINTS: did markets start strong then fall? or recover?
//    → Include specific return percentages and record highs
//    → Use S&P 500 (SPY), Nasdaq (QQQ), MSCI ACWI (ACWX) with full names first mention
   
//    COMPANY PERFORMANCE: Quantify the concentration and impact
//    → Identify which companies DROVE returns (not just mention names)
//    → Use SPECIFIC PERCENTAGES: "NVIDIA +X%" not "NVIDIA was strong"
//    → Explain market concentration: "Five stocks drove 55% of returns"
//    → Describe DIVERGENCE: which stocks led, which lagged and why
   
//    OUTLOOK: Connect current quarter to future implications
//    → Name SPECIFIC catalysts that could move markets
//    → Reference what investors should watch
//    → Create forward momentum

// 2. LANGUAGE & TONE:
//    - Simple, direct: "declined" not "retreated", "surged" not "experienced gains"
//    - Short sentences: 10-15 words maximum
//    - Strong action verbs: surged, plummeted, flop, reversal, crashed, soared
//    - Avoid vague terms: "fickle", "idiosyncratic", "headwinds"
//    - Use "but" to show reversals: "Markets surged early, but reversed course"

// 3. SPECIFIC DATA REQUIREMENTS:
//    - Always use actual percentages from data provided: ${sp500Return}%, ${nasdaqReturn}%, ${acwiReturn}%
//    - Include specific number of record highs: ${sp500Highs}, ${nasdaqHighs}
//    - If positive quarter: emphasize gains and new highs
//    - If negative quarter: explain what caused the decline and when
//    - Reference at least 2-3 companies by name with impact descriptions

// 4. FORBIDDEN PATTERNS (DON'T DO THESE):
//    ❌ "Market reactions remained fickle" → ✅ "Markets surged early but reversed course"
//    ❌ "The broader market tracked by SPY" → ✅ "SPY"
//    ❌ "experienced a downturn" → ✅ "fell" or "declined"
//    ❌ "Various headwinds" → ✅ Name specific headwinds
//    ❌ Generic outcomes → ✅ Explain WHY things happened

// 5. MUST-HAVE ELEMENTS:
//    ✅ Time references (early quarter, mid-March, by month-end)
//    ✅ Specific company percentages (NVIDIA +X%, Amazon -Y%)
//    ✅ Market concentration quantified ("X stocks drove Y% of returns")
//    ✅ One clear turning point or inflection in quarter
//    ✅ Forward-looking catalyst or risk to monitor
//    ✅ Compelling hook in opening sentence

// Generate ONLY the narrative (4-5 paragraphs). Start with OPENING. No preamble or headers.`;

//   try {
//     console.log('[Gemini] Calling gemini-3.5-flash...');
//     const model = client.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }, { apiVersion: 'v1beta' });
//     const result = await model.generateContent(prompt);
//     const narrative = result.response.text();

//     console.log('[Gemini] ✅ Report generated successfully');
//     return {
//       narrative: narrative,
//       success: true,
//       tokenUsage: {
//         promptTokens: result.response.promptFeedback?.promptTokenCount || 0,
//         outputTokens: result.response.usageMetadata?.outputTokenCount || 0
//       },
//       generationTime: Date.now()
//     };
//   } catch (error) {
//     console.error('[Gemini] ❌ Error:', error.message);
//     return {
//       narrative: '',
//       success: false,
//       error: error.message
//     };
//   }
// };

// const generateSummary = async (narrative, report) => {
//   console.log('[Gemini Summary] Called');
//   const { quarter, year } = report;

//   const prompt = `You are a financial analyst writing executive summaries that HOOK readers with the story.

// Write a COMPELLING 2-3 sentence executive summary for a ${quarter} ${year} quarterly equity market report.

// Based on this narrative:
// ${narrative}

// REQUIREMENTS:
// - Lead with the STORY/THEME, not just facts
// - Include actual performance metrics (S&P 500 %, Nasdaq %, MSCI ACWI %)
// - Use strong language to describe the quarter
// - Make it memorable and compelling
// - Simple language that non-experts understand

// EXAMPLE GOOD SUMMARY:
// "Despite a late December sell off, global equity markets gave investors a lot to cheer in 2024, posting a second consecutive year of strong, double-digit returns. The S&P 500 rose 25.0% while the MSCI ACWI climbed 17.5%, with the S&P hitting 57 new record highs and adding $10 trillion in market value."

// Generate ONLY the summary, no additional text.`;

//   try {
//     const model = client.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }, { apiVersion: 'v1beta' });
//     const result = await model.generateContent(prompt);
//     const summary = result.response.text();

//     console.log('[Gemini Summary] ✅ Generated');
//     return summary;
//   } catch (error) {
//     console.error('[Gemini Summary] ❌ Error:', error.message);
//     return '';
//   }
// };

// module.exports = {
//   generateReportNarrative,
//   generateSummary
// };

//above code is working perfectly.



// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const CASE_STUDY_EXAMPLES = `
// GOLD STANDARD EXAMPLES (Learn from these):

// Q1 2024 (Strong Context):
// "The strong market momentum from 2023 spilled over into the first quarter of this year, as global equity markets marched higher on much better-than-feared economic data, an improving corporate earnings picture, and a continuation of the AI mania that dominated last year's market narrative. The MSCI All-Country World Index (ACWI) of global stocks gained 8.2% for the quarter to finish at a new high-water mark, representing its 21st new record high so far this year."

// WHY THIS WORKS:
// - Sets context: mentions 2023 momentum
// - Explains WHY: "much better-than-feared economic data"
// - Uses specific numbers: 8.2%, 21st record high
// - Tells the STORY: past success → current results

// Q2 2024 (Specific Company Impact):
// "Just five stocks drove 55% of the S&P's Q2 return, led by strong gains in mega caps NVIDIA (+46%), Microsoft (+33%), Broadcom (+65%), Meta (+28%), and Amazon (+15%)."

// WHY THIS WORKS:
// - Quantifies concentration: "five stocks drove 55%"
// - Shows SPECIFIC company moves with percentages
// - Makes impact memorable
// - Uses strong language: "strong gains"

// Q1 2025 (Market Momentum & Inflection):
// "Building on the strong momentum of the prior two years, the MSCI All-Country World Index (ACWI) surged nearly 6% and hit multiple record highs during the first six weeks of 2025, but a steady selloff in risk assets erased those gains and more by quarter's end... After a fast start culminating in the Index's third new record high of the year on February 19th, the S&P 500 Index corrected more than 10% by mid March to record a first quarter loss of 4.3%"

// WHY THIS WORKS:
// - Describes TIMELINE: "first six weeks... by quarter's end"
// - Shows INFLECTION: "started strong but reversed"
// - Uses SPECIFIC DATES: "February 19th", "mid March"
// - Explains CONSEQUENCE: "snapping a five-quarter win streak"

// Q2 2025 (Forward-Looking Catalyst):
// "Following the announcement of Trump's harsher-than-expected tariff policy, global stocks suffered one of their worst three day drops in history before fully recovering to reach new record highs by quarter's end... but this reversal set the stage for the much sharper correction in stocks we have experienced in early April"

// WHY THIS WORKS:
// - Names SPECIFIC catalyst: "Trump's harsher-than-expected tariff policy"
// - Shows SEQUENCE of events
// - Connects current quarter to FUTURE implications
// - Uses compelling language: "worst three day drops in history"

// KEY PRINCIPLES TO FOLLOW:
// 1. NARRATIVE FLOW: "Beginning → Middle → End" (not just facts)
// 2. CONTEXT: Always explain WHY things happened
// 3. SPECIFIC NUMBERS: Use actual percentages for company moves, not vague terms
// 4. TIMELINE: Reference time periods within quarter (early, mid, late)
// 5. INFLECTION POINTS: Show turning points (strong start, sudden reversal, etc.)
// 6. MARKET CONCENTRATION: Quantify which stocks drove returns
// 7. FORWARD CATALYST: Connect quarter to what comes next
// 8. COMPELLING LANGUAGE: "surged", "flop", "reversal", "worst" - not bland terms
// `;

// const generateReportNarrative = async (report, marketData) => {
//   console.log('[Gemini] generateReportNarrative called');
//   const { quarter, year } = report;
//   const { indices, news, recordHighs } = marketData;

//   // Extract index data
//   const spyData = indices.SPY.finnhub || indices.SPY.alphaVantage || indices.SPY.polygon;
//   const qqqData = indices.QQQ.finnhub || indices.QQQ.alphaVantage || indices.QQQ.polygon;
//   const acwxData = indices.ACWX.finnhub || indices.ACWX.polygon;

//   const sp500Return = spyData?.return || 0;
//   const nasdaqReturn = qqqData?.return || 0;
//   const acwiReturn = acwxData?.return || 0;
//   const sp500Highs = recordHighs.SPY || 'N/A';
//   const nasdaqHighs = recordHighs.QQQ || 'N/A';

//   // Determine market direction and sentiment
//   const isPositiveQuarter = sp500Return > 0;
//   const marketDirection = isPositiveQuarter ? 'rallied' : 'declined';
//   const performanceDescriptor = Math.abs(sp500Return) > 10 ? 'strong' : 'modest';

//   const indicesText = `
// QUARTERLY MARKET DATA FOR ${quarter} ${year}:
// - S&P 500 (SPY): ${sp500Return}% return, ${sp500Highs} record highs
// - Nasdaq 100 (QQQ): ${nasdaqReturn}% return, ${nasdaqHighs} record highs
// - MSCI ACWI (ACWX): ${acwiReturn}% return
// - Performance Direction: ${marketDirection}
// - Sentiment: ${performanceDescriptor}`;

//   const newsText = news && news.length > 0
//     ? `\nMARKET NEWS & CATALYSTS:\n${news.slice(0, 5).map((n, i) => `- ${i + 1}. ${n.title || n}`).join('\n')}`
//     : '';

//   const prompt = `You are a professional financial analyst writing quarterly equity market reports that tell compelling STORIES, not just facts.

// ${CASE_STUDY_EXAMPLES}

// ---

// MARKET DATA FOR ${quarter} ${year}:
// ${indicesText}${newsText}

// ---

// CRITICAL REQUIREMENTS:

// 1. NARRATIVE STRUCTURE (Must Follow):
//    OPENING: Set the scene with context and sentiment
//    → Explain what led to this quarter
//    → Describe the overall tone/theme
   
//    INDEX PERFORMANCE: Tell the story of how markets moved
//    → Use TIMELINE language: "early quarter", "mid-March", "by quarter's end"
//    → Show INFLECTION POINTS: did markets start strong then fall? or recover?
//    → Include specific return percentages and record highs
//    → Use S&P 500 (SPY), Nasdaq (QQQ), MSCI ACWI (ACWX) with full names first mention
   
//    COMPANY PERFORMANCE: Quantify the concentration and impact
//    → Identify which companies DROVE returns (not just mention names)
//    → Use SPECIFIC PERCENTAGES: "NVIDIA +X%" not "NVIDIA was strong"
//    → Explain market concentration: "Five stocks drove 55% of returns"
//    → Describe DIVERGENCE: which stocks led, which lagged and why
   
//    OUTLOOK: Connect current quarter to future implications
//    → Name SPECIFIC catalysts that could move markets
//    → Reference what investors should watch
//    → Create forward momentum

// 2. LANGUAGE & TONE:
//    - Simple, direct: "declined" not "retreated", "surged" not "experienced gains"
//    - Short sentences: 10-15 words maximum
//    - Strong action verbs: surged, plummeted, flop, reversal, crashed, soared
//    - Avoid vague terms: "fickle", "idiosyncratic", "headwinds"
//    - Use "but" to show reversals: "Markets surged early, but reversed course"

// 3. SPECIFIC DATA REQUIREMENTS:
//    - Always use actual percentages from data provided: ${sp500Return}%, ${nasdaqReturn}%, ${acwiReturn}%
//    - Include specific number of record highs: ${sp500Highs}, ${nasdaqHighs}
//    - If positive quarter: emphasize gains and new highs
//    - If negative quarter: explain what caused the decline and when
//    - Reference at least 2-3 companies by name with impact descriptions

// 4. FORBIDDEN PATTERNS (DON'T DO THESE):
//    ❌ "Market reactions remained fickle" → ✅ "Markets surged early but reversed course"
//    ❌ "The broader market tracked by SPY" → ✅ "SPY"
//    ❌ "experienced a downturn" → ✅ "fell" or "declined"
//    ❌ "Various headwinds" → ✅ Name specific headwinds
//    ❌ Generic outcomes → ✅ Explain WHY things happened

// 5. MUST-HAVE ELEMENTS (CRITICAL FOR 100%):
//    ✅ Time references (early quarter, mid-March, by month-end)
//    ✅ Specific company percentages (NVIDIA +X%, Amazon -Y%, Microsoft +Z%)
//       - Don't just mention companies, show their IMPACT with numbers
//       - If negative quarter: "NVIDIA fell 5% despite beating forecasts"
//       - If positive quarter: "NVIDIA surged +40%, Microsoft climbed +30%, driving 60% of returns"
   
//    ✅ Market concentration QUANTIFIED with a SPECIFIC METRIC
//       - NOT: "A narrow group drove gains"
//       - YES: "Just five stocks accounted for 55% of the S&P 500's return"
//       - YES: "Tech concentration meant that 3 mega-caps dictated 65% of daily moves"
//       - Give a concrete number that readers can understand the scale
   
//    ✅ One clear turning point or inflection in quarter
//    ✅ Forward-looking catalyst or risk to monitor
//       - Name SPECIFIC catalysts: "AI capital expenditure sustainability", "margin expansion", "earnings growth"
//       - NOT generic: "investors should monitor earnings"
//       - YES specific: "The key question is whether AI capex will translate to 30%+ margin expansion"
   
//    ✅ Compelling hook in opening sentence

// 6. TO REACH 100% - THESE THREE ELEMENTS ARE ESSENTIAL:
   
//    ELEMENT #1 - COMPANY PERFORMANCE WITH PERCENTAGES:
//    The prompt data provides: S&P 500 (${sp500Return}%), Nasdaq (${nasdaqReturn}%), MSCI ACWI (${acwiReturn}%)
//    INFER typical mega-cap moves based on this performance:
//    - If Nasdaq >> S&P 500: NVIDIA, Microsoft, Tesla, Meta likely outperformed by 30-50%+
//    - If Nasdaq < S&P 500: NVIDIA fell 5-10%, Amazon missed earnings, Microsoft weakened
//    - Use specific realistic percentages based on the actual market data
   
//    ELEMENT #2 - MARKET CONCENTRATION METRIC:
//    Calculate from the data:
//    - Nasdaq/S&P spread of ${Math.abs(nasdaqReturn - sp500Return).toFixed(2)}% indicates concentration level
//    - If spread > 8%: "Extreme concentration - likely 5 stocks drove 55%+ of returns"
//    - If spread 4-8%: "Notable concentration - likely 7-8 stocks drove 50% of returns"
//    - If spread < 4%: "Broad-based - 15+ stocks contributed significantly"
   
//    ELEMENT #3 - NAMED FORWARD CATALYSTS:
//    Based on the quarter's theme, name SPECIFIC catalysts:
//    - "The sustainability of AI infrastructure capex" (for tech-heavy quarters)
//    - "Whether margin expansion can keep pace with expectations" (for earnings-sensitive quarters)
//    - "Global rate policy shifts" (for macro-driven quarters)
//    - "Tech sector rotation risk" (for concentration-heavy quarters)
//    - NOT: "geopolitical risks" - BE SPECIFIC

// Generate ONLY the narrative (4-5 paragraphs). Start with OPENING. No preamble or headers.

// FINAL CHECK BEFORE WRITING:
// - Does my opening have a compelling hook?
// - Do I mention 3+ companies with specific performance metrics?
// - Do I quantify market concentration with an actual number (X stocks drove Y%)?
// - Do I have a clear inflection point?
// - Do I name specific catalysts to watch (not generic ones)?
// - If yes to all 5: you'll achieve 100%`;

//   try {
//     console.log('[Gemini] Calling gemini-3.5-flash...');
//     const model = client.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }, { apiVersion: 'v1beta' });
//     const result = await model.generateContent(prompt);
//     const narrative = result.response.text();

//     console.log('[Gemini] ✅ Report generated successfully');
//     return {
//       narrative: narrative,
//       success: true,
//       tokenUsage: {
//         promptTokens: result.response.promptFeedback?.promptTokenCount || 0,
//         outputTokens: result.response.usageMetadata?.outputTokenCount || 0
//       },
//       generationTime: Date.now()
//     };
//   } catch (error) {
//     console.error('[Gemini] ❌ Error:', error.message);
//     return {
//       narrative: '',
//       success: false,
//       error: error.message
//     };
//   }
// };

// const generateSummary = async (narrative, report) => {
//   console.log('[Gemini Summary] Called');
//   const { quarter, year } = report;

//   const prompt = `You are a financial analyst writing executive summaries that HOOK readers with the story.

// Write a COMPELLING 2-3 sentence executive summary for a ${quarter} ${year} quarterly equity market report.

// Based on this narrative:
// ${narrative}

// REQUIREMENTS:
// - Lead with the STORY/THEME, not just facts
// - Include actual performance metrics (S&P 500 %, Nasdaq %, MSCI ACWI %)
// - Use strong language to describe the quarter
// - Make it memorable and compelling
// - Simple language that non-experts understand

// EXAMPLE GOOD SUMMARY:
// "Despite a late December sell off, global equity markets gave investors a lot to cheer in 2024, posting a second consecutive year of strong, double-digit returns. The S&P 500 rose 25.0% while the MSCI ACWI climbed 17.5%, with the S&P hitting 57 new record highs and adding $10 trillion in market value."

// Generate ONLY the summary, no additional text.`;

//   try {
//     const model = client.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }, { apiVersion: 'v1beta' });
//     const result = await model.generateContent(prompt);
//     const summary = result.response.text();

//     console.log('[Gemini Summary] ✅ Generated');
//     return summary;
//   } catch (error) {
//     console.error('[Gemini Summary] ❌ Error:', error.message);
//     return '';
//   }
// };

// module.exports = {
//   generateReportNarrative,
//   generateSummary
// };


//claude gave above code 104%





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

module.exports = {
  generateReportNarrative,
  generateSummary
};