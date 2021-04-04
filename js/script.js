'use strict'

// Selecting DOM

const keyboard = document.querySelector('.piano__keyboard')
const controls = document.querySelectorAll('.piano__control__option')
const pianoNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const keyboardMap = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I',
    'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N'
]
const playBtn = document.querySelector('.piano__play-btn')
const tempoSelect = document.querySelector('.piano__tempo')
const songSelect = document.querySelector('.piano__song-list')
const keys = []

// Songs
const jingleBells = `B3,,B3,,B3,,,B3,,B3,,B3,,,,
                        B3,,D4,,G3,,A3,B3,,,,,,
                        C4,,C4,,C4,,,,C4,C4,,B3,,B3,,,,
                        B3,B3,B3,,A3,,A3,,B3,,A3,,,,D4`
const happyBirthday = `G4,G4,A4,,G4,,C5,,B4,,,,
                        G4,G4,A4,,G4,,D5,,C5,,,,
                        G4,G4,G5,,E5,,C5,,B4,,A4,,,
                        F5,F5,E5,,C5,,D5,,C5`

const playSong = (noteString, tempo,cb) => {
    let notes = noteString.split(',')
    let currentNote = 0
    let mousedown = new Event('mousedown')
    let mouseup = new Event('mouseup')
    let btn

    let interval = setInterval(() => {
        if (currentNote < notes.length) {
            if (notes[currentNote].trim() !== '') {
                if (btn) {
                    btn.dispatchEvent(mouseup)
                }
                btn = document.querySelector(`[data-letter-note="${notes[currentNote].trim()}"]`)
                btn.dispatchEvent(mousedown)
            }
            currentNote++
        } else {
            btn.dispatchEvent(mouseup)
            clearInterval(interval)
            cb()
        }
    }, 300 / tempo)
}

playBtn.addEventListener('mousedown', () => {
    let tempo = +tempoSelect.value
    let songNum = +songSelect.value
    playBtn.disabled = true
    const enablePlayBtn = () => playBtn.disabled = false
    switch (songNum) {
        case 1:
            playSong(jingleBells, tempo, enablePlayBtn);
            break
        case 2:
            playSong(happyBirthday, tempo, enablePlayBtn);
            break
    }

})

// Create keys

const init = () => {
    for (let i = 1; i <= 5; i++) {
        for (let j = 0; j < 7; j++) {
            let key = createKey('white', pianoNotes[j], i)
            key.dataset.keyboard = keyboardMap[j + (i - 1) * 7]
            keyboard.appendChild(key)

            if (j != 2 && j != 6) {
                key = createKey('black', pianoNotes[j], i)
                key.dataset.keyboard = '⇧+' + keyboardMap[j + (i - 1) * 7]
                let emptySpace = document.createElement('div')
                emptySpace.className = 'empty-space'
                emptySpace.appendChild(key)
                keyboard.appendChild(emptySpace)
            }
        }
    }
}

// Assing keys to sounds and add functionality of color
const createKey = (type, note, octave) => {
    const key = document.createElement('button')
    key.className = `piano__key piano__key--${type}`
    key.dataset.letterNote = type == 'white' ? note + octave : note + '#' + octave
    key.dataset.letterNoteFileName = type == 'white' ? note + octave : note + 's' + octave
    key.textContent = key.dataset.letterNote
    keys.push(key)

    key.addEventListener('mousedown', () => {
        playSound(key)
        key.classList.add('piano__key--playing')
    })
    key.addEventListener('mouseup', () => {
        key.classList.remove('piano__key--playing')
    })
    key.addEventListener('mouseleave', () => {
        key.classList.remove('piano__key--playing')

    })

    return key
}

// Adding Shift to data-keyboard when it's pressed down
document.addEventListener('keydown', e => {
    if (e.repeat) {
        return
    }
    pressKey('mousedown', e)
})

// Removing shift to data-keyboard when it's up
document.addEventListener('keyup', e => {
    pressKey('mouseup', e)
})

// Press key function, reducing repetitive code
let pressKey = (mouseEvent, e) => {
    let lastLetter = e.code.substring(e.code.length - 1)
    let isShiftPressed = e.shiftKey
    let selector
    if (isShiftPressed) {
        selector = `[data-keyboard="⇧+${lastLetter}"]`
    } else {
        selector = `[data-keyboard="${lastLetter}"]`
    }
    let key = document.querySelector(selector)
    if (key !== null) {
        let event = new Event(mouseEvent)
        key.dispatchEvent(event)
    }
}

// Play Sounds
const playSound = key => {
    const audio = document.createElement('audio')
    audio.src = `sounds/${key.dataset.letterNoteFileName}.mp3`
    audio.play().then(() => audio.remove())
}

// Switching among letter notes type on keys
controls.forEach(input => {
    input.addEventListener('input', () => {
        let value = input.value
        let type
        switch (value) {
            case 'letterNotes':
                type = 'letterNote';
                break
            case 'keyboard':
                type = 'keyboard';
                break
            case 'none':
                type = '';
                break
        }
        keys.forEach(key => {
            key.textContent = key.dataset[value]
        })
    })
})

init()