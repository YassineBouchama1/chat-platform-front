/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

import Modal from '../Modal';
import Button from '../Button';

interface NotificationModalProps {
    isOpen?: boolean;
    onClose: () => void;

}

const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,


}) => {

    const [isLoading, setIsLoading] = useState(false)



    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form >
                <div className='space-y-12'>
                    <div className='border-b border-gray-900/10 pb-12'>
                        <h2
                            className='
                text-base 
                font-semibold 
                leading-7 
                text-gray-900
              '
                        >
                            Notifecations list
                        </h2>





                    </div>
                </div>

                <div
                    className='
            mt-6 
            flex 
            items-center 
            justify-end 
            gap-x-6
          '
                >
                    <Button disabled={isLoading} secondary onClick={onClose}>
                        Cancel
                    </Button>

                </div>
            </form>
        </Modal>
    );
};

export default NotificationModal;