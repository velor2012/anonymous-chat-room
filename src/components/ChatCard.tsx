import { setupChat, ChatMessage, ReceivedChatMessage,  } from '@livekit/components-core';
import * as React from 'react';
import { useRoomContext, MessageFormatter, useChat, useLocalParticipant  } from '@livekit/components-react';
import {ChatEntry} from '@/components/ChatEntry'
import {sendMessage} from '@livekit/components-core'
import { TextEncoder } from 'util';
import { DataPacket_Kind } from 'livekit-client';
/**
 * @internal
 */
export function cloneSingleChild(
    children: React.ReactNode | React.ReactNode[],
    props?: Record<string, any>,
    key?: any,
  ) {
    return React.Children.map(children, (child) => {
      // Checking isValidElement is the safe way and avoids a typescript
      // error too.
      if (React.isValidElement(child) && React.Children.only(children)) {
        return React.cloneElement(child, { ...props, key });
      }
      return child;
    });
}


export type { ChatMessage, ReceivedChatMessage };

export interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
    messageFormatter?: MessageFormatter;
}

/**
 * The Chat component adds a basis chat functionality to the LiveKit room. The messages are distributed to all participants
 * in the room. Only users who are in the room at the time of dispatch will receive the message.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <Chat />
 * </LiveKitRoom>
 * ```
 */
export function ChatCard({ messageFormatter, ...props }: ChatProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const ulRef = React.useRef<HTMLUListElement>(null);
    const { send, chatMessages, isSending } = useChat();

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (inputRef.current && inputRef.current.value.trim() !== '') {
            if (send) {
                debugger
                await send(inputRef.current.value);
                inputRef.current.value = '';
                inputRef.current.focus();
            }
        }
    }

    React.useEffect(() => {
        if (ulRef) {
            ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
        }
    }, [ulRef, chatMessages]);


    return (
        <div {...props} className="lk-chat p-2 h-full flex flex-col-reverse">
            <form className="lk-chat-form" onSubmit={handleSubmit}>
                <input
                    className="lk-form-control lk-chat-form-input w-full rounded-md border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus:ring-yellow-400"
                    disabled={isSending}
                    ref={inputRef}
                    type="text"
                    placeholder="Enter a message..."
                />
                <div className='mt-2 text-end'> 
                    <button type="submit" className=" btn lk-button lk-chat-form-button bg-yellow-600 text-white  hover:bg-yellow-800 border-none" disabled={isSending}>
                        Send
                    </button>
                </div>
            </form>
            <div className=' divider py-1'/>
            <ul className="lk-list lk-chat-messages overflow-y-hidden overflow-x-hidden h-full " ref={ulRef}>
                {props.children
                    ? chatMessages.map((msg: any, idx: any) =>
                        cloneSingleChild(props.children, {
                            entry: msg,
                            key: idx,
                            messageFormatter,
                        }),
                    )
                    : chatMessages.map((msg: any, idx: any) => { 
                        return <ChatEntry key={idx} entry={msg} messageFormatter={messageFormatter} />
                        }
                    )}
            </ul>
        </div>
    );
}
