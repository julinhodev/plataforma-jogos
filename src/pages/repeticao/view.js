import React, { useState, useEffect } from "react";

import GameOptions from '../../components/game-options';
import GameScore from '../../components/game-score';

import { 
    Area,
    Container,
    Header,
    Options,
    Option
} from './styles';

const View = () => {

    const [options] = useState(["1", "B", "2", "D", "5", "F", "7", "H", "9"]);

    const [status, setStatus] = useState(0);
    const [locked, setLocked] = useState(true);
    const [score, setScore] = useState(0);
    const [scoreRecorde, setScoreRecord] = useState(0);
    const [currentSequence, setCurrentSequence] = useState([]);
    const [currentBetIndex, setCurrentBetIndex] = useState(0);
    const [currentBless, setCurrentBless] = useState(-1);
    const [tasks, setTasks] = useState([]);

    const startGame = () => {
        if(status !== 0) return;

        reset();
        sequence(0);
    }

    const restart = () => {
        if(status === 0) return;

        reset();
        sequence(0);
    }

    const reset = () => {

        for(let task in tasks) {
            clearInterval(tasks[task]);
        }
        if(tasks.length > 0) {
            setTasks([]);
        }

        setLocked(true);
        setStatus(0);
        setScore(0);
        setCurrentBless(-1);
        setCurrentBetIndex(0);
    }

    const sequence = (level) => {
        setStatus(1);
        setCurrentBetIndex(0);
        currentSequence.length = 0;
        setLocked(true);
        let count = 0;
        let timer = setInterval(() => {
            if(count >= (2 + (level * 2))) {
                clearInterval(timer);
                let timer2 = setInterval(() => {
                    setStatus(2);
                    setLocked(false);
                    setCurrentSequence(currentSequence);
                    clearInterval(timer2);
                }, 1000);
                tasks.push(timer2);
            } else {
                let sortedIndex = sortIndex();
                bless(sortedIndex);
                count++;
            }
        }, 2000);
        tasks.push(timer);
    }

    const sortIndex = () => {
        let got = false;
        let target = 0;
        while(!got) {
            let value = Math.floor(Math.random() * 8);
            if(currentSequence.length > 0) {
                let last = currentSequence[ currentSequence.length - 1 ];
                if(last !== value) {
                    target = value;
                    got = true;
                }
            } else {
                target = value;
                got = true;
            }
        }
        currentSequence.push(target);
        return target;
    }

    const bless = (index) => {
        setCurrentBless(index);
        let timer = setInterval(() => {
            setCurrentBless(-1);
            clearTimeout(timer);
        }, 500);
        tasks.push(timer);
    }

    const bet = (index) => {
      if(locked) return;
      
      setLocked(true);
      let timer = setInterval(() => {
            setLocked(false);
          
            let answer = currentSequence[currentBetIndex]; 
            if(answer === index) {
                let next = currentBetIndex + 1;
                setCurrentBetIndex(next);
                if(next === currentSequence.length) {
                    win();
                }
            } else {
                lose();
            }
            
            clearTimeout(timer);
      }, 500);
      tasks.push(timer);
      
    }

    const win = () => {
        let nextRecord = score + 1;
        setScore(nextRecord);
        if(nextRecord > scoreRecorde) setScoreRecord(nextRecord);
        setLocked(true);
        setStatus(4);
        let timer = setInterval(() => {
            sequence(score + 1);
            clearInterval(timer);
        }, 2000);
        tasks.push(timer);
    }
    
    const lose = () => {
        setScore(0);
        setLocked(true);
        setStatus(3);
        let timer = setInterval(() => {
            reset();
            clearInterval(timer);
        }, 2000);
        tasks.push(timer);
    }

    useEffect(() => {
        setScoreRecord(0);
        reset();
    }, []);

    return (
        <>
            <Area>
                <GameOptions 
                    title="Repetição" 
                    play={()=>startGame()}
                    restart={()=>restart()}
                    stop={()=>reset()}/>
                <Container>
                    <Header>
                        {status === 0 && "AGUARDANDO"}
                        {status === 1 && "DECORANDO"}
                        {status === 2 && "VAI!"}
                        {status === 3 && "ERROU!!"}
                        {status === 4 && "ACERTOU!!"}
                    </Header>
                    <Options>
                        {options.map((item, key) =>
                            <div key={key}>
                                {currentBless === key && <Option bless={true} onClick={() => bet(key)}>{item}</Option>}
                                {currentBless !== key && <Option bless={false} onClick={() => bet(key)}>{item}</Option>}
                            </div>
                        )}
                    </Options>
                    {/*<Footer>
                        <Score>
                            <b>{score}</b>
                            <span>ATUAL</span>
                        </Score>
                        <Score>
                            <b>{scoreRecorde}</b>
                            <span>RECORDE</span>
                        </Score>
                    </Footer>*/}
                </Container>
                <GameScore 
                    options={{  
                        items: [
                            { title: "Score", icon: "fas fa-trophy", value: score },
                            { title: "Recorde", icon: "fas fa-medal", value: scoreRecorde },
                        ]
                    }}/>
            </Area>
        </>
    );
};

export default View;