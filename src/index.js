import './index.scss';
import { fromEvent, interval, range, of, iif } from 'rxjs';
import { map, takeWhile,
  tap, filter, take, concatMap, every, count, mergeMap,
  takeLast, delay, repeat, endWith } from 'rxjs/operators';

const query = q => document.querySelector(q),
  memory = query('#memory'),
  children = memory.children,
  rand = () => Math.floor(16 * Math.random()),
  randomizeSequence = n => [...Array(n)].map(() => rand() + 1),
  
  // flash operator
  flash = (time, a, b) => src => src.pipe(
    tap(em => em.className = a),
    delay(time),
    tap(em => em.className = b),
  ),

  // win-flash-sequence
  win = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4, 5, 
    6, 10, 9, 5, 6, 7, 11, 15, 14, 13, 12, 8, 4, 0, 1, 2, 3];

// assign index to data attribute
children.forEach((c, i) => c.dataset.index = i + 1);

range(1, 8).pipe(                            // main loop with 8 levels
  delay(500),
  concatMap(n => {
    const seq = randomizeSequence(n);

    return interval(500).pipe(                  // sequence to memorize
      take(n),
      map(i => children.item(seq[i] - 1)),
      flash(256, 'lit', ''),
      takeLast(1),
      mergeMap(() =>
        fromEvent(memory, 'click').pipe(                  // user input
          filter(click => click.target.dataset.index),
          take(n),
          map(evt => Number(evt.target.dataset.index)),
          every((e, i) => seq[i] === e),
        )
      )
    );
  }),
  takeWhile(Boolean),
  count(),
  mergeMap(lv =>                                          // end game
    iif(                                                // win / lose?
      () => lv === 8, 
      interval(35).pipe(
        take(win.length),
        map(i => children.item(win[i])),
        flash(50, 'lit strobo', 'strobo'),
        endWith('You mastered level ' + lv + '! Amazing!!!'),
        takeLast(1)
      ),
      of(memory).pipe(
        delay(200),
        flash(300, 'fail', ''),
        endWith(lv ? 'You mastered level ' + lv : 'Too bad!'),
        takeLast(1)
      )
    )
  ),
  repeat()
).subscribe(console.log);