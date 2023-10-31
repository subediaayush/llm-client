import React, { useEffect, useState } from 'react';
import './App.css';
import { MdSend, MdMic, MdImage } from 'react-icons/md';
import { useAI } from './hooks/useAI';

export enum IMessageType {
  TEXT, IMAGE, AUDIO
}

enum IMessageSource {
  LOCAL, REMOTE
}

interface IMessage {
  content: any
  type: IMessageType
  source: IMessageSource
  time: number
}

const MessageView = (message: IMessage) => {

  const bg = message.source === IMessageSource.LOCAL ? 'bg-green-200 place-self-end' : 'bg-blue-200';

  var content;
  switch (message.type) {
    case IMessageType.TEXT:
      content = <p>{message.content}</p>
      break;
    case IMessageType.IMAGE:
      if (message.source === IMessageSource.LOCAL)
        content = <MdImage />
      else
        content = <img src={message.content.name} className='w-25 h-25' />
      break;
    case IMessageType.AUDIO:
      if (message.source === IMessageSource.LOCAL)
        content = <MdMic />
      else
        content = <audio src={message.content.name} />
      break;
  }

  return (
    <div className='w-full flex flex-col place-items-start'>
      <div className={bg + ' rounded-lg my-4 p-2 w-fit'}>
        <div>{content}</div>
      </div>
    </div>
  )
}

function App() {

  const [model, setModel] = useState('open_clip')
  const [textPrompt, setTextPrompt] = useState('')
  const [messages, setMessages] = useState<IMessage[]>([])

  const supportedModels = [
    'open_clip', 'whisper', 'gpt4all'
  ]

  const onReceivedFromRemote = (data: any, type?: IMessageType, err?: any) => {
    if (err) {
      setMessages(m => [...m, {
        content: "Error loading reply",
        type: IMessageType.TEXT,
        source: IMessageSource.REMOTE,
        time: new Date().getTime()
      }])
    } else {
      setMessages(m => [...m, {
        content: data,
        type: type!,
        source: IMessageSource.REMOTE,
        time: new Date().getTime()
      }])
    }
  }

  const setPrompt = useAI(model, onReceivedFromRemote)

  const sendPrompt = (message: IMessage) => {
    setPrompt(message.content, message.type, IMessageType.TEXT)
  }

  const onText = () => {
    if (!textPrompt) return;
    console.log('Clicked Text', textPrompt)
    setTextPrompt('')

    addMessage({ content: textPrompt, type: IMessageType.TEXT, source: IMessageSource.LOCAL, time: new Date().getTime() })
  }

  // useEffect(() => {
  //   sendPrompt({
  //     content: 'hello',
  //     type: IMessageType.TEXT,
  //     source: IMessageSource.LOCAL
  //   })
  // }, [])

  const addMessage = (message: IMessage) => {
    setMessages(m => [...m, message])
    sendPrompt(message)
  }

  const onImage = (event: any) => {
    const prompt = event.target.files?.item(0)
    console.log('Clicked Image', prompt)

    addMessage({ content: prompt, type: IMessageType.IMAGE, source: IMessageSource.LOCAL, time: new Date().getTime() })
  }

  const onAudio = (event: any) => {
    const prompt = event.target.files?.item(0)
    console.log('Clicked Audio', prompt)
    addMessage({ content: prompt, type: IMessageType.AUDIO, source: IMessageSource.LOCAL, time: new Date().getTime() })
  }

  const updatePrompt = (event: any) => {
    setTextPrompt(event.target.value)
  }

  return (
    <>
      <div className='bg-slate-400 p-4 h-screen'>
        <div className='h-0'>
          <input id='audio-prompt' className='invisible' type='file' accept='audio/*' onChange={onAudio} />
          <input id='image-prompt' className='invisible' type='file' accept='image/*' onChange={onImage} />
          <input id='text-prompt' className='invisible' onClick={onText} />
        </div>
        <div className='h-full flex flex-col mx-50 bg-white rounded-lg p-4 shadow-lg'>
          <h1 className='font-extrabold font-sans'>Chat</h1>
          <div id='chat-window' className='h-full flex-grow align-items-end py-8 overflow-y-scroll'>

            {messages.map(m => <div key={m.time}><MessageView {...m} /></div>)}

          </div>
          <div className='flex w-full gap-2'>
            {supportedModels.map(m => 
            <div className='my-2 gap-1'>
            <input id={`id-${m}`} type='radio' checked={model === m} onChange={(e) => { if (e.target.value) setModel(m) }} value={m}/>
            <label htmlFor={`id-${m}`}>{m}</label>
            </div>
            )}
          </div>
          <div className='flex border-slate-500 border-2 rounded-full'>
            <input className='flex-grow bg-transparent ml-4' type='text' onChange={updatePrompt} value={textPrompt} />
            <div className='flex flex-grow-0 my-2px bg-slate-200 rounded-full'>
              <label htmlFor='image-prompt'>
                <div className='p-3 hover:bg-slate-100 rounded-full'>
                  <MdImage color='#334455' />
                </div>
              </label>
              <label htmlFor='audio-prompt'>
                <div className='p-3 hover:bg-slate-100 rounded-full'>
                  <MdMic color='#334455' />
                </div>
              </label>
              <label htmlFor='text-prompt'>
                <div className='bg-slate-500 hover:bg-slate-400 active:bg-slate-600 p-3 rounded-full'>
                  <MdSend color='white' />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>

  );
}

export default App;
