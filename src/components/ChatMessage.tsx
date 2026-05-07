import { motion } from "framer-motion";
import { User, Scale } from "lucide-react";
import type { Message } from "@db/schema";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row" : "flex-row"}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center ${
          isUser
            ? "bg-[#171717] border border-white/10"
            : "bg-gradient-to-br from-[#4EA8DE] to-[#17B26A]"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white/70" />
        ) : (
          <Scale className="w-4 h-4 text-white" />
        )}
      </div>

      <div className={`flex-1 ${isUser ? "text-right" : "text-right"}`}>
        <div className="text-xs font-mono-ar text-white/40 mb-1">
          {isUser ? "أنت" : "مسؤول — المستشار القانوني"}
        </div>
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? "text-white/90" : "text-white/80"
          }`}
        >
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}
