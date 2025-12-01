const Contacts = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-semibold mb-8">Contact Us</h1>
        <div className="max-w-2xl">
          <p className="text-muted-foreground mb-6">
            Get in touch with us for any questions or inquiries about our clothing marketplace.
          </p>
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold mb-2">Email</h2>
              <p className="text-muted-foreground">contact@wearsearch.com</p>
            </div>
            <div>
              <h2 className="font-semibold mb-2">Social Media</h2>
              <p className="text-muted-foreground">Follow us on Instagram and Telegram</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
