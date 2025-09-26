import { useState } from 'react';

export default function ConnectForm({ connectToVideo }) {
  const [channelName, setChannelName] = useState('');
  const [invalidInputMsg, setInvalidInputMsg] = useState('');

  const handleSubmit = e => {
    const trimmedChannelName = channelName.trim();
    if (trimmedChannelName === '') {
      e.preventDefault(); // keep the page from reloading on form submission
      setInvalidInputMsg("Channel name can't be empty."); // show warning
      setChannelName(''); // resets channel name value in case user entered blank spaces
      return;
    }

    connectToVideo(trimmedChannelName);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className='card'>
        <input
          id='channelName'
          type='text'
          placeholder='Channel Name'
          value={channelName}
          onChange={e => {
            setChannelName(e.target.value);
            setInvalidInputMsg('');
          }}
        />
        <button>Connect</button>
        {invalidInputMsg && <p style={{ color: 'red' }}> {invalidInputMsg} </p>}
      </div>
    </form>
  );
}
