

export function MyErrorToast(props: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className=" toast toast-top toast-center z-50 min-w-[200px] max-w-[50%] ">
            <div className="alert bg-red-600 text-white font-mono shadow-xl">
                <div className=" text-center ">
                    <span>{props.children}</span>
                </div>
            </div>
        </div>
    );
}

export function MyInfoToast(props: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className=" toast toast-top toast-center z-50 min-w-[200px] max-w-[50%] ">
            <div className="alert  btn-primary text-white font-mono shadow-xl flex justify-center">
                <div className=" text-center ">
                    <span>{props.children}</span>
                </div>
            </div>
        </div>
    );
}