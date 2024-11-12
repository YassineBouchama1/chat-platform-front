import { Phone, Video, Search, BookOpen } from "lucide-react";

const ProfileHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm ">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src="/public/images/woman.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-gray-900 font-medium">Jasmine Thompson</h2>
          <span className="text-sm text-gray-500">Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
