import { Phone } from "lucide-react";

const MessageBody = () => {
  return (
    <div className="h-[700px] overflow-y-scroll custom-scroll flex flex-col gap-6 p-4 bg-blue-50 ">
      <div className="flex justify-center">
        <span className="text-sm text-gray-500">May 10, 2022, 11:14 AM</span>
      </div>

      <div className="flex justify-end mb-4">
        <div className="flex flex-col items-end gap-1 max-w-xl">
          <img
            src="/public/images/woman.jpg"
            alt="Grey cat looking sideways"
            className="rounded-2xl w-full h-48 object-cover"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Y</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 max-w-2xl">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <img
            src="/public/images/woman.jpg"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
            <a href="#" className="text-blue-600 hover:underline break-all">
              https://www.youcode.com/
            </a>
          </div>
          <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
            <p className="text-gray-700">I hope these article helps.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-3 shadow-sm max-w-xl">
          <p>Do you know which App or feature it will require to set up.</p>
        </div>
      </div>

      <div className="flex justify-center">
        <span className="text-sm text-gray-500">Aug 22, 2022, 3:05 PM</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <div className="bg-white rounded-xl p-2 shadow-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Outgoing Audio Call</span>
              <span className="text-xs text-gray-500">03:29 PM</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-white rounded-xl p-2 shadow-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-500" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Missed Audio Call</span>
              <span className="text-xs text-gray-500">03:29 PM</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img
              src="/public/images/woman.jpg"
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-white rounded-xl p-2 shadow-sm flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path
                  fill="currentColor"
                  d="M21 15v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2zm-10 3H5v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2zM9 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Outgoing Audio Call</span>
              <span className="text-xs text-gray-500">03:29 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBody;
