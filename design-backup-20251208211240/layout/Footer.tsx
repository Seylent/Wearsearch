const Footer = () => {
  return (
    <footer className="border-t border-border bg-background mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} wearsearch — All rights reserved.</span>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;
