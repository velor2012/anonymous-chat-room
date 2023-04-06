import React from 'react';
import Link from 'next/link'
import Typist from 'react-typist-component';
import { HistoryCard } from '@/components/HistoryCard';
import { theme } from '@/tools/setting';

class Home extends React.Component {
  state = {
    roomIdText: '',
    nickNameText: '',
    cursor: "|"
  };
  constructor(props: any) {
    super(props);
  }
  handleRoomIdTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ roomIdText: event.target.value });
  };
  handleNickNameTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ nickNameText: event.target.value });
  };

// timer = setInterval(()=>{
//     this.setState({cursor: this.state.cursor === "|" ? "*" : "|"})
// }, 300);

  render() {
    return (
        <div className='Home text-center mx-auto max-w-full'>
            <div>
                <div className='text-xl md:text-5xl mb-2'>
                    A<Typist startDelay={1000}  typingDelay={110} loop={true}  cursor={<span className='cursor'>{this.state.cursor}</span>}   >nonymous Chat Room <Typist.Delay ms={1500} /><Typist.Backspace count={18} /></Typist>
                </div>
                <p>
                There is freedom of speech, but I cannot guarantee freedom after
                speech. (Idi Amin)
                </p>
                <div className="mx-auto mt-8 max-w-xl sm:flex sm:gap-4">
                <input
                    placeholder="Room Name"
                    value={this.state.roomIdText}
                    onChange={this.handleRoomIdTextChange}
                    className="w-full rounded-md border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus:ring-yellow-400"
                    style={{ marginRight: 10 }}
                />
                <input
                    placeholder="Nick Name"
                    value={this.state.nickNameText}
                    className=" my-2 sm:my-0 w-full rounded-md border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus:ring-yellow-400"
                    onChange={this.handleNickNameTextChange}
                />
                <Link href={`/${this.state.roomIdText}?username=${this.state.nickNameText}`} > 
                    <button
                        // onClick={this.handleOnClicked}
                        className="btn w-20 border-none bg-yellow-600 hover:bg-yellow-800"
                        // style={{backgroundColor: "#8FBC94"}}
                    >
                        👉GO
                    </button>
                </Link>
                </div>
            </div>
            <div>
                <HistoryCard/>
            </div>
        </div>
    );
  }
}

export default Home;
