import { setRequestLocale } from 'next-intl/server';
import { ClerkLocaleProvider } from '@/app/[locale]/ClerkLocaleProvider';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <ClerkLocaleProvider locale={locale}>
      {props.children}
    </ClerkLocaleProvider>
  );
}
