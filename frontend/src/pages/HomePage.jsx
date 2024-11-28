import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import { useChatStore } from '../store/useChatStore'

import NoChatSelected from '../components/NoChatSelected'

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className='h-screen bg-gradient-to-br from-base-300 to-primary/10'>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)]'>
          <div className='flex h-full'>
            <Sidebar />
            <div className='flex-1'>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage;