import React from 'react';
import Link from 'next/link'
import Typist from 'react-typist-component';
// import { HistoryCard } from '@/components/HistoryCard';
import { theme } from '@/lib/const';
import { withTranslation, WithTranslation } from "react-i18next"

class HomeComponent extends React.Component<WithTranslation> {
  state = {
    roomIdText: '',
    cursor: "|"
  };
  constructor(props: any) {
    super(props);
  }
  handleRoomIdTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ roomIdText: event.target.value });
  };

// timer = setInterval(()=>{
//     this.setState({cursor: this.state.cursor === "|" ? "*" : "|"})
// }, 300);

  render() {
    const { t, i18n } = this.props;
    return (
        <div className='Home flex justify-center items-center text-center mx-auto h-full w-full'>
            <div className='flex flex-col text-center justify-center'>
                {
                    i18n.language=='en' ?
                    (
                        <div>
                            <div className='text-xl md:text-5xl mb-2 hidden sm:block'>
                                A<Typist startDelay={1000}  typingDelay={110} loop={true}  cursor={<span className='cursor'>{this.state.cursor}</span>}   >nonymous Chat Room <Typist.Delay ms={1500} /><Typist.Backspace count={18} /></Typist>

                            </div>
                            <div className='text-xl md:text-5xl mb-2 block sm:hidden'>
                                Anonymous Chat Room
                            </div>
                        </div>
                    ) : (
                        <div className='text-xl md:text-5xl mb-2 block'>
                            欢迎来到匿名聊天室
                        </div>
                    )
                }
                <div className="mx-auto mt-8 max-w-xl sm:flex sm:gap-4 h-12">
                <input
                    placeholder= {t('room.roomName')}
                    value={this.state.roomIdText}
                    onChange={this.handleRoomIdTextChange}
                    className="w-48 rounded-lg border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus: ring-secondary-focus"
                    style={{ marginRight: 10 }}
                />
                <Link href={`/${this.state.roomIdText}`} > 
                    <button
                        className=" font-bold btn-primary rounded-lg h-full w-20 border-none text-white"
                    >
                        👉 {t('Go')}
                    </button>
                </Link>
                </div>
            </div>
            <footer className=' text-white gap-2 fixed bottom-0 text-xs sm:text-xl h-12 w-full py-1 px-2 flex items-center justify-center text-center bg-primary'>
                Hosted on 
                <a className=' text-accent-focus ' href="https://livekit.io/cloud?ref=meet" rel="noopener">
                LiveKit Cloud
                </a>
                . Source code on 
                <a className=' text-accent-focus ' href="https://github.com/velor2012/anonymous-chat-room" rel="noopener">
                GitHub
                </a>
                .
            </footer>
            {/* <div>
                <HistoryCard/>
            </div> */}
        </div>
    );
  }
}

export default withTranslation()(HomeComponent);