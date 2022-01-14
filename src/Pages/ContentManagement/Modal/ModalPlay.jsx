import React                           from 'react';
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import AudioPlayer                     from "react-h5-audio-player";
import moment                          from "moment";

import AudioImage from "../../../Assets/icon/audio-player.png";

const ModalPlay = React.memo(({visible, handleClose, selectedItem}) => {
    const [isPlaying, setIsPlaying] = React.useState(false);

    React.useEffect(() => {
        if (visible) {
            setIsPlaying(false);
        }
    }, [visible]);

    return (
        <Modal isOpen={visible}>
            <ModalHeader toggle={handleClose}>
                Nghe file
            </ModalHeader>
            <ModalBody>
                <div className="card-width">
                    <div className="mb-3 w-100">
                        <div className="d-flex content-play">
                            <div className="image-size my-auto" style={{width: '40%'}}>
                                <img
                                    id="audio"
                                    width="100%"
                                    height="100%"
                                    className={`image${isPlaying ? '' : ' image-stop-spinning'}`}
                                    alt=""
                                    src={AudioImage}
                                />
                            </div>
                            <div className="ml-3 border-left pl-3 my-auto modal-file-information"
                                 style={{width: '60%'}}>
                                <div className="my-2 font-box-audio">
                                    <span className="text-bold-5">Tiêu đề: </span>
                                    {selectedItem?.title}
                                </div>
                                <div className="my-2 font-box-audio">
                                    <span className="text-bold-5">Upload file: </span>
                                    {selectedItem?.user?.username}
                                </div>
                                <div className="my-2 font-box-audio">
                                    <span className="text-bold-5"> Ngày upload: </span>
                                    {moment(selectedItem?.created).format("DD/MM/YYYY HH:mm:ss")}
                                </div>
                                <div className="my-2 font-box-audio">
                                    <span className="text-bold-5">Ghi chú: </span>
                                    {selectedItem?.note ?? '----'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-50 mt-1">
                        <AudioPlayer
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            className="shadow-none"
                            src={selectedItem?.url}
                            autoPlayAfterSrcChange={false}
                        />
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
});

export default ModalPlay;