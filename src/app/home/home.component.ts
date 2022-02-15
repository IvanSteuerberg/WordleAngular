import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SettingsGuard } from '../settings/settings.service';

// Lenght of the word.
var WORD_LENGTH: number;
var NUM_TRIES: number;
var LANGUAGE: string;

let language = localStorage.getItem('language');
switch (language) {
  case "ES":
    LANGUAGE = "ES";
    break;

  case "GAL":
    LANGUAGE = "GAL";
    break;

  case "CAT":
    LANGUAGE = "CAT";
    break;

  case "ENG":
    LANGUAGE = "ENG";
    break;

  default:
    LANGUAGE = "ES";
    break;
}
// Number of tries.
let dificultad = localStorage.getItem('dificultad');
switch (dificultad) {
  case "facil":
    WORD_LENGTH = 5;
    NUM_TRIES = 6;
    break;

  case "dificil":
    WORD_LENGTH = 7;
    NUM_TRIES = 7;
    break;

  case "muydificil":
    WORD_LENGTH = 9;
    NUM_TRIES = 6;
    break;

  default:
    WORD_LENGTH = 5;
    NUM_TRIES = 6;
    break;
}

// Letter map.
const LETTERS = (() => {
  // letter -> true. Easier to check.
  const ret: { [key: string]: boolean } = {};
  for (let charCode = 97; charCode < 97 + 26; charCode++) {
    ret[String.fromCharCode(charCode)] = true;
  }
  if (LANGUAGE == "CAT") {
    ret[String.fromCharCode(231)] = true;
  }
  else {
    ret[String.fromCharCode(241)] = true;
  }
  return ret;
})();

// One try.
interface Try {
  letters: Letter[];
}

// One letter in a try.
interface Letter {
  text: string;
  state: LetterState;
}

enum LetterState {
  // you know.
  WRONG,
  // letter in word but position is wrong.
  PARTIAL_MATCH,
  // letter and position are all correct.
  FULL_MATCH,
  // before the current try is submitted.
  PENDING,
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChildren('tryContainer') tryContainers!: QueryList<ElementRef>;

  // Store the target word.
  private targetWord = '';
  private word: any;
  private username!: string;
  private token: any;
  private animation = true;

  async ngOnInit() {
    await this.getWord();
    // Populate initial state of "tries".
    for (let i = 0; i < NUM_TRIES; i++) {
      const letters: Letter[] = [];
      for (let j = 0; j < WORD_LENGTH; j++) {
        letters.push({ text: '', state: LetterState.PENDING });
      }
      this.tries.push({ letters });
    }
    this.targetWord = this.word.name.toLowerCase();
    // Print it out so we can cheat!:)

    // Generate letter counts for target word.
    for (const letter of this.targetWord) {
      const count = this.targetWordLetterCounts[letter];
      if (count == null) {
        this.targetWordLetterCounts[letter] = 0;
      }
      this.targetWordLetterCounts[letter]++;
    }
  }

  // Stores all tries.
  // One try is one row in the UI.
  readonly tries: Try[] = [];

  // This is to make LetterState enum accessible in html template.
  readonly LetterState = LetterState;

  // Keyboard rows.
  readonly keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
  ];

  // Stores the state for the keyboard key indexed by keys.
  readonly curLetterStates: { [key: string]: LetterState } = {};

  // Message shown in the message panel.
  infoMsg = '';
  // Controls info message's fading-out animation.
  fadeOutInfoMessage = false;

  showShareDialogContainer = false;
  showShareDialog = false;

  // Tracks the current letter index.
  private curLetterIndex = 0;

  // Tracks the number of submitted tries.
  private numSubmittedTries = 0;



  // Won or not.
  private won = false;

  // Stores the count for each letter from the target word.
  //
  // For example, if the target word is "happy", then this map will look like:
  //
  // { 'h':1, 'a': 1, 'p': 2, 'y': 1 }
  private targetWordLetterCounts: { [letter: string]: number } = {};

  constructor(private dialogos: MatDialog, private jwtHelper: JwtHelperService, private event: SettingsGuard) {
    if (LANGUAGE == "CAT") {
      this.keyboardRows[1][9] = "Ç"
    }
    this.event.saveSettings.subscribe(() => {
      this.showInfoMessage("Los cambios surgirán efecto al refrescar la página!");
    });

  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.dialogos.openDialogs.length == 0 && this.animation) {
      this.handleClickKey(event.key);
    }
  }
  isDarkMode() {
    if (localStorage.getItem('modoOscuro') == 'light-mode') {
      return false;
    }
    return true;
  }

  // Returns the classes for the given keyboard key based on its state.
  getKeyClass(key: string): string {
    const state = this.curLetterStates[key.toLowerCase()];
    switch (state) {
      case LetterState.FULL_MATCH:
        return 'match key';
      case LetterState.PARTIAL_MATCH:
        return 'partial key';
      case LetterState.WRONG:
        return 'wrong key';
      default:
        let modoOscuro = localStorage.getItem('modoOscuro');
        if (modoOscuro != null && modoOscuro == 'light-mode') {
          return 'key'
        }
        else {
          return 'key-dark-mode'
        }

    }
  }

  handleClickKey(key: string) {
    // Don't process key down when user has-text won the game.
    if (this.won) {
      return;
    }

    // If key is a letter, update the text in the corresponding letter object.
    if (LETTERS[key.toLowerCase()]) {
      // Only allow typing letters in the current try. Don't go over if the
      // current try has not been submitted.
      if (this.curLetterIndex < (this.numSubmittedTries + 1) * WORD_LENGTH) {
        this.setLetter(key);
        this.curLetterIndex++;
      }
    }
    // Handle delete.
    else if (key === 'Backspace') {
      // Don't delete previous try.
      if (this.dialogos.openDialogs.length == 0 && this.animation) {
      if (this.curLetterIndex > this.numSubmittedTries * WORD_LENGTH) {
        this.curLetterIndex--;
        this.setLetter('');
      }
    }
    }
    // Submit the current try and check.
    else if (key === 'Enter') {
      if (this.dialogos.openDialogs.length == 0 && this.animation) {
      this.checkCurrentTry();
    }
  }
  }

  handleClickShare() {
    // 🟩🟨⬜
    // Copy results into clipboard.
    let clipboardContent = '#Wordle\n';
    for (let i = 0; i < this.numSubmittedTries; i++) {
      for (let j = 0; j < WORD_LENGTH; j++) {
        const letter = this.tries[i].letters[j];
        switch (letter.state) {
          case LetterState.FULL_MATCH:
            clipboardContent += '🟩';
            break;
          case LetterState.PARTIAL_MATCH:
            clipboardContent += '🟨';
            break;
          case LetterState.WRONG:
            clipboardContent += '⬜';
            break;
          default:
            break;
        }
      }
      clipboardContent += '\n';
    }
    clipboardContent += this.targetWord + ' ' + this.numSubmittedTries + '/' + NUM_TRIES + '\n' + 'juegawordle.com';
    console.log(clipboardContent);
    navigator.clipboard.writeText(clipboardContent);
    this.showInfoMessage('Resultado copiado en el portapeles');
  }
  handleReplay() {
    window.location.reload();
  }

  private setLetter(letter: string) {
    const tryIndex = Math.floor(this.curLetterIndex / WORD_LENGTH);
    const letterIndex = this.curLetterIndex - tryIndex * WORD_LENGTH;
    this.tries[tryIndex].letters[letterIndex].text = letter;
  }

  private async getWord() {
    const response = await fetch("https://api.juegawordle.com/api/getrandomword/" + WORD_LENGTH + "/" + LANGUAGE, { method: 'GET' });
    this.word = await response.json();
  }

  private async wordExists(word: string) {
    const response = await fetch("https://api.juegawordle.com/api/isword/" + word + "/" + LANGUAGE, { method: 'GET' });
    return await response.json();
  }

  private async insertGame(isWin: boolean) {
    if (await this.isUserAuthenticated()) {
      var content = {
        username: this.username,
        isWin: isWin,
        language: LANGUAGE
      }
      var headers = {
        'Authorization': 'Bearer ' + this.token,
        'Content-Type': 'application/json'
      }
      try {
        await fetch("https://api.juegawordle.com/api/stats/game", { method: 'POST', headers: headers, body: JSON.stringify(content) });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async isUserAuthenticated() {
    this.token = localStorage.getItem("jwt");
    try {
      if (this.token && !this.jwtHelper.isTokenExpired(this.token)) {
        let decodedJWT = JSON.parse(window.atob(this.token.split('.')[1]));
        this.username = decodedJWT["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        return true;
      }
      else {
        localStorage.removeItem("jwt");
        return false;
      }
    } catch {
      localStorage.removeItem("jwt");
      return false;
    }
  }

  private async checkCurrentTry() {
    // Check if user has typed all the letters.
    const curTry = this.tries[this.numSubmittedTries];
    if (curTry.letters.some(letter => letter.text === '')) {
      this.showInfoMessage('No hay suficientes letras.');
      return;
    }

    // Check if the current try is a word in the list.
    const wordFromCurTry =
      curTry.letters.map(letter => letter.text).join('').toUpperCase();
    let exists: Boolean = await this.wordExists(wordFromCurTry);
    if (!exists) {
      this.showInfoMessage('La palabra no está en el diccionario');
      // Shake the current row.
      const tryContainer =
        this.tryContainers.get(this.numSubmittedTries)?.nativeElement as
        HTMLElement;
      tryContainer.classList.add('shake');
      setTimeout(() => {
        tryContainer.classList.remove('shake');
      }, 500);
      return;
    }
    // Check if the current try matches the target word.

    // Stores the check results.

    // Clone the counts map. Need to use it in every check with the initial
    // values.
    this.animation = false;
    const targetWordLetterCounts = { ...this.targetWordLetterCounts };
    const states: LetterState[] = [];
    let currentTry = ''
    for (let i = 0; i < WORD_LENGTH; i++) {
      currentTry = currentTry + curTry.letters[i].text.toLowerCase();
    }
    for (let i = 0; i < WORD_LENGTH; i++) {
      const expected = this.targetWord[i];
      const curLetter = curTry.letters[i];
      const got = curLetter.text.toLowerCase();
      let state = LetterState.WRONG;
      // Need to make sure only performs the check when the letter has not been
      // checked before.
      //
      // For example, if the target word is "happy", then the first "a" user
      // types should be checked, but the second "a" should not, because there
      // is no more "a" left in the target word that has not been checked.
      if (expected === got && targetWordLetterCounts[got] > 0) {
        targetWordLetterCounts[expected]--;
        state = LetterState.FULL_MATCH;
      } else if (
        this.targetWord.includes(got) && targetWordLetterCounts[got] > 0) {
        if (currentTry.includes(got, i + 1)) {
          let isCorrect = false;
          for (let j = i; j < WORD_LENGTH; j++) {
            const expected2 = this.targetWord[j];
            const got2 = curTry.letters[j].text.toLowerCase();
            if (expected2 == got2 && got == got2) {
              isCorrect = true;
            }

          }
          if (isCorrect) {
            let count = 0;
            for (let j = i + 1; j < currentTry.length; j++) {
              if (currentTry[j] == got) {
                count++;
              }
            }
            if (targetWordLetterCounts[got] > count) {
              targetWordLetterCounts[got]--
              state = LetterState.PARTIAL_MATCH;
            }
            else {
              state = LetterState.WRONG;
            }
          }
          else {
            targetWordLetterCounts[got]--
            state = LetterState.PARTIAL_MATCH;
          }
        }
        else {
          targetWordLetterCounts[got]--
          state = LetterState.PARTIAL_MATCH;
        }
      }
      states.push(state);
    }

    // Animate.
    // Again, there must be a more angular way to do this, but...

    // Get the current try.
    const tryContainer =
      this.tryContainers.get(this.numSubmittedTries)?.nativeElement as
      HTMLElement;
    // Get the letter elements.
    const letterEles = tryContainer.querySelectorAll('.letter-container');
    for (let i = 0; i < letterEles.length; i++) {
      // "Fold" the letter, apply the result (and update the style), then unfold
      // it.
      const curLetterEle = letterEles[i];
      curLetterEle.classList.add('fold');
      // Wait for the fold animation to finish.
      await this.wait(180);
      // Update state. This will also update styles.
      curTry.letters[i].state = states[i];
      // Unfold.
      curLetterEle.classList.remove('fold');
      await this.wait(180);
    }

    // Save to keyboard key states.
    //
    // Do this after the current try has been submitted and the animation above
    // is done.
    for (let i = 0; i < WORD_LENGTH; i++) {
      const curLetter = curTry.letters[i];
      const got = curLetter.text.toLowerCase();
      const curStoredState = this.curLetterStates[got];
      const targetState = states[i];
      // This allows override state with better result.
      //
      // For example, if "A" was partial match in previous try, and becomes full
      // match in the current try, we update the key state to the full match
      // (because its enum value is larger).
      if (curStoredState == null || targetState > curStoredState) {
        this.curLetterStates[got] = targetState;
      }
    }

    this.numSubmittedTries++;
    this.animation = true;
    // Check if all letters in the current try are correct.
    if (states.every(state => state === LetterState.FULL_MATCH)) {
      this.showInfoMessage('VICTORIA!');
      this.won = true;
      await this.insertGame(true);
      // Bounce animation.
      for (let i = 0; i < letterEles.length; i++) {
        const curLetterEle = letterEles[i];
        curLetterEle.classList.add('bounce');
        await this.wait(160);
      }
      this.showShare();
      return;
    }

    // Running out of tries. Show correct answer.
    //
    // If you can hear, my heater is on.. sorry about that!
    if (this.numSubmittedTries === NUM_TRIES) {
      // Don't hide it.
      this.showInfoMessage(this.targetWord.toUpperCase(), false);
      await this.insertGame(false);
      this.showShare();
    }
  }

  private showInfoMessage(msg: string, hide = true) {
    this.infoMsg = msg;
    if (hide) {
      // Hide after 2s.
      setTimeout(() => {
        this.fadeOutInfoMessage = true;
        // Reset when animation is done.
        // Sorry, little bit hacky here.
        setTimeout(() => {
          this.infoMsg = '';
          this.fadeOutInfoMessage = false;
        }, 500);
      }, 2000);
    }
  }

  private async wait(ms: number) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    })
  }

  private showShare() {
    setTimeout(() => {
      this.showShareDialogContainer = true;
      // Wait a tick till dialog container is displayed.
      setTimeout(() => {
        // Slide in the share dialog.
        this.showShareDialog = true;
      });
    }, 1500);
  }
}

