import React from 'react'
import {Modal, Box} from '@mui/material';


type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
    component: any;
    setRoute: (route: string) => void;
}

const CustomModal: React.FC<Props> = ({open, setOpen, activeItem, component: Component, setRoute}) => {
  return (
    <Modal
    open={open}
    onClose={() => setOpen(false)}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    >
        <Box
        className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[450px] bg-white dark:bg-slate-900 rounded[8px] shadow p-4 outline-none mx-2"
        >
            <Component
            setOpen={setOpen}
            setRoute={setRoute}
            />
        </Box>
    </Modal>
  )
}
export default CustomModal;