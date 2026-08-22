import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';

// Handle CORS for preflight requests from leetcode.com
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', 'https://leetcode.com');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(req: Request) {
  // CORS Headers for the actual response
  const headers = {
    'Access-Control-Allow-Origin': 'https://leetcode.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401, headers });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      console.error("NEXTAUTH_SECRET is not defined");
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401, headers });
    }

    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401, headers });
    }

    const body = await req.json();
    const problems = body.problems;

    if (!Array.isArray(problems)) {
      return NextResponse.json({ error: 'Invalid payload format. Expected problems array.' }, { status: 400, headers });
    }

    // Map the incoming payload to match the Prisma schema
    const dataToInsert = problems.map((p: any) => ({
      userId,
      leetcodeId: parseInt(p.questionId, 10), // CRITICAL: Parse to integer
      title: p.title,
      titleSlug: p.titleSlug,
      difficulty: 'Unknown', // We don't get difficulty from the basic list, fallback to Unknown
      pattern: 'Unknown',    // Default pattern
      // FSRS Core State Defaults
      state: 0,
      stability: 0,
      difficultyWeight: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      learningSteps: 0,
    })).filter((p: any) => !isNaN(p.leetcodeId)); // Filter out any that failed to parse

    // Execute synchronous batch insert using createMany with skipDuplicates
    const result = await prisma.problem.createMany({
      data: dataToInsert,
      skipDuplicates: true, // Requires the @@unique([userId, leetcodeId]) constraint
    });

    // Bust the Next.js cache for the dashboard and problems page
    revalidatePath('/');
    revalidatePath('/problems');

    return NextResponse.json({ 
      success: true, 
      message: 'Sync successful', 
      count: result.count 
    }, { status: 200, headers });

  } catch (error) {
    console.error("Error during bulk import:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
  }
}
