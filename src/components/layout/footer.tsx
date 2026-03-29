export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 py-6">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CoffeeJG. All rights reserved.
      </div>
    </footer>
  );
}
