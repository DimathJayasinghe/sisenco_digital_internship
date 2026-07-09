import { RegisterForm } from './RegisterForm';

export default function RegisterPage(): React.ReactNode {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-8 dark:bg-zinc-950">
      <RegisterForm />
    </main>
  );
}
