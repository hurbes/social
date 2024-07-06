import React from "react";

const ChatApp = () => {
  const contacts = [
    {
      name: "Alice",
      message: "Hoorayy!!",
      avatar:
        "https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato",
    },
    // Add other contacts here
  ];

  const messages = [
    {
      incoming: true,
      text: "Hey Bob, how's it going?",
      avatar:
        "https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato",
    },
    {
      incoming: false,
      text: "Hi Alice! I'm good, just finished a great book. How about you?",
      avatar:
        "https://placehold.co/200x/b7a8ff/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato",
    },
    // Add other messages here
  ];

  return (
    <div className='flex h-screen overflow-hidden'>
      {/* Sidebar */}
      <div className='w-1/4 bg-white border-r border-gray-300'>
        {/* Sidebar Header */}
        <header className='p-4 border-b border-gray-300 flex justify-between items-center bg-indigo-600 text-white'>
          <h1 className='text-2xl font-semibold'>Messenger</h1>
        </header>

        {/* Contact List */}
        <div className='overflow-y-auto h-screen p-3 mb-9 pb-20'>
          {contacts.map((contact, index) => (
            <div
              key={index}
              className='flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md'>
              <div className='w-12 h-12 bg-gray-300 rounded-full mr-3'>
                <img
                  src={contact.avatar}
                  alt='User Avatar'
                  className='w-12 h-12 rounded-full'
                />
              </div>
              <div className='flex-1'>
                <h2 className='text-lg font-semibold text-black'>
                  {contact.name}
                </h2>
                <p className='text-gray-600'>{contact.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {/* Chat Header */}
        <header className='bg-white p-4 text-gray-700'>
          <h1 className='text-2xl font-semibold'>Alice</h1>
        </header>

        {/* Chat Messages */}
        <div className='flex-1 overflow-y-auto p-4 pb-36 bg-slate-50'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 cursor-pointer ${message.incoming ? "" : "justify-end"}`}>
              {message.incoming && (
                <div className='w-9 h-9 rounded-full flex items-center justify-center mr-2'>
                  <img
                    src={message.avatar}
                    alt='User Avatar'
                    className='w-8 h-8 rounded-full'
                  />
                </div>
              )}
              <div
                className={`flex max-w-96 ${message.incoming ? "bg-white" : "bg-indigo-500 text-white"} rounded-lg p-3 gap-3`}>
                <p className={message.incoming ? "text-gray-700" : ""}>
                  {message.text}
                </p>
              </div>
              {!message.incoming && (
                <div className='w-9 h-9 rounded-full flex items-center justify-center ml-2'>
                  <img
                    src={message.avatar}
                    alt='My Avatar'
                    className='w-8 h-8 rounded-full'
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <footer className='bg-white border-t border-gray-300 p-4'>
          <div className='flex items-center'>
            <input
              type='text'
              placeholder='Type a message...'
              className='w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500'
            />
            <button className='bg-indigo-500 text-white px-4 py-2 rounded-md ml-2 flex items-center'>
              <span>Send</span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 ml-1'
                viewBox='0 0 20 20'
                fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatApp;
