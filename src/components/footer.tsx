import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} By{' '}
      <Button variant="link" className="p-0" asChild>
        <a
          href="https://github.com/iguit0"
          target="_blank"
          rel="noreferrer noopen"
        >
          Igor Alves
        </a>
      </Button>
    </footer>
  );
};
