import React, { useState } from 'react';

import Modal from '../Modal';
import Button from '../Button';
import { Member } from "../../types/chat";

interface SettingsModalProps {
    user: Member;
    isOpen?: boolean;
    onClose: () => void;

}

const SettingsModal: React.FC<SettingsModalProps> = ({
    user,
    isOpen,
    onClose,
    
}) => {
    const [isLoading, setIsLoading] = useState(false)
    console.log(user);

    return (
        
        <Modal isOpen={isOpen} onClose={onClose}>
             <form>
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Profile
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Edit your public information.
              </p>
  
              <div className="mt-6 flex flex-col gap-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-medium">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user._id}</p>
                  </div>
                </div>
  
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={user.username}
                    readOnly
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
  
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    readOnly
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
  
                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <input
                    id="status"
                    type="text"
                    value={user.status}
                    readOnly
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
  
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Button disabled={isLoading} secondary onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              Save
            </Button>
          </div>
        </form>
        </Modal>
    );
};

export default SettingsModal;