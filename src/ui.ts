import { countPossibleSecrets } from './core/math';
import {
  addRecord,
  createInitialState,
  loadRecordsFromStorage,
  saveRecordsToStorage,
  startGame,
  submitGuess,
} from './core/state';
import { createDigitValidator } from './core/validator';
import { BaseName, GameRecord, GameSettings, GameState } from './types';

const BASES: readonly {
  readonly name: BaseName;
  readonly radix: number;
  readonly label: string;
}[] = [
  { name: 'bin', radix: 2, label: 'Binary (2)' },
  { name: 'oct', radix: 8, label: 'Octal (8)' },
  { name: 'dec', radix: 10, label: 'Decimal (10)' },
  { name: 'hex', radix: 16, label: 'Hex (16)' },
];

const LENGTHS: readonly number[] = [2, 3, 4, 5, 6];

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const mountApp = (root: HTMLElement): void => {
  let settings: GameSettings = { length: 4, base: 'dec' };
  let state: GameState = createInitialState(settings);
  let records: readonly GameRecord[] = loadRecordsFromStorage();
  let timerIntervalId: number | null = null;
  let feedbackMessage = '';
  let feedbackType: 'error' | 'warning' | 'success' | '' = '';

  const stopTimer = () => {
    if (timerIntervalId !== null) {
      window.clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerIntervalId = window.setInterval(() => {
      updateTimerDisplay();
    }, 1000);
  };

  const updateTimerDisplay = () => {
    const timerValueEl = root.querySelector('.status-timer-value');
    if (timerValueEl && state.status === 'playing' && state.startTime) {
      const elapsed = Date.now() - state.startTime;
      timerValueEl.textContent = formatDuration(elapsed);
    }
  };

  const render = (): void => {
    root.replaceChildren();

    const appContainer = document.createElement('main');
    appContainer.className = 'app-container';

    const header = document.createElement('header');
    header.className = 'app-header';

    const title = document.createElement('h1');
    title.className = 'app-title';
    title.textContent = 'Bulls & Cows';

    const subtitle = document.createElement('p');
    subtitle.className = 'app-subtitle';
    subtitle.textContent =
      'Guess the secret number with unique digits. Bulls = right digit & place, Cows = right digit & wrong place.';

    header.appendChild(title);
    header.appendChild(subtitle);
    appContainer.appendChild(header);

    if (state.status === 'idle') {
      appContainer.appendChild(buildSettingsCard());
    } else {
      appContainer.appendChild(buildGameCard());
    }

    appContainer.appendChild(buildRecordsCard());

    root.appendChild(appContainer);
  };

  const buildSettingsCard = (): HTMLElement => {
    const card = document.createElement('section');
    card.className = 'card';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = 'Game Settings';
    card.appendChild(title);

    const baseGroup = document.createElement('div');
    baseGroup.className = 'form-group';

    const baseLabel = document.createElement('label');
    baseLabel.className = 'form-label';
    baseLabel.textContent = 'Number System (Base)';
    baseGroup.appendChild(baseLabel);

    const baseBtnGroup = document.createElement('div');
    baseBtnGroup.className = 'btn-group';

    BASES.forEach((b) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `option-btn ${settings.base === b.name ? 'active' : ''}`;
      btn.textContent = b.label;
      btn.addEventListener('click', () => {
        const nextBase = b.name;
        const nextLength = nextBase === 'bin' ? 2 : settings.length;
        settings = { base: nextBase, length: nextLength };
        render();
      });
      baseBtnGroup.appendChild(btn);
    });
    baseGroup.appendChild(baseBtnGroup);
    card.appendChild(baseGroup);

    const lengthGroup = document.createElement('div');
    lengthGroup.className = 'form-group';

    const lengthLabel = document.createElement('label');
    lengthLabel.className = 'form-label';
    lengthLabel.textContent = 'Secret Length (Unique Digits)';
    lengthGroup.appendChild(lengthLabel);

    const lengthBtnGroup = document.createElement('div');
    lengthBtnGroup.className = 'btn-group';

    LENGTHS.forEach((len) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isBin = settings.base === 'bin';
      const isAllowed = !isBin || len === 2;

      btn.className = `option-btn ${settings.length === len ? 'active' : ''}`;
      btn.textContent = `${len} Digits`;
      btn.disabled = !isAllowed;

      if (isAllowed) {
        btn.addEventListener('click', () => {
          settings = { ...settings, length: len };
          render();
        });
      }
      lengthBtnGroup.appendChild(btn);
    });
    lengthGroup.appendChild(lengthBtnGroup);
    card.appendChild(lengthGroup);

    const combinations = countPossibleSecrets(settings.length, settings.base);
    const infoBanner = document.createElement('div');
    infoBanner.className = 'info-banner';

    const infoText = document.createElement('span');
    infoText.textContent = `Possible combinations (permutations):`;

    const infoCount = document.createElement('strong');
    infoCount.textContent = combinations.toLocaleString();

    infoBanner.appendChild(infoText);
    infoBanner.appendChild(infoCount);
    card.appendChild(infoBanner);

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.className = 'primary-btn';
    startBtn.textContent = 'Start New Round';
    startBtn.addEventListener('click', () => {
      state = startGame(settings);
      feedbackMessage = '';
      feedbackType = '';
      startTimer();
      render();
    });
    card.appendChild(startBtn);

    return card;
  };

  const buildGameCard = (): HTMLElement => {
    const card = document.createElement('section');
    card.className = 'card';

    const headerRow = document.createElement('div');
    headerRow.className = 'card-title';

    const titleText = document.createElement('span');
    titleText.textContent = state.status === 'won' ? 'Game Over' : 'Playing Round';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'secondary-btn';
    resetBtn.textContent = 'Change Settings';
    resetBtn.addEventListener('click', () => {
      stopTimer();
      state = createInitialState(settings);
      feedbackMessage = '';
      feedbackType = '';
      render();
    });

    headerRow.appendChild(titleText);
    headerRow.appendChild(resetBtn);
    card.appendChild(headerRow);

    const statusBar = document.createElement('div');
    statusBar.className = 'status-bar';

    const settingsItem = document.createElement('div');
    settingsItem.className = 'status-item';
    const settingsLabel = document.createElement('span');
    settingsLabel.className = 'status-item-label';
    settingsLabel.textContent = 'Configuration';
    const settingsVal = document.createElement('span');
    settingsVal.className = 'status-item-value';
    settingsVal.textContent = `${state.settings.base.toUpperCase()} (${state.settings.length} digits)`;
    settingsItem.appendChild(settingsLabel);
    settingsItem.appendChild(settingsVal);

    const timerItem = document.createElement('div');
    timerItem.className = 'status-item';
    const timerLabel = document.createElement('span');
    timerLabel.className = 'status-item-label';
    timerLabel.textContent = 'Time';
    const timerVal = document.createElement('span');
    timerVal.className = 'status-item-value status-timer-value';
    const initialElapsed =
      state.status === 'won' && state.endTime && state.startTime
        ? state.endTime - state.startTime
        : state.startTime
          ? Date.now() - state.startTime
          : 0;
    timerVal.textContent = formatDuration(initialElapsed);
    timerItem.appendChild(timerLabel);
    timerItem.appendChild(timerVal);

    const attemptsItem = document.createElement('div');
    attemptsItem.className = 'status-item';
    const attemptsLabel = document.createElement('span');
    attemptsLabel.className = 'status-item-label';
    attemptsLabel.textContent = 'Attempts';
    const attemptsVal = document.createElement('span');
    attemptsVal.className = 'status-item-value';
    attemptsVal.textContent = state.history.length.toString();
    attemptsItem.appendChild(attemptsLabel);
    attemptsItem.appendChild(attemptsVal);

    statusBar.appendChild(settingsItem);
    statusBar.appendChild(timerItem);
    statusBar.appendChild(attemptsItem);
    card.appendChild(statusBar);

    if (state.status === 'won') {
      const winBanner = document.createElement('div');
      winBanner.className = 'win-banner';

      const winTitle = document.createElement('h3');
      winTitle.className = 'win-title';
      winTitle.textContent = '🎉 Congratulations, You Won!';

      const winDetails = document.createElement('p');
      winDetails.className = 'win-details';
      const durationMs = (state.endTime ?? Date.now()) - (state.startTime ?? Date.now());
      winDetails.textContent = `You cracked the code in ${state.history.length} attempts and ${formatDuration(durationMs)}!`;

      const winSecret = document.createElement('p');
      winSecret.className = 'win-secret';
      winSecret.textContent = state.secret.toUpperCase();

      winBanner.appendChild(winTitle);
      winBanner.appendChild(winDetails);
      winBanner.appendChild(winSecret);

      const playAgainBtn = document.createElement('button');
      playAgainBtn.type = 'button';
      playAgainBtn.className = 'primary-btn';
      playAgainBtn.style.marginTop = '1rem';
      playAgainBtn.textContent = 'Play Again With Same Settings';
      playAgainBtn.addEventListener('click', () => {
        state = startGame(settings);
        feedbackMessage = '';
        feedbackType = '';
        startTimer();
        render();
      });
      winBanner.appendChild(playAgainBtn);

      card.appendChild(winBanner);
    } else {
      const inputForm = document.createElement('form');
      inputForm.className = 'form-group';
      inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleGuessSubmit();
      });

      const inputContainer = document.createElement('div');
      inputContainer.className = 'input-container';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'guess-input';
      input.maxLength = state.settings.length;
      input.placeholder = `${'•'.repeat(state.settings.length)}`;
      input.autocomplete = 'off';
      input.spellcheck = false;

      // Filter characters in real-time using createDigitValidator
      const digitValidator = createDigitValidator(state.settings.base);
      input.addEventListener('input', () => {
        const chars = input.value.split('');
        const validChars = chars.filter((c) => digitValidator(c));
        input.value = validChars.join('');
      });

      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'primary-btn';
      submitBtn.style.width = 'auto';
      submitBtn.style.padding = '0 1.5rem';
      submitBtn.textContent = 'Guess';

      inputContainer.appendChild(input);
      inputContainer.appendChild(submitBtn);
      inputForm.appendChild(inputContainer);
      card.appendChild(inputForm);

      const handleGuessSubmit = () => {
        const val = input.value.trim();
        if (val.length !== state.settings.length) {
          feedbackMessage = `Guess must be exactly ${state.settings.length} unique digits.`;
          feedbackType = 'error';
          updateFeedback();
          return;
        }

        const outcome = submitGuess(state, val);
        if (outcome.error) {
          feedbackMessage = outcome.error;
          feedbackType = 'error';
          updateFeedback();
          return;
        }

        if (outcome.duplicate) {
          feedbackMessage = `Duplicate attempt: "${val.toUpperCase()}" was already tried!`;
          feedbackType = 'warning';
          updateFeedback();
          return;
        }

        state = outcome.state;
        feedbackMessage = '';
        feedbackType = '';

        if (state.status === 'won') {
          stopTimer();
          const duration = (state.endTime ?? Date.now()) - (state.startTime ?? Date.now());
          const newRecord: GameRecord = {
            id: String(Date.now()),
            base: state.settings.base,
            length: state.settings.length,
            attempts: state.history.length,
            durationMs: duration,
            date: new Date().toLocaleDateString(),
          };
          records = addRecord(records, newRecord);
          saveRecordsToStorage(records);
        }

        render();
        setTimeout(() => {
          const freshInput = root.querySelector('.guess-input') as HTMLInputElement | null;
          if (freshInput) freshInput.focus();
        }, 50);
      };

      setTimeout(() => input.focus(), 50);
    }

    const feedbackEl = document.createElement('div');
    feedbackEl.className = `feedback-msg ${feedbackType}`;
    feedbackEl.textContent = feedbackMessage;
    card.appendChild(feedbackEl);

    const updateFeedback = () => {
      feedbackEl.className = `feedback-msg ${feedbackType}`;
      feedbackEl.textContent = feedbackMessage;
    };

    const historySection = document.createElement('div');

    const historyTitle = document.createElement('h3');
    historyTitle.className = 'form-label';
    historyTitle.textContent = `Attempt History (${state.history.length})`;
    historySection.appendChild(historyTitle);

    if (state.history.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'empty-history';
      emptyBox.textContent = 'No attempts yet. Enter your first guess above!';
      historySection.appendChild(emptyBox);
    } else {
      const historyList = document.createElement('div');
      historyList.className = 'history-list';

      const reversedEntries = [...state.history].reverse();

      reversedEntries.forEach((entry, idx) => {
        const originalIndex = state.history.length - idx;
        const item = document.createElement('div');
        item.className = 'history-item';

        const guessBox = document.createElement('div');
        guessBox.className = 'history-guess-box';

        const indexSpan = document.createElement('span');
        indexSpan.className = 'history-index';
        indexSpan.textContent = `#${originalIndex}`;

        const guessSpan = document.createElement('span');
        guessSpan.className = 'history-guess';
        guessSpan.textContent = entry.guess.toUpperCase();

        guessBox.appendChild(indexSpan);
        guessBox.appendChild(guessSpan);

        const badges = document.createElement('div');
        badges.className = 'history-badges';

        const bullsBadge = document.createElement('span');
        bullsBadge.className = 'badge badge-bulls';
        bullsBadge.textContent = `🐂 ${entry.bulls} Bulls`;

        const cowsBadge = document.createElement('span');
        cowsBadge.className = 'badge badge-cows';
        cowsBadge.textContent = `🐄 ${entry.cows} Cows`;

        badges.appendChild(bullsBadge);
        badges.appendChild(cowsBadge);

        item.appendChild(guessBox);
        item.appendChild(badges);
        historyList.appendChild(item);
      });

      historySection.appendChild(historyList);
    }

    card.appendChild(historySection);
    return card;
  };

  const buildRecordsCard = (): HTMLElement => {
    const card = document.createElement('section');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-title';

    const title = document.createElement('span');
    title.textContent = '🏆 Hall of Fame (Top Records)';

    header.appendChild(title);

    if (records.length > 0) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'secondary-btn';
      clearBtn.textContent = 'Clear Records';
      clearBtn.addEventListener('click', () => {
        records = [];
        saveRecordsToStorage(records);
        render();
      });
      header.appendChild(clearBtn);
    }

    card.appendChild(header);

    if (records.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'empty-history';
      emptyMsg.textContent = 'No records recorded yet. Complete a round to earn your spot!';
      card.appendChild(emptyMsg);
    } else {
      const table = document.createElement('table');
      table.className = 'records-table';

      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');

      ['Rank', 'Mode', 'Attempts', 'Time', 'Date'].forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      records.forEach((rec, idx) => {
        const row = document.createElement('tr');

        const tdRank = document.createElement('td');
        tdRank.textContent =
          idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`;
        row.appendChild(tdRank);

        const tdMode = document.createElement('td');
        const modeBadge = document.createElement('span');
        modeBadge.className = 'badge badge-tag';
        modeBadge.textContent = `${rec.base.toUpperCase()}-${rec.length}`;
        tdMode.appendChild(modeBadge);
        row.appendChild(tdMode);

        const tdAttempts = document.createElement('td');
        tdAttempts.textContent = `${rec.attempts} tries`;
        row.appendChild(tdAttempts);

        const tdTime = document.createElement('td');
        tdTime.textContent = formatDuration(rec.durationMs);
        row.appendChild(tdTime);

        const tdDate = document.createElement('td');
        tdDate.textContent = rec.date;
        row.appendChild(tdDate);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      card.appendChild(table);
    }

    return card;
  };

  render();
};
