import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 py-16">
      <div className="w-full max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-5xl font-serif font-bold mb-8 text-center">About Wearsearch</h1>
        <div className="text-lg text-center space-y-4 leading-relaxed">
          <p>
            Wearshearch is designed for easy and convenient clothing search across various online stores.
          </p>
          <p>
            We collect product models, show up-to-date offers, and provide quick links to the stores where you can buy the selected item.
          </p>
          <p>
            The platform doesn't sell clothing directly — we help you find what you need faster, easier, and more efficiently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
