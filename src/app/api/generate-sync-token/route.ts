import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    
    if (!secret) {
      console.error("NEXTAUTH_SECRET is not defined");
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    // Generate token valid for 1 hour
    const token = jwt.sign(
      { userId: session.user.id },
      secret,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Error generating sync token:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
