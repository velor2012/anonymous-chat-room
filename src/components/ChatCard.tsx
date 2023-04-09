import { setupChat, ChatMessage, ReceivedChatMessage, } from '@livekit/components-core';
import React, { memo } from 'react';
import { useRoomContext, MessageFormatter, useChat, useLocalParticipant } from '@livekit/components-react';
import { ChatEntry } from '@/components/ChatEntry'
import { sendMessage } from '@livekit/components-core'
import { TextEncoder } from 'util';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
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
export const ChatCard: React.FC = memo(({ ...props }: ChatProps) => {
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const ulRef = React.useRef<HTMLUListElement>(null);
    const { send, chatMessages, isSending } = useChat();
    console.log("chatcard update")
    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (inputRef.current && inputRef.current.value.trim() !== '') {
            if (send) {
                await send(inputRef.current.value);
                inputRef.current.value = '';
                inputRef.current.focus();
            }
        }
    }

    React.useEffect(() => {
        if (inputRef.current && send) {
            const inp = inputRef.current
            inp.removeEventListener("keyup", handleAltEnter as any);
            inp.addEventListener("keyup", handleAltEnter as any);

        }
    }, [send])
    React.useEffect(() => {
        if (ulRef) {
            ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
        }
    }, [ulRef, chatMessages]);

    const handleEmojiSelect = (emoji: any) => {
        if (inputRef.current) {
            const inp = inputRef.current
            inp.value += emoji.native;

            const dom = document.getElementById("emojiPicker");
            if(dom && dom.classList.contains("hidden")){
                dom.classList.remove("hidden")
            }

            inp.focus();
        }
    }
    const handleEmojiClick = (e: React.MouseEvent) => {
        const dom = document.getElementById("emojiPicker");
        if(dom){
            if(dom.classList.contains("hidden")) {
                dom.classList.remove("hidden")
            }else{
                dom.classList.add("hidden")
            }
        }
    }
    const handleAltEnter = async (e: React.KeyboardEvent) => {
        if (inputRef.current) {
            const inp = inputRef.current
            if (e.altKey && e.code == "Enter") {
                e.preventDefault();
                // 按下ALT+ENTER键，插入换行符
                inp.value += "\r\n";;
                inp.scrollTop = inp.scrollHeight;
                debugger
            } 
            else if (e.code == "Enter") {
                debugger
                e.preventDefault();
                if (inputRef.current && inputRef.current.value.trim() !== '') {
                    if (send) {
                        await send(inputRef.current.value);
                        inputRef.current.value = '';
                        inputRef.current.focus();
                    }
                }

            }
        }
    }

    return (
        <div {...props} className="lk-chat p-2 h-full flex flex-col-reverse">
            {/* <form className="lk-chat-form flex text-center items-center" onSubmit={handleSubmit}> */}
            <div className="grid grid-cols-12 gap-0 w-full">
                <textarea
                    className="col-span-8 mr-1 lk-form-control lk-chat-form-input  textarea-lg whitespace-pre-wrap rounded-md border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus:ring-yellow-400"
                    disabled={isSending}
                    ref={inputRef}
                    placeholder="Enter a message..."
                    rows={1}
                    style={{ lineHeight: "1.5rem", resize: "none" }}
                />
                <div className='ml-1 col-span-4 text-end flex justify-around items-center'>
                    <div className=' bg-transparent rounded-[999px] hover:cursor-pointer hover:bg-white hover:bg-opacity-10  w-[36px] h-[36px] flex justify-center items-center'>
                        <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3809" width="36" height="36">
                            <path d="M512 832c-176.448 0-320-143.552-320-320S335.552 192 512 192s320 143.552 320 320-143.552 320-320 320m0-704C300.256 128 128 300.256 128 512s172.256 384 384 384 384-172.256 384-384S723.744 128 512 128" fill="white" p-id="3810"></path><path d="M683.936 470.944H544v-139.968a32 32 0 1 0-64 0v139.968h-139.936a32 32 0 0 0 0 64H480v139.968a32 32 0 0 0 64 0v-139.968h139.968a32 32 0 0 0 0-64" fill="white" p-id="3811"></path></svg>
                    </div>
                    <div id="emojiSVG" className=' z-[999] relative bg-transparent rounded-[999px] hover:cursor-pointer hover:bg-white hover:bg-opacity-10  w-[36px] h-[36px] flex justify-center items-center'>
                        <svg className="icon" onClick={handleEmojiClick}  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5020" width="36" height="36"><path d="M512 832c-176.448 0-320-143.552-320-320S335.552 192 512 192s320 143.552 320 320-143.552 320-320 320m0-704C300.256 128 128 300.256 128 512s172.256 384 384 384 384-172.256 384-384S723.744 128 512 128" fill="white" p-id="5021"></path><path d="M700.64 580.288a32 32 0 0 0-43.712 11.68A160.608 160.608 0 0 1 518.304 672a160.576 160.576 0 0 1-138.592-80 32 32 0 0 0-55.424 32.032 224.896 224.896 0 0 0 194.016 112 224.768 224.768 0 0 0 194.016-112 32 32 0 0 0-11.68-43.744M384 512a32 32 0 0 0 32-32v-96a32 32 0 0 0-64 0v96a32 32 0 0 0 32 32M640 512a32 32 0 0 0 32-32v-96a32 32 0 0 0-64 0v96a32 32 0 0 0 32 32" fill="white" p-id="5022"></path></svg>
                        <div id="emojiPicker" className="absolute hidden right-[50%] bottom-full top-auto">

                            <Picker data={data} onEmojiSelect={handleEmojiSelect}/>
                        </div>
                    </div>
                    <div className=' bg-transparent rounded-[999px] hover:cursor-pointer hover:bg-white hover:bg-opacity-10  w-[36px] h-[36px] flex justify-center items-center'>
                        <svg onClick={handleSubmit} className="icon  " viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2840" width="24" height="24"><path fill='white' d="M0 1024l106.496-474.112 588.8-36.864-588.8-39.936-106.496-473.088 1024 512z" p-id="2841"></path></svg>
                    </div>

                </div>
            </div>
            {/* </form> */}
            <div className=' divider my-1' />
            <ul className="lk-list lk-chat-messages overflow-y-hidden overflow-x-hidden h-full " ref={ulRef}>
                {props.children
                    ? chatMessages.map((msg: any, idx: any) =>
                        cloneSingleChild(props.children, {
                            entry: msg,
                            key: idx,
                        }),
                    )
                    : chatMessages.map((msg: any, idx: any) => {
                        return <ChatEntry key={idx} entry={msg} />
                    }
                    )}
            </ul>
        </div>
    );

})
