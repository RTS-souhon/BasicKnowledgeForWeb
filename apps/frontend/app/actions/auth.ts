'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction(): Promise<void> {
    const cookieStore = await cookies();
    const hadAuthToken = cookieStore.get('auth_token')?.value != null;
    cookieStore.delete('auth_token');
    cookieStore.delete('access_token');
    redirect(hadAuthToken ? '/login' : '/access');
}
