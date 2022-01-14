import React, {useRef, useState}                from 'react';
import {Button, Row}                            from "antd";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import AudioPlayer                              from "react-h5-audio-player";

import {changeAudioVolume, toggleAudio, togglePlayer} from "../../Redux/Actions/appActions";
import apiProgram                                     from "../../Api/Program/Program";
import {faHeadphones}                                 from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon}                              from "@fortawesome/react-fontawesome";

const Player = React.memo(() => {
    const sourceUrl = useRef('');

    const playButton = useRef(null);

    const [title, setTitle] = useState('');

    const [audioSrc, setAudioSrc] = useState('');

    const app = useSelector(state => state.app);

    const user = useSelector(state => state.user, shallowEqual);

    const isLogin = Boolean(user.authToken);

    const isOpenPlayerView = app.isOpenPlayerView;

    const isPlayingAudio = app.isPlayingAudio;

    const audioVolume = app.audioVolume;

    const dispatch = useDispatch();

    const controller = new AbortController();

    const handlePlayAudio = () => {
        if (isPlayingAudio) return;
        setAudioSrc(sourceUrl.current);
        dispatch(toggleAudio(true));
    };

    const handlePauseAudio = () => {
        setAudioSrc('');
        controller.abort();
        dispatch(toggleAudio(false));
    };

    const onVolumeChange = (e) => {
        const newVolume = e.target.volume;
        dispatch(changeAudioVolume({volume: newVolume}));
    };

    const onPlaying = () => {
        apiProgram.getPlayingProgram({}, (err, res) => {
            if (res) {
                if (res?.url) {
                    let newUrl = res?.url ?? "";
                    if (res.sourceStream.channel) {
                        newUrl = `http://${newUrl}/;`;
                    }
                    sourceUrl.current = newUrl;
                    setAudioSrc(newUrl);
                    setTitle(res?.title ?? "");
                }
            }
        });
    };

    React.useEffect(() => {
        if (!user.authToken) return;
        onPlaying();
    }, [user.authToken]);

    React.useEffect(() => {
        if (isOpenPlayerView) {
            const button = document.querySelector('button[aria-label="Play"]');
            if (button && !playButton.current) {
                playButton.current = button;
                button.addEventListener('click', () => {
                    onPlaying();
                });
            }
        }
    }, [isOpenPlayerView]);

    if (audioVolume === undefined || !isLogin) {
        return null;
    }

    return (
        <div className="player_base">
            <Row className={`player_container ${isOpenPlayerView ? 'show' : ''}`}>
                <Row className={`title justify-content-center w-100 ${isOpenPlayerView ? '' : 'hidden'}`}>
                    <div className="text-center text-bold-5" style={{fontSize: '16px'}}>
                        {`Chương trình: ${title}` ?? 'Chương trình của đài'}
                    </div>
                </Row>
                <Row className="w-100">
                    {
                        !isOpenPlayerView &&
                        <Button
                            id="toggle-button"
                            className={`row-all-center ${isOpenPlayerView ? 'hidden_player_button' : 'setting_spin_button'}`}
                            icon={<FontAwesomeIcon icon={faHeadphones}
                                                   className={isPlayingAudio ? 'spinning_icon' : ''}/>}
                            onClick={() => dispatch(togglePlayer())}
                        />
                    }
                    <div className={`player_view ${!isOpenPlayerView ? 'hidden' : ''}`}>
                        <AudioPlayer
                            src={audioSrc}
                            className="player shadow-none"
                            autoPlay={isPlayingAudio}
                            onPlay={handlePlayAudio}
                            onPause={handlePauseAudio}
                            volume={audioVolume}
                            onVolumeChange={onVolumeChange}
                            autoPlayAfterSrcChange={false}
                            showJumpControls={false}
                            customAdditionalControls={[]}
                        />
                    </div>
                </Row>
            </Row>
        </div>
    );
});

export default Player;
