import React from "react";

const JoinCreateChat = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-green-800 p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Join or Create a Chat</h1>
                </div>
                <div className="flex flex-col space-y-4">
                    <label htmlFor="chatName" className="text-white">
                        <input type="text" id="chatName" className="p-4 bg-gray-800 text-white placeholder:text-green-400 border border-green-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Your Name"/>
                    </label>
                    <label htmlFor="chatDescription" className="text-white">
                        <input type="text" id="chatDescription" className="p-4 bg-gray-800 text-white placeholder:text-green-400 border border-green-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Room Id"/>
                    </label>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">Join Chat</button>
                    <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300">
                        Create Chat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinCreateChat;