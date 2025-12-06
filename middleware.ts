import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  const response = NextResponse.next()
  
  // Required headers for SharedArrayBuffer (used by ffmpeg.wasm)
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  
  return response
}

export const config = {
  matcher: '/:path*',
}

