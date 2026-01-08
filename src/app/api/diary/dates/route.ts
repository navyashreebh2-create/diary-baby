import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import DiaryEntry from '@/lib/models/DiaryEntry';

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

    // Get all entries for the user and extract dates
    const entries = await DiaryEntry.find({ userId })
      .select('createdAt')
      .lean();

    // Extract dates in YYYY-MM-DD format for calendar highlighting
    const dates = entries.map(entry => {
      const date = new Date(entry.createdAt);
      // Convert to local YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    // Remove duplicates and sort
    const uniqueDates = Array.from(new Set(dates)).sort();

    return NextResponse.json(
      { dates: uniqueDates },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get diary dates error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
