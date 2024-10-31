import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useNavigationConfirm(shouldConfirm: boolean) {
    const router = useRouter();

    const handleNavigation = useCallback(
        (href: string) => {
            if (shouldConfirm && !window.confirm('Are you sure you want to navigate out of this page? This will end your session.')) {
                return;
            }
            router.push(href);
        },
        [shouldConfirm, router]
    );

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (shouldConfirm) {
                e.preventDefault();
            }
        };

        window.addEventListener('beforeUnload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeUnload', handleBeforeUnload);
        };
    }, [shouldConfirm]);

    return handleNavigation;
}
