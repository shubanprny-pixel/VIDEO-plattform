export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ruled-paper flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-sm border border-rule bg-paper-raised p-8 shadow-[3px_3px_0_0_var(--rule)]">
        {children}
      </div>
    </div>
  );
}
