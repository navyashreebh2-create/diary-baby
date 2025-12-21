import OpenAI from 'openai';

const SYSTEM_PROMPT = "You are the user's private diary companion. Respond gently and honestly, in a calm and supportive tone.";

export async function generateAIReply(content: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: content,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error('No response generated from OpenAI');
    }

    return reply;
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
    }

    if (error.status === 429) {
      throw new Error('OpenAI API quota exceeded. Please check your billing details and try again.');
    }

    if (error.status === 500 || error.status === 502 || error.status === 503) {
      throw new Error('OpenAI service temporarily unavailable. Please try again later.');
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      throw new Error('Network error. Please check your internet connection.');
    }

    throw new Error('Unable to generate AI response. Please try again.');
  }
}