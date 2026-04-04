'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('access_token');
    redirect('/login');
}
