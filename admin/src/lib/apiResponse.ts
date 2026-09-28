import { NextResponse } from 'next/server';

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId?: string;
  details?: any;
}

export function apiSuccess<T = any>(data: T, status = 200, meta?: Record<string, any>) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function apiError(
  message: string,
  status = 500,
  code = 'INTERNAL_ERROR',
  details?: any
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        requestId,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}
