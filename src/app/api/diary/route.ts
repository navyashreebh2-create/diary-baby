import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import DiaryEntry from '@/lib/models/DiaryEntry';
import { generateAIReply } from '@/lib/openai';

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    await connectDB();

    const entries = await DiaryEntry.find({ userId })
      .sort({ createdAt: -1 })
      .select('-userId')
      .lean();

    return NextResponse.json(
      { entries },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get diary entries error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    const { content, openaiApiKey } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Please write something before submitting' },
        { status: 400 }
      );
    }

    if (!openaiApiKey || !openaiApiKey.trim()) {
      return NextResponse.json(
        { error: 'OpenAI API key is required to generate AI responses' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > 5000) {
      return NextResponse.json(
        { error: 'Entry content is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    const aiReply = await generateAIReply(trimmedContent, openaiApiKey.trim());

    await connectDB();

    const entry = new DiaryEntry({
      userId,
      content: trimmedContent,
      aiReply
    });

    await entry.save();

    const responseEntry = {
      id: entry._id,
      content: entry.content,
      aiReply: entry.aiReply,
      createdAt: entry.createdAt
    };

    return NextResponse.json(
      { entry: responseEntry },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create diary entry error:', error);

    if (error.message.includes('OpenAI API key')) {
      return NextResponse.json(
        { error: error.message },
        { status: 402 }
      );
    }

    if (error.message.includes('Network error')) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to generate AI response. Please try again.' },
      { status: 500 }
    );
  }
}