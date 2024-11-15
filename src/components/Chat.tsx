
// import useCurrentChat from '../hooks/useCurrentChat';
// import { useCall } from '../providers/CallProvider';

// const Chat: React.FC = () => {
//     const { chatId } = useCurrentChat()
//     const { initiateCall } = useCall();


//     return (
//         <div>
//             {/* Chat content */}
//             <div className="flex gap-2">
//                 <button
//                     onClick={() => initiateCall(chatId, 'video')}
//                     className="px-4 py-2 bg-blue-500 text-white rounded"
//                 >
//                     Video Call
//                 </button>
//                 <button
//                     onClick={() => initiateCall(chatId, 'audio')}
//                     className="px-4 py-2 bg-green-500 text-white rounded"
//                 >
//                     Audio Call
//                 </button>
//             </div>
//         </div>
//     );
// };


// export default Chat