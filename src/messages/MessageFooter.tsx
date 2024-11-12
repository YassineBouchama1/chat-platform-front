import { Plus, Image, Smile, Mic, Send } from "lucide-react";

const MessageFooter = () => {
  return (
    <div className="flex items-center gap-2 p-2 bg-white border-t">
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Image className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Smile className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1">
        <input
          type="text"
          className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Mic className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Send className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default MessageFooter;
