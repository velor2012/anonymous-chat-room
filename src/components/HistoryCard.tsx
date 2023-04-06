import { useEffect, useState } from 'react';
import { UserDefinedConnectionQualityIndicator } from './ConnectIndicator';
import { getLocalStore } from '@/tools/utils';
import { ConnectionDetails } from '@/pages/api/connection_details';
import Link from 'next/link'
export function HistoryCard() {
    const [store, setStore] = useState<Storage | null>(null);
    const [hist, setHistory] = useState< Array<ConnectionDetails> | null>(null);
    useEffect(() => {
        let store = getLocalStore();
        if (store == undefined) return;
        setStore(store);
        const histories = store?.getItem('history');
        if (histories == undefined) return;
        const store_history: Array<ConnectionDetails> = JSON.parse(
        histories as string,
        );
        setHistory(store_history)
    },[]);

    const deleteHistory = (id: number) => {
      if (hist == null) return;
      const newHist = [...hist];
      newHist.splice(id, 1);
      setHistory(newHist);
    };
    
    
    return (
        <div className='md:px-12'>
        {hist && hist.length > 0 && (
            <div>
                <div className=' font-bold  mt-4 w-1/2 text-start text-xl'>
                    <div className=' ml-4'>最近访问</div>
                </div>
                <div className=" flex-wrap flex">
                    {hist?.map((item, key) => {
                        return <HistoryCardItem record={item} idx={key} key={key} onDelete={() => deleteHistory(key)} />;
                    })}
                </div>
            </div>
        )}
        </div>
    );
}
type Props = {
    record: ConnectionDetails;
    idx: number;
    onDelete: () => void;
};

export function HistoryCardItem(props: Props) {
    const { record, idx } = props;
    const [store, setStore] = useState<Storage | null>(null);
    useEffect(() => {
        let store = getLocalStore();
        if (store == undefined) return;
        setStore(store);
    });
    const histories = store?.getItem('history');
    if (histories == undefined) return (<div></div>);; 
    const store_history: Array<ConnectionDetails> = JSON.parse(
        histories as string,
    );

    return (
        <div className=' bg-white bg-opacity-5 w-[200px] md:w-[240px] md:h-[100px] mx-4 mt-2 p-2 flex flex-col justify-between rounded-md items-center'>
            <div className='flex w-full justify-between'>
                <span className='text-white font-bold md:text-lg'>
                    房间：
                    {record.roomId}
                </span>
                <svg className=' transition duration-200 ease-in-out hover:cursor-pointer hover:bg-opacity-10 hover:bg-white rounded-[12px]' onClick={props.onDelete} fill='#D1B6E1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24" role="img" aria-hidden="true"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg>
            </div>
            <Link className="flex items-center transition duration-200 ease-in-out justify-center h-1/2 w-full rounded-md hover:cursor-pointer hover:bg-opacity-5 hover:bg-white" href={`/${record.roomId}?username=${record.username}`}>
                <span>加入房间</span>
            </Link>
        </div>
    );
}
