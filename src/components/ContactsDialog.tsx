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
        <Button variant="ghost" className="font-semibold text-2xl leading-none h-auto px-4 py-2">
          Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-2 shadow-strong">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center mb-2">
            Get in Touch
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
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
              className="w-full h-14 text-base justify-start gap-4 hover:scale-[1.02] transition-transform"
            >
              <FaTelegram className="w-6 h-6 text-[#0088cc]" />
              <div className="text-left">
                <div className="font-semibold">Telegram</div>
                <div className="text-xs text-muted-foreground">@wearsearch</div>
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
              className="w-full h-14 text-base justify-start gap-4 hover:scale-[1.02] transition-transform"
            >
              <FaInstagram className="w-6 h-6 text-[#E4405F]" />
              <div className="text-left">
                <div className="font-semibold">Instagram</div>
                <div className="text-xs text-muted-foreground">@wearsearch</div>
              </div>
            </Button>
          </a>

          <a href="mailto:contact@wearsearch.com" className="block">
            <Button
              variant="outline"
              className="w-full h-14 text-base justify-start gap-4 hover:scale-[1.02] transition-transform"
            >
              <Mail className="w-6 h-6 text-accent" />
              <div className="text-left">
                <div className="font-semibold">Email</div>
                <div className="text-xs text-muted-foreground">contact@wearsearch.com</div>
              </div>
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
