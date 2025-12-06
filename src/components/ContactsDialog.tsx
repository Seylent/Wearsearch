import { Mail } from "lucide-react";
import { FaTelegram, FaInstagram } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const ContactsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-sm font-medium uppercase tracking-widest text-muted-foreground hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all h-auto px-3 py-2"
        >
          Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center mb-2 text-white">
            Get in Touch
          </DialogTitle>
          <p className="text-white/60 text-center text-sm">
            Connect with us through your preferred platform
          </p>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-6">
          <a
            href="https://t.me/wearsearch"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="outline"
              className="w-full h-14 text-base justify-start gap-4 hover:scale-[1.02] hover:bg-white/10 hover:border-white/40 transition-all border-white/20 bg-white/5"
            >
              <FaTelegram className="w-6 h-6 text-[#0088cc]" />
              <div className="text-left">
                <div className="font-semibold text-white">Telegram</div>
                <div className="text-xs text-white/60">@wearsearch</div>
              </div>
            </Button>
          </a>

          <a
            href="https://instagram.com/wearsearch"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="outline"
              className="w-full h-14 text-base justify-start gap-4 hover:scale-[1.02] hover:bg-white/10 hover:border-white/40 transition-all border-white/20 bg-white/5"
            >
              <FaInstagram className="w-6 h-6 text-[#E4405F]" />
              <div className="text-left">
                <div className="font-semibold text-white">Instagram</div>
                <div className="text-xs text-white/60">@wearsearch</div>
              </div>
            </Button>
          </a>

          <a href="mailto:contact@wearsearch.com" className="block">
            <Button
              variant="outline"
              className="w-full h-14 text-base justify-start gap-4 hover:scale-[1.02] hover:bg-white/10 hover:border-white/40 transition-all border-white/20 bg-white/5"
            >
              <Mail className="w-6 h-6 text-white" />
              <div className="text-left">
                <div className="font-semibold text-white">Email</div>
                <div className="text-xs text-white/60">contact@wearsearch.com</div>
              </div>
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
