import { useState } from "react";

type Props = {
  submitText: string;
  onSubmit: (username: string) => void;
};

export function UsernameInput({ submitText, onSubmit }: Props) {
  const [username, setUsername] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(username);
      }}
    >
      <div className="form-control">
        <div className=" flex">
          <input
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            type="text"
            placeholder="Username"
            style={{ marginRight: 20}}
            className="w-full rounded-md border-gray-200 bg-white p-3 text-gray-700 shadow-sm transition focus:border-white focus:outline-none focus:ring focus:ring-yellow-400"
          />
            <button
                // onClick={this.handleOnClicked}
                className="btn w-20 border-none bg-yellow-600 text-white hover:bg-yellow-800"
            >
                👉GO
            </button>
        </div>
      </div>
    </form>
  );
}
