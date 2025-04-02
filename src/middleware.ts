// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get('token')?.value;

//   const isAuthPage = req.nextUrl.pathname === '/signin';
//   const isProtectedRoute = !isAuthPage;

//   if (!token && isProtectedRoute) {
//     return NextResponse.redirect(new URL('/signin', req.url));
//   }

//   if (token && isAuthPage) {
//     return NextResponse.redirect(new URL('/', req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/:path*'],
// };

import { NextResponse } from 'next/server'; 
import type { NextRequest } from 'next/server'; 

export function middleware(req: NextRequest) { 

  const token = req.cookies.get('token')?.value; // Obtém o token do cookie 

  const isAuthRoute = req.nextUrl.pathname === '/signin'; 

  const isPublicRoute = isAuthRoute || req.nextUrl.pathname.startsWith('/api'); 

  if (!token && !isPublicRoute) { // Redireciona para /signIn se não estiver autenticado 

  const loginUrl = new URL('/signin', req.url); 

  return NextResponse.redirect(loginUrl); 
  
  } // Permite acesso às rotas públicas ou se o token estiver presente 

  return NextResponse.next(); 

} 

export const config = { 
  matcher: ['/((?!api|_next/static|_next/image|public|images/*.jpg|favicon.ico).*)'], 
}; 
