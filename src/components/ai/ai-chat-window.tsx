"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAIStore, createAIService, type ChatMessage } from "@/lib/store/ai-store";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  Minus2,
  X,
  Loader2,
  MessageSquare,
  Trash2,
  Settings,
  Plus,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface AIChatWindowProps {
  className?: string;
  contextType?: "general" | "question" | "interview" | "resume";
  contextId?: string;
  contextTitle?: string;
  systemPrompt?: string;
  onSendMessage?: (message: string) => void;
  customChatHandler?: (
    message: string,
    history: ChatMessage[]
  ) => Promise<string>;
}

export function AIChatWindow({
  className,
  contextType = "general",
  contextId,
  contextTitle,
  systemPrompt,
  onSendMessage,
  customChatHandler,
}: AIChatWindowProps) {
  const {
    config,
    currentSessionId,
    sessions,
    isChatOpen,
    setChatOpen,
    createSession,
    selectSession,
    deleteSession,
    addMessage,
    getCurrentSession,
    getMessagesByContext,
    isLoading,
    setLoading,
    error,
    setError,
  } = useAIStore();

  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];

  const contextMessages =
    contextId && contextType !== "general"
      ? getMessagesByContext(contextType, contextId)
      : [];

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-slot='scroll-area-viewport']"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (contextType !== "general" && contextId) {
      const existingSession = sessions.find(
        (s) => s.contextType === contextType && s.contextId === contextId
      );
      if (existingSession && currentSessionId !== existingSession.id) {
        selectSession(existingSession.id);
      } else if (!existingSession && !currentSessionId) {
        createSession(contextType, contextId);
      }
    }
  }, [contextType, contextId, sessions, currentSessionId]);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    setInputValue("");
    setError(null);

    addMessage("user", trimmed, contextType, contextId);

    if (onSendMessage) {
      onSendMessage(trimmed);
      return;
    }

    setLoading(true);

    try {
      const aiService = createAIService(config);
      const currentMessages = getCurrentSession()?.messages || [];
      const historyWithoutLast = currentMessages.slice(0, -1);

      let response: string;

      if (customChatHandler) {
        response = await customChatHandler(trimmed, historyWithoutLast);
      } else {
        response = await aiService.chat(trimmed, systemPrompt, historyWithoutLast);
      }

      addMessage("assistant", response, contextType, contextId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "未知错误";
      setError(errorMessage);
      addMessage(
        "assistant",
        `抱歉，出现了错误：${errorMessage}\n\n请检查你的AI配置是否正确，或稍后重试。`,
        contextType,
        contextId
      );
    } finally {
      setLoading(false);
    }
  }, [
    inputValue,
    isLoading,
    config,
    systemPrompt,
    contextType,
    contextId,
    addMessage,
    setLoading,
    setError,
    getCurrentSession,
    onSendMessage,
    customChatHandler,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    createSession(contextType, contextId);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isChatOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col rounded-lg border border-border bg-background shadow-2xl",
        "w-[380px] h-[500px] max-w-[90vw] max-h-[80vh]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Bot className="size-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">AI 教练</span>
            {contextTitle && (
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {contextTitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="size-7">
                <MessageSquare className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={handleNewChat}>
                <Plus className="size-3.5 mr-2" />
                新对话
              </DropdownMenuItem>
              {sessions.length > 0 && <Separator />}
              {sessions.slice(0, 5).map((session) => (
                <DropdownMenuItem
                  key={session.id}
                  className="flex items-center justify-between"
                  onClick={() => selectSession(session.id)}
                >
                  <span className="truncate max-w-[140px]">
                    {session.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-5 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onClick={() => setChatOpen(false)}
          >
            <Minus2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onClick={() => setChatOpen(false)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-2" ref={scrollRef}>
        <div className="flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bot className="size-12 mb-3 opacity-30" />
              <p className="text-sm">你好！我是你的AI面试教练</p>
              <p className="text-xs mt-1">有什么可以帮助你的吗？</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <Avatar size="sm">
                <AvatarFallback
                  className={cn(
                    "size-6",
                    msg.role === "assistant"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="size-3.5" />
                  ) : (
                    <User className="size-3.5" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[240px] rounded-lg px-3 py-2 text-sm",
                  msg.role === "assistant"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <span
                  className={cn(
                    "text-xs mt-1 block",
                    msg.role === "assistant"
                      ? "text-muted-foreground/70"
                      : "text-primary-foreground/70"
                  )}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary text-primary-foreground size-6">
                  <Bot className="size-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2">
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  思考中...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-2 items-start rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 px-3 py-2">
              <AlertCircle className="size-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                  发生错误
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isLoading
                ? "请等待回复..."
                : "输入消息... (Enter发送, Shift+Enter换行)"
            }
            disabled={isLoading}
            className="min-h-[40px] max-h-[80px] resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AIChatTrigger({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const { isChatOpen, setChatOpen, createSession, currentSessionId } = useAIStore();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      if (!currentSessionId) {
        createSession("general");
      }
      setChatOpen(!isChatOpen);
    }
  };

  return (
    <Button
      variant="default"
      size="icon"
      className={cn(
        "fixed bottom-4 right-4 z-40 shadow-lg size-12 rounded-full",
        isChatOpen && "hidden",
        className
      )}
      onClick={handleClick}
    >
      <MessageSquare className="size-5" />
    </Button>
  );
}
