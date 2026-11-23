"use client";

import { Fragment, useState, type ReactNode } from "react";
import { sendMessage } from "../actions/send-message";
import { useIsClient } from "../hooks/use-is-client";
import type { Message } from "../services/chat-api";
import { dayKey, dayLabel } from "../utils/message-time";
import { DayDivider } from "./day-divider";
import { MessageComposer } from "./message-composer";
import { MessageItem, type MessageStatus } from "./message-item";

/** Uma Mensagem na tela: a que veio do servidor ou uma enviada nesta visita, com o estado. */
interface ListedMessage {
  message: Message;
  status: MessageStatus;
}

interface ChannelConversationProps {
  conversationId: string;
  channelName: string;
  /** A Pessoa da Sessão, autora das Mensagens que ela envia. */
  author: Message["author"];
  initialMessages: Message[];
  /** O começo do Canal, mostrado acima da primeira Mensagem quando não há páginas anteriores. */
  intro: ReactNode;
}

/**
 * O histórico e o composer do Canal (spec da F02, "BFF e telas"). As Mensagens enviadas nesta visita
 * ficam no estado local, sobre as que vieram do servidor ("Estado do cliente"). O horário e os
 * separadores de dia só aparecem no navegador, que sabe o fuso.
 */
export function ChannelConversation({
  conversationId,
  channelName,
  author,
  initialMessages,
  intro,
}: ChannelConversationProps) {
  const [sent, setSent] = useState<ListedMessage[]>([]);
  const isClient = useIsClient();

  async function send(body: string) {
    const clientMessageId = crypto.randomUUID();
    const pending: Message = {
      id: clientMessageId,
      conversation_id: conversationId,
      client_message_id: clientMessageId,
      author,
      body,
      created_at: new Date().toISOString(),
    };
    setSent((current) => [...current, { message: pending, status: "sending" }]);
    const result = await sendMessage(conversationId, clientMessageId, body).catch(() => ({ status: "failed" }) as const);
    const next: ListedMessage =
      result.status === "sent" ? { message: result.message, status: "sent" } : { message: pending, status: "failed" };
    setSent((current) => current.map((item) => (item.message.client_message_id === clientMessageId ? next : item)));
  }

  const listed: ListedMessage[] = [
    ...initialMessages.map((message) => ({ message, status: "sent" as const })),
    ...sent,
  ];
  const now = new Date();
  let previousDay: string | undefined;

  return (
    <>
      <div className="flex flex-1 flex-col-reverse overflow-y-auto">
        <div className="flex flex-col pb-2">
          {intro}
          <ol aria-label={`Mensagens de #${channelName}`} className="flex flex-col">
            {listed.map(({ message, status }) => {
              const date = new Date(message.created_at);
              const day = dayKey(date);
              const startsDay = isClient && day !== previousDay;
              previousDay = day;
              return (
                <Fragment key={message.client_message_id}>
                  {startsDay && (
                    <li>
                      <DayDivider label={dayLabel(date, now)} />
                    </li>
                  )}
                  <MessageItem message={message} status={status} showTime={isClient} />
                </Fragment>
              );
            })}
          </ol>
        </div>
      </div>
      <MessageComposer channelName={channelName} onSend={send} />
    </>
  );
}
