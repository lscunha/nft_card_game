import { ethers } from 'ethers';

import { ABI } from '../contract';
import { playAudio, sparcle } from '../utils/animation';
import { defenseSound } from '../assets';

const emptyAccount = '0x0000000000000000000000000000000000000000'

const AddNewEvent = (eventFilter, provider, cd) => {
    provider.removerLister(eventFIlter);

    provider.on(eventFIlter, (Logs) => {
        const parsedLog = (new ethers.utils.Interface(ABI)).parseLog
        (Logs);

        cb(parsedLog);
    })
}

const getCoords = (cardRef) => {
    const { left, top, width, height } = cardRef.current.
    getBoundClientRect();

    return{
        pageX: left + width / 2,
        pageY: top + height /2.25,
    }
}

export const createEventListeners = ({ navigate, contract, provider,  walletAddress, setShowAlert, setUpdateGameData, player1Ref, player2Ref}) => {
    const NewPlayerEventFilter = contract.filters.Newplayer();

    AddNewEvent(NewPlayerEventFilter, provider, ({ args}) => {
        console.log(' New Player Created!', args);

        if(walletAddress ===args.owner){
            setShowAlert({
                status: true,
                type: 'sucess',
                message: " Player has been successfully registered"
            });
        }
    });

    const NewGameTokenEventFilter = contract.filters.NewGameToken();
    AddNewEvent(NewGameTokenEventFilter, provider, ({ args }) =>{
        console.log('New game token created!', args);

        if(walletAddress.toLowerCase() === args.owner.toLowerCase()){
            setShowAlert({
                status: true,
                type: 'sucess',
                message: 'Player game token has been successfully created'
            })

            navigate('/create-battle')
        }
    })


    const NewBattleEventFilter = contract.filters.NewBattle();

    AddNewEvent(NewBattleEventFilter, provider, ({ args}) => {
        console.log('New battle started!', args, walletAddress);

        if(walletAddress.toLowerCase() === args.player1.toLowerCase()
        || walletAddress.toLowerCase() === args.player2.toLowerCase
        ()) {
            navigate(`/battle/${args.battleName}`)
        }

        setUpdateGameData((prevUpdateGameData) => prevUpdateGameData
         + 1);
    });

    const BattleMoveEventFilter =contract.filters.BattleMove();

    AddNewEvent(BattleMoveEventFilter, provider, ({args}) =>{
        console.log('Battle move initiated!', args);
    });

    const RoundEndedEventFilter = contract.filters.RoundEnded();

    AddNewEvent(RoundEndedEventFilter, provider, ({args}) =>{
        console.log('Round Ended!', args);

        for(let i = 0; i < args.damegedPlayers.length; i += 1){
            if(args.damagedPlayers[i] !==
                emptyAccount){
                    if(args.damagedPlayers[i] === walletAddress){
                        sparcle(getCoords(player1Ref));
                    } else if(args.damagedPlayers[i] !== walletAddress){
                        sparcle(getCoords(player2Ref));
                    }
                } else {
                    playAudio(defenseSound)
            }
        }

        setUpdateGameData((prevUpdateGameData) => prevUpdateGameData
         + 1);
    });

    const BattleEndedEventFilter = contract.filters.RoundEnded();

    AddNewEvent(BattleEndedEventFilter, provider, ({args}) =>{
        console.log('Battle ended!', args, walletAddress);

        if(walletAddress.toLowerCase() === args.winner.toLowerCase()){
            setShowAlert({ status: true, type: ' sucess', message: 'You Won!'})
        } else if( walletAddress.toLowerCase() === args.loser.toLowerCase()){
            setShowAlert({ status: true, type: 'failure', massage: 'You Lost'})
        }

        navigate('/create-battle')
    });    
}