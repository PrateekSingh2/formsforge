import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { audienceData } = await request.json();

    if (!audienceData || !Array.isArray(audienceData)) {
      return NextResponse.json({ error: 'Invalid audience data' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is missing' }, { status: 500 });
    }

    // Summarize the data to prevent passing too many tokens
    const totalUsers = audienceData.length;
    const activeUsers = audienceData.filter(u => u.status === 'Active').length;
    const inactiveUsers = audienceData.filter(u => u.status === 'Inactive').length;
    const topSubmitters = [...audienceData].sort((a, b) => b.forms - a.forms).slice(0, 3).map(u => ({ email: u.email, forms: u.forms }));

    const prompt = `
      You are an expert CRM and Audience Data Analyst. Analyze the following summary of my audience data and provide 3 quick, bulleted, and highly actionable business insights or recommendations.
      Keep it extremely concise and professional. Do not use filler words.

      Total Contacts: ${totalUsers}
      Active Contacts: ${activeUsers}
      Inactive Contacts: ${inactiveUsers}
      Top Submitters: ${JSON.stringify(topSubmitters)}
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 300,
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Groq API Error:", errData);
      throw new Error(`Groq API responded with status ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No analysis could be generated.";

    return NextResponse.json({ analysis: result });
  } catch (error) {
    console.error('Error analyzing audience:', error);
    return NextResponse.json({ error: 'Failed to analyze audience' }, { status: 500 });
  }
}
