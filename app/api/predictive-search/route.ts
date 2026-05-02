import { NextRequest, NextResponse } from 'next/server';
import { predictiveSearch } from '@features/search/api/predictive-search';

export async function POST(req: NextRequest) {
  const { query, locale } = await req.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const result = await predictiveSearch({ query, locale });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching predictive search results:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
